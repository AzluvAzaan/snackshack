import { createRouter, createWebHistory } from 'vue-router';
<<<<<<< Updated upstream
<<<<<<< Updated upstream
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Test from '@/views/Test.vue';
import Review from '@/views/Review.vue';
import Login from '@/views/Login.vue';
import Admin from '@/views/Admin.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/test', name: 'Test', component: Test },
  { path: '/review', name: 'Review', component: Review },
=======
=======
>>>>>>> Stashed changes
import Home from './views/Home.vue';
import Review from './components/review.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/review',
    name: 'Review',
    component: Review,
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'Admin', component: Admin },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
