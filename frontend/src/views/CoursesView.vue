<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useCourseStore } from '../stores/courses'
import StatusMessage from '../components/StatusMessage.vue'
import CourseTable from '../components/CourseTable.vue'

const store = useCourseStore()
const newCourse = reactive({ courseId: '', courseName: '' })
const addStatus = ref(null)
const adding = ref(false)
const listStatus = ref(null)

onMounted(() => {
  store.fetchCourses()
})

async function handleAdd() {
  addStatus.value = null
  const course = {
    courseId: newCourse.courseId.trim(),
    courseName: newCourse.courseName.trim()
  }
  if (!course.courseId || !course.courseName) {
    addStatus.value = { type: 'error', message: 'Please fill in both course ID and course name.' }
    return
  }
  adding.value = true
  const result = await store.addCourse(course)
  adding.value = false
  if (result.success) {
    addStatus.value = { type: 'success', message: `Course ${course.courseId} added successfully.` }
    newCourse.courseId = ''
    newCourse.courseName = ''
  } else {
    addStatus.value = { type: 'error', message: result.error }
  }
}

async function handleDelete(courseId) {
  if (!confirm(`Delete course ${courseId}? This will also remove its enrollments.`)) return
  listStatus.value = null
  const result = await store.deleteCourse(courseId)
  if (result.success) {
    listStatus.value = { type: 'success', message: `Course ${courseId} and its enrollments deleted.` }
  } else {
    listStatus.value = { type: 'error', message: result.error }
  }
}
</script>

<template>
  <section>
    <h2>Courses</h2>

    <h3>Add a Course</h3>
    <form @submit.prevent="handleAdd" novalidate>
      <label for="courseId">Course ID</label>
      <input id="courseId" v-model="newCourse.courseId" type="text" placeholder="e.g. CIS 3339" required />

      <label for="courseName">Course Name</label>
      <input id="courseName" v-model="newCourse.courseName" type="text" required />

      <button type="submit" :disabled="adding">{{ adding ? 'Adding...' : 'Add Course' }}</button>
    </form>
    <StatusMessage :status="addStatus" />

    <h3>All Courses</h3>
    <StatusMessage :status="listStatus" />
    <p v-if="store.loading" role="status">Loading courses...</p>
    <p v-else-if="store.error && store.courses.length === 0" class="error-text" role="alert">{{ store.error }}</p>
    <p v-else-if="store.courses.length === 0" class="empty-text">No courses yet.</p>
    <CourseTable v-else :courses="store.courses" @delete="handleDelete" />
  </section>
</template>
