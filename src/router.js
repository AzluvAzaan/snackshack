import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Login from '@/views/Login.vue';
import Admin from '@/views/Admin.vue';
import Register from '@/views/Register.vue';
import { auth } from '@/firebase'; //used to check if user is logged in



const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'Admin', component: Admin },
  { path: '/register', name: 'Register', component: Register, meta: { requiresAuth: true } },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// To check if user is logged in before accessing admin page
// incase user types in the url/admin
// https://router.vuejs.org/guide/advanced/navigation-guards.html
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router;
