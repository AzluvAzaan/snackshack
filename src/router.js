import { createRouter, createWebHistory } from 'vue-router';
<<<<<<< Updated upstream
import Home from '@/views/Home.vue';
import Map from '@/views/Map.vue';
import Wheel from '@/views/Wheel.vue';
import Test from '@/views/Test.vue';
import Review from '@/views/Review.vue';
import Login from '@/views/Login.vue';
import Admin from '@/views/Admin.vue';
import Register from '@/views/Register.vue';
import { auth } from '@/firebase'; //used to check if user is logged in



const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/map', name: 'Map', component: Map },
  { path: '/wheel', name: 'Wheel', component: Wheel },
  { path: '/test', name: 'Test', component: Test },
  { path: '/review', name: 'Review', component: Review },
=======
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
>>>>>>> Stashed changes
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
