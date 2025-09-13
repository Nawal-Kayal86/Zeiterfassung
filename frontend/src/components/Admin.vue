<template>
  <div>
    <h2>Admin / Chef Übersicht</h2>
    <button @click="loadUsers">Lade Mitarbeiter</button>
    <table v-if="users.length" border="1" cellpadding="6" style="margin-top:10px">
      <thead><tr><th>Name</th><th>Role</th><th>Tag</th><th>Letzter Start</th><th>Letztes Ende</th></tr></thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.name }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.nfc_tag }}</td>
          <td>{{ u.last_start }}</td>
          <td>{{ u.last_end }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){ return { users: [] } },
  methods: {
    async loadUsers(){
      const res = await axios.get('http://localhost:3000/api/admin/users')
      this.users = res.data
    }
  }
}
</script>
