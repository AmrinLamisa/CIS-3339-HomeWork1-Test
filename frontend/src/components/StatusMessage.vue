<script setup>
defineProps({
  status: { type: Object, default: null }
})
</script>

<template>
  <p
    v-if="status"
    :class="status.type === 'success' ? 'success-text' : 'error-text'"
    :role="status.type === 'success' ? 'status' : 'alert'"
    aria-live="polite"
  >
    {{ status.message }}
  </p>
</template>
