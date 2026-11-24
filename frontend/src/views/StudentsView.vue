<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useStudentStore } from '../stores/students'
import StatusMessage from '../components/StatusMessage.vue'
import StudentTable from '../components/StudentTable.vue'

const store = useStudentStore()

const newStudent = reactive({ name: '', studentId: '', phone: '', zip: '' })
const addStatus = ref(null)
const adding = ref(false)

const searchName = ref('')
const searchResults = ref(null)
const searchStatus = ref(null)
const searching = ref(false)

const listStatus = ref(null)

onMounted(() => {
  store.fetchStudents()
})

async function handleAdd() {
  addStatus.value = null
  const student = {
    name: newStudent.name.trim(),
    studentId: newStudent.studentId.trim(),
    phone: newStudent.phone.trim(),
    zip: newStudent.zip.trim()
  }
  if (!student.name || !student.studentId || !student.phone || !student.zip) {
    addStatus.value = { type: 'error', message: 'Please fill in name, student ID, phone, and ZIP code.' }
    return
  }
  adding.value = true
  const result = await store.addStudent(student)
  adding.value = false
  if (result.success) {
    addStatus.value = { type: 'success', message: `Student ${student.name} added successfully.` }
    newStudent.name = ''
    newStudent.studentId = ''
    newStudent.phone = ''
    newStudent.zip = ''
  } else {
    addStatus.value = { type: 'error', message: result.error }
  }
}

async function handleSearch() {
  searchStatus.value = null
  searchResults.value = null
  const name = searchName.value.trim()
  if (!name) {
    searchStatus.value = { type: 'error', message: 'Please enter a name to search for.' }
    return
  }
  searching.value = true
  const result = await store.searchStudent(name)
  searching.value = false
  if (result.success) {
    searchResults.value = result.students
    if (result.students.length === 0) {
      searchStatus.value = { type: 'error', message: `No student named "${name}" was found.` }
    }
  } else {
    searchStatus.value = { type: 'error', message: result.error }
  }
}

async function handleDelete(studentId) {
  if (!confirm(`Delete student with ID ${studentId}? This will also remove their enrollments.`)) return
  listStatus.value = null
  const result = await store.deleteStudent(studentId)
  if (result.success) {
    listStatus.value = { type: 'success', message: `Student ${studentId} deleted.` }
    if (searchResults.value) {
      searchResults.value = searchResults.value.filter((s) => s.studentId !== studentId)
    }
  } else {
    listStatus.value = { type: 'error', message: result.error }
  }
}
</script>

<template>
  <section>
    <h2>Students</h2>

    <h3>Search for a Student</h3>
    <form @submit.prevent="handleSearch" novalidate>
      <label for="searchName">Student Name</label>
      <input id="searchName" v-model="searchName" type="text" autocomplete="off" />
      <button type="submit" :disabled="searching">{{ searching ? 'Searching...' : 'Search' }}</button>
    </form>
    <StatusMessage :status="searchStatus" />
    <StudentTable
      v-if="searchResults && searchResults.length > 0"
      :students="searchResults"
      show-delete
      caption="Search result"
      @delete="handleDelete"
    />

    <h3>Add a Student</h3>
    <form @submit.prevent="handleAdd" novalidate>
      <label for="addName">Name</label>
      <input id="addName" v-model="newStudent.name" type="text" required />

      <label for="addId">Student ID</label>
      <input id="addId" v-model="newStudent.studentId" type="text" required />

      <label for="addPhone">Phone</label>
      <input id="addPhone" v-model="newStudent.phone" type="tel" required />

      <label for="addZip">ZIP Code</label>
      <input id="addZip" v-model="newStudent.zip" type="text" inputmode="numeric" required />

      <button type="submit" :disabled="adding">{{ adding ? 'Adding...' : 'Add Student' }}</button>
    </form>
    <StatusMessage :status="addStatus" />

    <h3>All Students</h3>
    <StatusMessage :status="listStatus" />
    <p v-if="store.loading" role="status">Loading students...</p>
    <p v-else-if="store.error && store.students.length === 0" class="error-text" role="alert">{{ store.error }}</p>
    <p v-else-if="store.students.length === 0" class="empty-text">No students yet.</p>
    <StudentTable
      v-else
      :students="store.students"
      show-delete
      caption="All students"
      @delete="handleDelete"
    />
  </section>
</template>
