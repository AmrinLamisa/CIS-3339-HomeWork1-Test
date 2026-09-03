import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useEnrollmentStore = defineStore('enrollments', () => {
    const roster = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function enroll(studentId, courseId) {
        error.value = null
        try {
            await api.post('/enrollments', { studentId, courseId })
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to enroll student'
            error.value = message
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
            error.value = err.response?.data?.error || 'Failed to load roster'
        } finally {
            loading.value = false
        }
    }

    return { roster, loading, error, enroll, fetchRoster }
})
