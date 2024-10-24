import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Test from '@/views/Test.vue';
import Review from '@/views/Review.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/test', name: 'Test', component: Test },
  { path: '/review', name: 'Review', component: Review },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
