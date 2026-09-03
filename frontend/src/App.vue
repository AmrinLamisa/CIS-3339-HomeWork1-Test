<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Student Management System</h1>
      <nav class="app-nav">
        <RouterLink to="/students">Students</RouterLink>
        <RouterLink to="/courses">Courses</RouterLink>
        <RouterLink to="/enrollments">Enrollments</RouterLink>
      </nav>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}
.app-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.app-nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.app-nav a {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  background: #eee;
}
.app-nav a.router-link-active {
  background: #333;
  color: #fff;
}
</style>
