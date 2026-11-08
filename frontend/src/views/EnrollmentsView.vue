<script setup>
import { onMounted, ref } from 'vue';
import { useRecordsStore } from '../stores/records';
import { api } from '../api';
import FeedbackMessage from '../components/FeedbackMessage.vue';

const store = useRecordsStore();
const studentId = ref('');
const courseId = ref('');
const rosterCourseId = ref('');
const roster = ref([]);
const loading = ref(false);
const rosterLoading = ref(false);
const saving = ref(false);
const message = ref('');
const error = ref('');
const rosterError = ref('');

async function load() {
  loading.value = true;
  error.value = '';
  try { await Promise.all([store.loadStudents(), store.loadCourses()]); }
  catch (err) { error.value = err.message; }
  finally { loading.value = false; }
}
async function showRoster() {
  roster.value = [];
  rosterError.value = '';
  if (!rosterCourseId.value) return;
  rosterLoading.value = true;
  try { roster.value = await api(`/courses/${rosterCourseId.value}/students`); }
  catch (err) { rosterError.value = err.message; }
  finally { rosterLoading.value = false; }
}
async function enroll() {
  message.value = '';
  error.value = '';
  if (!studentId.value || !courseId.value) {
    error.value = 'Select an existing student and course.';
    return;
  }
  saving.value = true;
  try {
    await api('/enrollments', {
      method: 'POST',
      body: JSON.stringify({ student: studentId.value, course: courseId.value })
    });
    message.value = 'Student enrolled.';
    if (rosterCourseId.value === courseId.value) await showRoster();
  } catch (err) { error.value = err.message; }
  finally { saving.value = false; }
}
onMounted(load);
</script>

<template>
  <div class="page-heading"><h1>Enrollments</h1><p>Assign students to courses and view each class roster.</p></div>
  <p v-if="loading" role="status">Loading students and courses…</p>
  <div class="grid">
    <section class="card">
      <h2>Enroll a student</h2>
      <form @submit.prevent="enroll">
        <label for="enroll-student">Student</label>
        <select id="enroll-student" v-model="studentId" required>
          <option value="">Select student</option>
          <option v-for="student in store.students" :key="student._id" :value="student._id">{{ student.name }} ({{ student.id }})</option>
        </select>
        <label for="enroll-course">Course</label>
        <select id="enroll-course" v-model="courseId" required>
          <option value="">Select course</option>
          <option v-for="course in store.courses" :key="course._id" :value="course._id">{{ course.name }} ({{ course.id }})</option>
        </select>
        <button :disabled="saving || loading || !store.students.length || !store.courses.length">{{ saving ? 'Enrolling…' : 'Enroll student' }}</button>
      </form>
      <p v-if="!loading && (!store.students.length || !store.courses.length)" class="muted">Add at least one student and one course first.</p>
      <FeedbackMessage :message="message" kind="success" />
      <FeedbackMessage :message="error" kind="error" />
    </section>
    <section class="card">
      <h2>Students in a course</h2>
      <label for="roster-course">Course</label>
      <select id="roster-course" v-model="rosterCourseId" @change="showRoster">
        <option value="">Select course</option>
        <option v-for="course in store.courses" :key="course._id" :value="course._id">{{ course.name }} ({{ course.id }})</option>
      </select>
      <p v-if="rosterLoading" role="status">Loading roster…</p>
      <FeedbackMessage :message="rosterError" kind="error" />
      <p v-if="!rosterLoading && rosterCourseId && !roster.length && !rosterError" class="muted">No students enrolled in this course.</p>
      <div v-if="!rosterLoading && roster.length" class="table-wrap">
        <table><thead><tr><th>Name</th><th>ID</th><th>Phone</th><th>ZIP</th></tr></thead>
          <tbody><tr v-for="student in roster" :key="student._id"><td>{{ student.name }}</td><td>{{ student.id }}</td><td>{{ student.phone }}</td><td>{{ student.zip }}</td></tr></tbody>
        </table>
      </div>
    </section>
  </div>
</template>
