<script setup>
import { onMounted, ref } from 'vue';
import { useRecordsStore } from '../stores/records';
import { api } from '../api';
import FeedbackMessage from '../components/FeedbackMessage.vue';

const store = useRecordsStore();
const form = ref({ id: '', name: '' });
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
async function load() {
  loading.value = true;
  error.value = '';
  try { await store.loadCourses(); }
  catch (err) { error.value = err.message; }
  finally { loading.value = false; }
}
async function add() {
  message.value = '';
  error.value = '';
  if (!form.value.id.trim() || !form.value.name.trim()) {
    error.value = 'Enter a course ID and name.';
    return;
  }
  saving.value = true;
  try {
    await api('/courses', { method: 'POST', body: JSON.stringify(form.value) });
    form.value = { id: '', name: '' };
    message.value = 'Course added.';
    await load();
  } catch (err) { error.value = err.message; }
  finally { saving.value = false; }
}
async function remove(course) {
  if (!confirm(`Delete ${course.id}?`)) return;
  message.value = '';
  error.value = '';
  try {
    await api(`/courses/${course._id}`, { method: 'DELETE' });
    message.value = 'Course deleted. Its enrollments were removed too.';
    await load();
  } catch (err) { error.value = err.message; }
}
onMounted(load);
</script>

<template>
  <div class="page-heading"><h1>Courses</h1><p>Add courses and review the course list.</p></div>
  <div class="grid">
    <section class="card">
      <h2>Add a course</h2>
      <form @submit.prevent="add">
        <label for="course-id">Course ID</label>
        <input id="course-id" v-model.trim="form.id" placeholder="CIS 3339" required />
        <label for="course-name">Course name</label>
        <input id="course-name" v-model.trim="form.name" required />
        <button :disabled="saving">{{ saving ? 'Adding…' : 'Add course' }}</button>
      </form>
      <FeedbackMessage :message="message" kind="success" />
      <FeedbackMessage :message="error" kind="error" />
    </section>
    <section class="card">
      <h2>Course list</h2>
      <p v-if="loading" role="status">Loading courses…</p>
      <p v-else-if="!store.courses.length" class="muted">No courses yet.</p>
      <div v-else class="table-wrap">
        <table><thead><tr><th>Course ID</th><th>Name</th><th>Action</th></tr></thead>
          <tbody><tr v-for="course in store.courses" :key="course._id">
            <td>{{ course.id }}</td><td>{{ course.name }}</td>
            <td><button class="danger" @click="remove(course)">Delete</button></td>
          </tr></tbody>
        </table>
      </div>
    </section>
  </div>
</template>
