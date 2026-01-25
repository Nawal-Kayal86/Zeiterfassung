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
import Departments from './views/DepartmentsAdmin.vue'
import Config from './views/Config.vue'
import LeaveRequest  from "./views/LeaveRequest.vue"  
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
      { path: '', component: Dashboard, meta: { title: '📊 Dashboard' } },
      { path: 'dashboard', component: Dashboard, meta: { title: '📊 Dashboard' } },
      { path: 'admin', component: Admin, meta: { title: '👨‍💼 Admin' } },
      { path: 'billing', component: Billing, meta: { title: '🧾 Abrechnungsliste' } },
      { path: 'newuser', component: NewUser, meta: { requiresAuth: true, requiresAdmin: true, title: '👤 User-Verwaltung' } },
      { path: 'kalender', component: Kalender, meta: { title: '📅 Kalender' } },
      { path: 'attendance', component: Attendance, meta: { title: '👥 Anwesenheitsübersicht' } },
      { path: 'errors', component: Errors, meta: { title: '⚠️ Fehlerprotokoll' } },
      { path: 'terminal', component: Terminal, meta: { title: '💻 Terminal' } },
      { path: 'workflow', component: Workflow, meta: { title: '🔄 Workflow' } },
      { path: "leave-request", component: LeaveRequest, meta: { title: '🌴 Urlaubsantrag' } },
      { path: "leave-approval", component: LeaveApproval, meta: { requiresAuth: true, requiresAdmin: true, title: '✅ Urlaubsfreigabe' } },
      { path: 'schedule', component: Schedule, meta: { title: '📅 Dienstplan' } },
      { path: 'reports', component: Reports, meta: { title: '📈 Berichte' } },
      { path: 'departments', component: Departments, meta: { requiresAuth: true, requiresAdmin: true, title: '🏢 Abteilungen' } },
      { path: 'config', component: Config, meta: { requiresAuth: true, requiresAdmin: true, title: '⚙️ Hardware / Webserver' } }
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
