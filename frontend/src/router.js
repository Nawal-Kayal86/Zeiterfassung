import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import Admin from './views/Admin.vue'
import Billing from './views/billing.vue'
import NewUser from './views/NewUser.vue'

const routes = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: Dashboard }, // /  → Dashboard
      { path: 'admin', component: Admin }, // /admin
      { path: 'billing', component: Billing}, // /billing
     { path: 'newuser', component: NewUser, meta: { requiresAuth: true, requiresAdmin: true } }

    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Auth-Check
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || "null")

    if (!token) return next('/login')

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return next('/login')
      }

      // Admin-Check
      if (to.meta.requiresAdmin && user?.role !== 'admin') {
        return next('/') // kein Zugriff → zurück zum Dashboard
      }
    } catch (e) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return next('/login')
    }
  }
  next()
})


export default router
