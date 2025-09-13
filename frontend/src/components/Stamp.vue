<template>
  <div>
    <h2>Mitarbeiter Stempeln</h2>
    <div>
      <label>User ID (Demo): <input v-model="userId" /></label>
      <button @click="start">Kommen (Start)</button>
      <button @click="stop">Gehen (Stop)</button>
    </div>

    <h3>Oder NFC-Tag (Demo)</h3>
    <div>
      <input v-model="tag" placeholder="Tag-ID (z.B. ABC123)" />
      <button @click="start(true)">Start mit Tag</button>
      <button @click="stop(true)">Stop mit Tag</button>
    </div>

    <h3>Meine Sessions</h3>
    <div v-if="sessions.length">
      <ul>
        <li v-for="s in sessions" :key="s.id">
          {{ s.start_time }} - {{ s.end_time ? s.end_time : 'läuft...' }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){ return { userId: '', tag: '', sessions: [] } },
  methods: {
    async start(useTag=false){
      try {
        const payload = useTag ? { tag: this.tag } : { userId: Number(this.userId) }
        await axios.post('http://localhost:3000/api/start', payload)
        alert('Start erfasst')
        this.loadSessions()
      } catch (e) { alert('Fehler: ' + (e.response?.data?.error || e.message)) }
    },
    async stop(useTag=false){
      try {
        const payload = useTag ? { tag: this.tag } : { userId: Number(this.userId) }
        await axios.post('http://localhost:3000/api/stop', payload)
        alert('Stop erfasst')
        this.loadSessions()
      } catch (e) { alert('Fehler: ' + (e.response?.data?.error || e.message)) }
    },
    async loadSessions(){
      if (!this.userId) return;
      const res = await axios.get('http://localhost:3000/api/sessions/' + this.userId)
      this.sessions = res.data
    }
  }
}
</script>
