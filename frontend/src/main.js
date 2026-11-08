import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import StudentsView from './views/StudentsView.vue';
import CoursesView from './views/CoursesView.vue';
import EnrollmentsView from './views/EnrollmentsView.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/students' },
    { path: '/students', component: StudentsView },
    { path: '/courses', component: CoursesView },
    { path: '/enrollments', component: EnrollmentsView }
  ]
});

createApp(App).use(createPinia()).use(router).mount('#app');
