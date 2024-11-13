import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Review from '@/views/Review.vue';
import Login from '@/views/Login.vue';
import Admin from '@/views/Admin.vue';
import Register from '@/views/Register.vue';
import { auth } from '@/firebase'; //used to check if user is logged in


const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/review', name: 'Review', component: Review },
  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/register', name: 'Register', component: Register}
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// To check if user is logged in before accessing admin page
// incase user types in the url/admin
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  auth.onAuthStateChanged((user) => {
    if (requiresAuth && !user) {
      next('/login');
    } else {
      next();
    }
  });
});

export default router;
