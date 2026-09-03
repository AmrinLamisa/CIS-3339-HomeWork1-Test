import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useStudentStore = defineStore('students', () => {
    const students = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchStudents() {
        loading.value = true
        error.value = null
        try {
            const res = await api.get('/students')
            students.value = res.data
        } catch (err) {
            error.value = err.response?.data?.error || 'Failed to load students'
        } finally {
            loading.value = false
        }
    }

    async function addStudent(student) {
        error.value = null
        try {
            const res = await api.post('/students', student)
            students.value.push(res.data)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to add student'
            error.value = message
            return { success: false, error: message }
        }
    }

    async function deleteStudent(studentId) {
        error.value = null
        try {
            await api.delete(`/students/${studentId}`)
            students.value = students.value.filter((s) => s.studentId !== studentId)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to delete student'
            error.value = message
            return { success: false, error: message }
        }
    }

    async function searchStudent(name) {
        error.value = null
        try {
            const res = await api.get('/students/search', { params: { name } })
            return { success: true, student: res.data }
        } catch (err) {
            const message = err.response?.data?.error || 'Student not found'
            error.value = message
            return { success: false, error: message }
        }
    }

    return { students, loading, error, fetchStudents, addStudent, deleteStudent, searchStudent }
})
