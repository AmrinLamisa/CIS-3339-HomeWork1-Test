import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useCourseStore = defineStore('courses', () => {
    const courses = ref([])
    const loading = ref(false)
    const error = ref(null)

    async function fetchCourses() {
        loading.value = true
        error.value = null
        try {
            const res = await api.get('/courses')
            courses.value = res.data
        } catch (err) {
            error.value = err.response?.data?.error || 'Failed to load courses'
        } finally {
            loading.value = false
        }
    }

    async function addCourse(course) {
        error.value = null
        try {
            const res = await api.post('/courses', course)
            courses.value.push(res.data)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to add course'
            error.value = message
            return { success: false, error: message }
        }
    }

    async function deleteCourse(courseId) {
        error.value = null
        try {
            await api.delete(`/courses/${courseId}`)
            courses.value = courses.value.filter((c) => c.courseId !== courseId)
            return { success: true }
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to delete course'
            error.value = message
            return { success: false, error: message }
        }
    }

    return { courses, loading, error, fetchCourses, addCourse, deleteCourse }
})
