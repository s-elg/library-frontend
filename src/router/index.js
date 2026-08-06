import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import CatalogView from '../views/CatalogView.vue'
import BookDetailView from '../views/BookDetailView.vue'
import MyBooksView from '../views/MyBooksView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'Catalog',
    component: CatalogView,
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: AuthView,
    meta: { initialMode: 'login' },
  },
  {
    path: '/register',
    name: 'register',
    component: AuthView,
    meta: { initialMode: 'register' },
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: BookDetailView,
    meta: { requiresAuth: false },
  },
  {
    path: '/my-books',
    name: 'MyBooks',
    component: MyBooksView,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router