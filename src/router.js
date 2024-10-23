import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Login from '@/views/Login.vue';
import Admin from '@/views/Admin.vue';
import Register from '@/views/Register.vue';


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/register', name: 'Register', component: Register },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
