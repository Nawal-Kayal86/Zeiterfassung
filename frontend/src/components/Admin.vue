<template>
  <div>
    <h2>Admin-Bereich</h2>
    <ul>
      <li v-for="u in users" :key="u.id">
        {{ u.name }} ({{ u.role }}) – Letzter Start: {{ u.last_start }} – Letztes Ende: {{ u.last_end }}
      </li>
    </ul>
  </div>
</template>

<script>
import api from '../api'
import router from '../router'

export default {
  data() {
    return { users: [] }
  },
  async created() {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    const res = await api.get('/admin/users')
    this.users = res.data
  }
}
</script>
