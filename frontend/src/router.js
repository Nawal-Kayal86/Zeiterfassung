import { createRouter, createWebHistory } from 'vue-router'
import Layout from './components/Layout.vue'
import Dashboard from './views/Dashboard.vue'
import Login from './views/Login.vue'
import Admin from './views/Admin.vue'
import MyWorkSessions from './views/MyWorkSessions.vue'

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
      { path: 'myworksessions', component: MyWorkSessions } // /myworksessions
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
    if (!token) return next('/login')

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return next('/login')
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
