<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRecordsStore } from '../stores/records';
import { api } from '../api';
import FeedbackMessage from '../components/FeedbackMessage.vue';

const store = useRecordsStore();
const form = ref({ name: '', id: '', phone: '', zip: '' });
const search = ref('');
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
const shown = computed(() => store.students.filter((student) =>
  student.name.toLowerCase().includes(search.value.trim().toLowerCase())));

async function load() {
  loading.value = true;
  error.value = '';
  try { await store.loadStudents(); }
  catch (err) { error.value = err.message; }
  finally { loading.value = false; }
}
async function add() {
  message.value = '';
  error.value = '';
  if (Object.values(form.value).some((value) => !value.trim())) {
    error.value = 'Complete all student fields.';
    return;
  }
  saving.value = true;
  try {
    await api('/students', { method: 'POST', body: JSON.stringify(form.value) });
    form.value = { name: '', id: '', phone: '', zip: '' };
    message.value = 'Student added.';
    await load();
  } catch (err) { error.value = err.message; }
  finally { saving.value = false; }
}
async function remove(student) {
  if (!confirm(`Delete ${student.name}?`)) return;
  message.value = '';
  error.value = '';
  try {
    await api(`/students/${student._id}`, { method: 'DELETE' });
    message.value = 'Student deleted. Their enrollments were removed too.';
    await load();
  } catch (err) { error.value = err.message; }
}
onMounted(load);
</script>

<template>
  <div class="page-heading"><h1>Students</h1><p>Add, find, and manage students.</p></div>
  <div class="grid">
    <section class="card">
      <h2>Add a student</h2>
      <form @submit.prevent="add">
        <label for="student-name">Name</label>
        <input id="student-name" v-model.trim="form.name" required />
        <label for="student-id">Student ID</label>
        <input id="student-id" v-model.trim="form.id" required />
        <label for="student-phone">Phone number</label>
        <input id="student-phone" v-model.trim="form.phone" type="tel" required />
        <label for="student-zip">ZIP code</label>
        <input id="student-zip" v-model.trim="form.zip" inputmode="numeric" required />
        <button :disabled="saving">{{ saving ? 'Adding…' : 'Add student' }}</button>
      </form>
      <FeedbackMessage :message="message" kind="success" />
      <FeedbackMessage :message="error" kind="error" />
    </section>
    <section class="card">
      <h2>Find students</h2>
      <label for="student-search">Search by name</label>
      <input id="student-search" v-model="search" type="search" placeholder="Enter a name" />
      <p v-if="loading" role="status">Loading students…</p>
      <p v-else-if="!shown.length" class="muted">No students found.</p>
      <div v-else class="table-wrap">
        <table><thead><tr><th>Name</th><th>ID</th><th>Phone</th><th>ZIP</th><th>Action</th></tr></thead>
          <tbody><tr v-for="student in shown" :key="student._id">
            <td>{{ student.name }}</td><td>{{ student.id }}</td><td>{{ student.phone }}</td><td>{{ student.zip }}</td>
            <td><button class="danger" @click="remove(student)">Delete</button></td>
          </tr></tbody>
        </table>
      </div>
    </section>
  </div>
</template>
