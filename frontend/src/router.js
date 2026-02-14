import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import Admin from './views/Admin.vue'
import Billing from './views/Billing.vue'
import NewUser from './views/NewUser.vue'
import Kalender from './views/Kalender.vue'

import Errors from './views/Errors.vue'
import Terminal from './views/Terminal.vue'
import Workflow from './views/Workflow.vue'
import Schedule from './views/Dienstplan.vue'
import Reports from './views/Berichte.vue'
import Departments from './views/DepartmentsAdmin.vue'
import Config from './views/Config.vue'
import LeaveRequest from "./views/LeaveRequest.vue"
import LeaveApproval from "./views/LeaveApproval.vue"

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
      { path: '', component: Dashboard, meta: { title: 'Dashboard', icon: 'bi-clock-history' } },
      { path: 'dashboard', component: Dashboard, meta: { title: 'Dashboard', icon: 'bi-clock-history' } },
      { path: 'admin', component: Admin, meta: { title: 'Admin', icon: 'bi-person-badge-fill' } },
      { path: 'billing', component: Billing, meta: { title: 'Abrechnungsliste', icon: 'bi-receipt-cutoff' } },
      { path: 'newuser', component: NewUser, meta: { requiresAuth: true, requiresAdmin: true, title: 'User-Verwaltung', icon: 'bi-people-fill' } },
      { path: 'kalender', component: Kalender, meta: { title: 'Kalender', icon: 'bi-calendar3-event-fill' } },

      { path: 'errors', component: Errors, meta: { title: 'Fehlerprotokoll', icon: 'bi-exclamation-triangle-fill' } },
      { path: 'terminal', component: Terminal, meta: { title: 'Terminal', icon: 'bi-pc-display-horizontal' } },
      { path: 'workflow', component: Workflow, meta: { title: 'Arzttermine', icon: 'bi-hospital' } },
      { path: "leave-request", component: LeaveRequest, meta: { title: 'Urlaubsantrag', icon: 'bi-sun-fill' } },
      { path: "leave-approval", component: LeaveApproval, meta: { requiresAuth: true, requiresAdmin: true, title: 'Urlaubsfreigabe', icon: 'bi-clipboard2-check' } },
      { path: 'schedule', component: Schedule, meta: { title: 'Dienstplan', icon: 'bi-calendar-date-fill' } },
      { path: 'reports', component: Reports, meta: { title: 'Berichte', icon: 'bi-graph-up-arrow' } },
      { path: 'departments', component: Departments, meta: { requiresAuth: true, requiresAdmin: true, title: 'Abteilungen', icon: 'bi-building-fill' } },
      { path: 'config', component: Config, meta: { requiresAuth: true, requiresAdmin: true, title: 'Feiertage & Ferien', icon: 'bi-calendar-range' } }
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
