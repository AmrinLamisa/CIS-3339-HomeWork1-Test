<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useStudentStore } from '../stores/students'

const store = useStudentStore()

const newStudent = reactive({ name: '', studentId: '', phone: '', zip: '' })
const addStatus = ref(null)

const searchName = ref('')
const searchResult = ref(null)
const searchStatus = ref(null)

onMounted(() => {
  store.fetchStudents()
})

async function handleAdd() {
  addStatus.value = null
  const result = await store.addStudent({ ...newStudent })
  if (result.success) {
    addStatus.value = { type: 'success', message: 'Student added successfully.' }
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
  searchResult.value = null
  const result = await store.searchStudent(searchName.value)
  if (result.success) {
    searchResult.value = result.student
  } else {
    searchStatus.value = result.error
  }
}

async function handleDelete(studentId) {
  if (!confirm(`Delete student with ID ${studentId}?`)) return
  await store.deleteStudent(studentId)
  if (searchResult.value?.studentId === studentId) {
    searchResult.value = null
  }
}
</script>

<template>
  <section>
    <h1>Students</h1>

    <h2>Search for a Student</h2>
    <form @submit.prevent="handleSearch">
      <label for="searchName">Student Name</label>
      <input id="searchName" v-model="searchName" type="text" required />
      <button type="submit">Search</button>
    </form>
    <p v-if="searchStatus" class="error-text">{{ searchStatus }}</p>
    <table v-if="searchResult">
      <thead>
        <tr><th>Name</th><th>ID</th><th>Phone</th><th>Zip</th><th>Action</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ searchResult.name }}</td>
          <td>{{ searchResult.studentId }}</td>
          <td>{{ searchResult.phone }}</td>
          <td>{{ searchResult.zip }}</td>
          <td><button type="button" @click="handleDelete(searchResult.studentId)">Delete</button></td>
        </tr>
      </tbody>
    </table>

    <h2>Add a Student</h2>
    <form @submit.prevent="handleAdd">
      <label for="addName">Name</label>
      <input id="addName" v-model="newStudent.name" type="text" required />

      <label for="addId">Student ID</label>
      <input id="addId" v-model="newStudent.studentId" type="text" required />

      <label for="addPhone">Phone</label>
      <input id="addPhone" v-model="newStudent.phone" type="text" required />

      <label for="addZip">Zip Code</label>
      <input id="addZip" v-model="newStudent.zip" type="text" required />

      <button type="submit">Add Student</button>
    </form>
    <p v-if="addStatus" :class="addStatus.type === 'success' ? 'success-text' : 'error-text'">
      {{ addStatus.message }}
    </p>

    <h2>All Students</h2>
    <p v-if="store.loading">Loading students...</p>
    <p v-else-if="store.students.length === 0" class="empty-text">No students yet.</p>
    <table v-else>
      <thead>
        <tr><th>Name</th><th>ID</th><th>Phone</th><th>Zip</th><th>Action</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in store.students" :key="s.studentId">
          <td>{{ s.name }}</td>
          <td>{{ s.studentId }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.zip }}</td>
          <td><button type="button" @click="handleDelete(s.studentId)">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
