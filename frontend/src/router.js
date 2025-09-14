import { createRouter, createWebHistory } from 'vue-router'

const routes = [

  { path: '/login', component: () => import('./components/Login.vue') },
  { path: '/', component: () => import('./components/Dashboard.vue'), meta: { requiresAuth: true } },
  { path: '/admin', component: () => import('./components/Admin.vue'), meta: { requiresAuth: true } },
  // { path: '/my-work-sessions',component: () => import('./MyWorkSessions.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) return next('/login')
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp && payload.exp < Date.now() / 1000) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      return next('/login')
    }
  }
  next()
})

export default router
