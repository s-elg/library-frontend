import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  { 
    path: '/login',  
    name: 'login', 
    component: AuthView, 
    meta: { initialMode: 'login' } 
  },
  {  
    path: '/register', 
    name: 'register', 
    component: AuthView, 
    meta: { initialMode: 'register' } 
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router