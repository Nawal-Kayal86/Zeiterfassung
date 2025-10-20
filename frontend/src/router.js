import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import Admin from './views/Admin.vue'
import Billing from './views/Billing.vue'
import NewUser from './views/NewUser.vue'
import Kalender from './views/Kalender.vue'   
import Attendance from './views/Attendance.vue'   
import Errors from './views/Errors.vue'
import Terminal from './views/Terminal.vue'
import Workflow from './views/Workflow.vue'
import Schedule from './views/Dienstplan.vue'
import Reports from './views/Berichte.vue'

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
      { path: '', component: Dashboard }, // default: '/' zeigt Dashboard
      { path: 'dashboard', component: Dashboard }, // auch erreichbar unter '/dashboard'
      { path: 'admin', component: Admin }, // admin
      { path: 'billing', component: Billing }, // billing
      { path: 'newuser', component: NewUser, meta: { requiresAuth: true, requiresAdmin: true } }, // newuser
      { path: 'kalender', component: Kalender }, // kalender
      { path: 'attendance', component: Attendance }, // attendance
      { path: 'errors', component: Errors }, // errors
      { path: 'terminal', component: Terminal }, // terminal
      { path: 'workflow', component: Workflow }, // workflow
      { path: 'schedule', component: Schedule }, // dienstplan
      { path: 'reports', component: Reports } // berichte
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
