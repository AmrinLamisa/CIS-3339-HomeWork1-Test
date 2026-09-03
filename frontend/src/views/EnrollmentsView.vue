<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStudentStore } from '../stores/students'
import { useCourseStore } from '../stores/courses'
import { useEnrollmentStore } from '../stores/enrollments'

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const enrollmentStore = useEnrollmentStore()

const selectedStudentId = ref('')
const selectedCourseId = ref('')
const enrollStatus = ref(null)

const rosterCourseId = ref('')

onMounted(() => {
  studentStore.fetchStudents()
  courseStore.fetchCourses()
})

async function handleEnroll() {
  enrollStatus.value = null
  const result = await enrollmentStore.enroll(selectedStudentId.value, selectedCourseId.value)
  if (result.success) {
    enrollStatus.value = { type: 'success', message: 'Student enrolled successfully.' }
  } else {
    enrollStatus.value = { type: 'error', message: result.error }
  }
}

function handleRosterLookup() {
  if (rosterCourseId.value) {
    enrollmentStore.fetchRoster(rosterCourseId.value)
  }
}

const hasStudentsAndCourses = computed(
  () => studentStore.students.length > 0 && courseStore.courses.length > 0
)
</script>

<template>
  <section>
    <h1>Enrollments</h1>

    <h2>Enroll a Student in a Course</h2>
    <p v-if="!hasStudentsAndCourses" class="empty-text">
      Add at least one student and one course before enrolling.
    </p>
    <form v-else @submit.prevent="handleEnroll">
      <label for="enrollStudent">Student</label>
      <select id="enrollStudent" v-model="selectedStudentId" required>
        <option disabled value="">Select a student</option>
        <option v-for="s in studentStore.students" :key="s.studentId" :value="s.studentId">
          {{ s.name }} ({{ s.studentId }})
        </option>
      </select>

      <label for="enrollCourse">Course</label>
      <select id="enrollCourse" v-model="selectedCourseId" required>
        <option disabled value="">Select a course</option>
        <option v-for="c in courseStore.courses" :key="c.courseId" :value="c.courseId">
          {{ c.courseName }} ({{ c.courseId }})
        </option>
      </select>

      <button type="submit">Enroll</button>
    </form>
    <p v-if="enrollStatus" :class="enrollStatus.type === 'success' ? 'success-text' : 'error-text'">
      {{ enrollStatus.message }}
    </p>

    <h2>View Course Roster</h2>
    <form @submit.prevent="handleRosterLookup">
      <label for="rosterCourse">Course</label>
      <select id="rosterCourse" v-model="rosterCourseId" required>
        <option disabled value="">Select a course</option>
        <option v-for="c in courseStore.courses" :key="c.courseId" :value="c.courseId">
          {{ c.courseName }} ({{ c.courseId }})
        </option>
      </select>
      <button type="submit">View Roster</button>
    </form>

    <p v-if="enrollmentStore.loading">Loading roster...</p>
    <p v-else-if="rosterCourseId && enrollmentStore.roster.length === 0" class="empty-text">
      No students enrolled in this course.
    </p>
    <table v-else-if="enrollmentStore.roster.length > 0">
      <thead>
        <tr><th>Name</th><th>Student ID</th><th>Phone</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in enrollmentStore.roster" :key="s.studentId">
          <td>{{ s.name }}</td>
          <td>{{ s.studentId }}</td>
          <td>{{ s.phone }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
