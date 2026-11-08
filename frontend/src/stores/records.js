import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api';

export const useRecordsStore = defineStore('records', () => {
  const students = ref([]);
  const courses = ref([]);
  async function loadStudents() { students.value = await api('/students'); }
  async function loadCourses() { courses.value = await api('/courses'); }
  return { students, courses, loadStudents, loadCourses };
});
