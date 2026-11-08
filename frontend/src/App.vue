<template>
  <div class="shell">
    <header>
      <div class="brand">CIS 3339 <span>Student Management</span></div>
      <nav aria-label="Main navigation">
        <RouterLink to="/students">Students</RouterLink>
        <RouterLink to="/courses">Courses</RouterLink>
        <RouterLink to="/enrollments">Enrollments</RouterLink>
      </nav>
    </header>
    <main><RouterView /></main>
  </div>
</template>
