import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useEnrollmentStore = defineStore('enrollments', () => {
    const roster = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function enroll(studentId, courseId) {
        try {
            // Check the course's current roster first so a duplicate never reaches the server
            const current = await api.get('/enrollments', { params: { courseId } })
            if (current.data.some((s) => s.studentId === studentId)) {
                return { success: false, error: `This student is already enrolled in ${courseId}` }
            }
            await api.post('/enrollments', { studentId, courseId })
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to enroll student'
            return { success: false, error: message }
        }
    }

    async function fetchRoster(courseId) {
        loading.value = true
        error.value = null
        try {
            const res = await api.get('/enrollments', { params: { courseId } })
            roster.value = res.data
        } catch (err) {
            roster.value = []
            error.value = err.response?.data?.error || 'Failed to load roster'
        } finally {
            loading.value = false
        }
    }

    function clearRoster() {
        roster.value = []
        error.value = null
    }

    return { roster, loading, error, enroll, fetchRoster, clearRoster }
})
