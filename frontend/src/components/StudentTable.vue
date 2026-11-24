<script setup>
defineProps({
  students: { type: Array, required: true },
  showDelete: { type: Boolean, default: false },
  caption: { type: String, default: '' }
})

const emit = defineEmits(['delete'])
</script>

<template>
  <div class="table-wrap">
    <table>
      <caption v-if="caption" class="sr-only">{{ caption }}</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Student ID</th>
          <th scope="col">Phone</th>
          <th scope="col">ZIP Code</th>
          <th v-if="showDelete" scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.studentId">
          <td>{{ s.name }}</td>
          <td>{{ s.studentId }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.zip }}</td>
          <td v-if="showDelete">
            <button
              type="button"
              class="danger"
              :aria-label="`Delete student ${s.name}`"
              @click="emit('delete', s.studentId)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
