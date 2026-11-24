<script setup>
defineProps({
  courses: { type: Array, required: true }
})

const emit = defineEmits(['delete'])
</script>

<template>
  <div class="table-wrap">
    <table>
      <caption class="sr-only">All courses</caption>
      <thead>
        <tr>
          <th scope="col">Course ID</th>
          <th scope="col">Course Name</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in courses" :key="c.courseId">
          <td>{{ c.courseId }}</td>
          <td>{{ c.courseName }}</td>
          <td>
            <button
              type="button"
              class="danger"
              :aria-label="`Delete course ${c.courseId}`"
              @click="emit('delete', c.courseId)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
