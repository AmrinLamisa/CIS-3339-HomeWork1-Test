<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useCourseStore } from '../stores/courses'

const store = useCourseStore()
const newCourse = reactive({ courseId: '', courseName: '' })
const addStatus = ref(null)

onMounted(() => {
  store.fetchCourses()
})

async function handleAdd() {
  addStatus.value = null
  const result = await store.addCourse({ ...newCourse })
  if (result.success) {
    addStatus.value = { type: 'success', message: 'Course added successfully.' }
    newCourse.courseId = ''
    newCourse.courseName = ''
  } else {
    addStatus.value = { type: 'error', message: result.error }
  }
}

async function handleDelete(courseId) {
  if (!confirm(`Delete course ${courseId}? This will also remove its enrollments.`)) return
  await store.deleteCourse(courseId)
}
</script>

<template>
  <section>
    <h1>Courses</h1>

    <h2>Add a Course</h2>
    <form @submit.prevent="handleAdd">
      <label for="courseId">Course ID</label>
      <input id="courseId" v-model="newCourse.courseId" type="text" required />

      <label for="courseName">Course Name</label>
      <input id="courseName" v-model="newCourse.courseName" type="text" required />

      <button type="submit">Add Course</button>
    </form>
    <p v-if="addStatus" :class="addStatus.type === 'success' ? 'success-text' : 'error-text'">
      {{ addStatus.message }}
    </p>

    <h2>All Courses</h2>
    <p v-if="store.loading">Loading courses...</p>
    <p v-else-if="store.courses.length === 0" class="empty-text">No courses yet.</p>
    <table v-else>
      <thead>
        <tr><th>Course ID</th><th>Course Name</th><th>Action</th></tr>
      </thead>
      <tbody>
        <tr v-for="c in store.courses" :key="c.courseId">
          <td>{{ c.courseId }}</td>
          <td>{{ c.courseName }}</td>
          <td><button type="button" @click="handleDelete(c.courseId)">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
