<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStudentStore } from '../stores/students'
import { useCourseStore } from '../stores/courses'
import { useEnrollmentStore } from '../stores/enrollments'
import StatusMessage from '../components/StatusMessage.vue'
import StudentTable from '../components/StudentTable.vue'

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const enrollmentStore = useEnrollmentStore()

const selectedStudentId = ref('')
const selectedCourseId = ref('')
const enrollStatus = ref(null)
const enrolling = ref(false)

const rosterCourseId = ref('')
const rosterLoaded = ref(false)

onMounted(() => {
  enrollmentStore.clearRoster()
  studentStore.fetchStudents()
  courseStore.fetchCourses()
})

const dataLoading = computed(() => studentStore.loading || courseStore.loading)
const hasStudentsAndCourses = computed(
  () => studentStore.students.length > 0 && courseStore.courses.length > 0
)
const rosterCourseName = computed(() => {
  const c = courseStore.courses.find((course) => course.courseId === rosterCourseId.value)
  return c ? `${c.courseId} – ${c.courseName}` : ''
})

async function handleEnroll() {
  enrollStatus.value = null
  if (!selectedStudentId.value || !selectedCourseId.value) {
    enrollStatus.value = { type: 'error', message: 'Please select both a student and a course.' }
    return
  }
  enrolling.value = true
  const result = await enrollmentStore.enroll(selectedStudentId.value, selectedCourseId.value)
  enrolling.value = false
  if (result.success) {
    enrollStatus.value = { type: 'success', message: 'Student enrolled successfully.' }
    if (rosterLoaded.value && rosterCourseId.value === selectedCourseId.value) {
      enrollmentStore.fetchRoster(rosterCourseId.value)
    }
  } else {
    enrollStatus.value = { type: 'error', message: result.error }
  }
}

async function handleRosterLookup() {
  if (!rosterCourseId.value) return
  await enrollmentStore.fetchRoster(rosterCourseId.value)
  rosterLoaded.value = true
}
</script>

<template>
  <section>
    <h2>Enrollments</h2>

    <p v-if="dataLoading" role="status">Loading students and courses...</p>
    <template v-else>
      <h3>Enroll a Student in a Course</h3>
      <p v-if="!hasStudentsAndCourses" class="empty-text">
        Add at least one student and one course before enrolling.
      </p>
      <form v-else @submit.prevent="handleEnroll" novalidate>
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
            {{ c.courseId }} – {{ c.courseName }}
          </option>
        </select>

        <button type="submit" :disabled="enrolling">{{ enrolling ? 'Enrolling...' : 'Enroll' }}</button>
      </form>
      <StatusMessage :status="enrollStatus" />

      <h3>View Course Roster</h3>
      <p v-if="courseStore.courses.length === 0" class="empty-text">No courses yet.</p>
      <form v-else @submit.prevent="handleRosterLookup" novalidate>
        <label for="rosterCourse">Course</label>
        <select id="rosterCourse" v-model="rosterCourseId" required @change="rosterLoaded = false">
          <option disabled value="">Select a course</option>
          <option v-for="c in courseStore.courses" :key="c.courseId" :value="c.courseId">
            {{ c.courseId }} – {{ c.courseName }}
          </option>
        </select>
        <button type="submit" :disabled="!rosterCourseId || enrollmentStore.loading">View Roster</button>
      </form>

      <p v-if="enrollmentStore.loading" role="status">Loading roster...</p>
      <p v-else-if="enrollmentStore.error" class="error-text" role="alert">{{ enrollmentStore.error }}</p>
      <template v-else-if="rosterLoaded">
        <p v-if="enrollmentStore.roster.length === 0" class="empty-text">
          No students enrolled in {{ rosterCourseName }}.
        </p>
        <template v-else>
          <p>{{ enrollmentStore.roster.length }} student(s) enrolled in {{ rosterCourseName }}:</p>
          <StudentTable :students="enrollmentStore.roster" :caption="`Roster for ${rosterCourseName}`" />
        </template>
      </template>
    </template>
  </section>
</template>
