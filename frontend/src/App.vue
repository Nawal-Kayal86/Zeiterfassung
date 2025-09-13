<template>
  <div style="font-family:system-ui,Arial; padding: 20px; max-width:900px; margin:auto;">
    <h1>Zeiterfassung - Demo</h1>
    <p>Wähle: <button @click="view='stamp'">Mitarbeiter</button> <button @click="view='admin'">Chef (Admin)</button></p>
    <component :is="viewComponent" />
    <hr />
    <p style="font-size:0.9em;color:#666">Hinweis: Dies ist eine minimal funktionale Demo.</p>
  </div>
</template>

<script>
import Stamp from './components/Stamp.vue'
import Admin from './components/Admin.vue'

export default {
  data(){ return { view: 'stamp' } },
  computed: {
    viewComponent(){ return this.view === 'admin' ? Admin : Stamp }
  }
}
</script>
