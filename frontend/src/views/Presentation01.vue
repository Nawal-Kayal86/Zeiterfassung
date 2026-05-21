<template>
  <main class="presentation-page">
    <section class="deck" :class="activeSlide.theme">
      <header class="deck-toolbar">
        <div>
          <span class="deck-label">MEVN Projekt: Digital Time Tracking System</span>
        </div>
        <div class="deck-actions">
          <button type="button" class="icon-button" title="Vorherige Folie" @click="prevSlide" :disabled="currentSlide === 0">
            &lt;
          </button>
          <span class="slide-counter">{{ currentSlide + 1 }} / {{ slides.length }}</span>
          <button type="button" class="icon-button" title="Nächste Folie" @click="nextSlide" :disabled="currentSlide === slides.length - 1">
            &gt;
          </button>
        </div>
      </header>

        <div class="slide-svg-wrap">
    <!-- 1. SYSTEM (Cover / Fazit) -->
    <svg v-if="name === 'system'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sysBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.15"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0.02"/>
        </linearGradient>
        <linearGradient id="sysNode" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7fd4ff"/>
          <stop offset="1" stop-color="#1d63b7"/>
        </linearGradient>
        <linearGradient id="sysNode2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#94a8d9"/>
          <stop offset="1" stop-color="#27324a"/>
        </linearGradient>
        <linearGradient id="sysNode3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7fe3b8"/>
          <stop offset="1" stop-color="#0c7b61"/>
        </linearGradient>
      </defs>
      <rect width="600" height="480" rx="24" fill="url(#sysBg)"/>
      <!-- orbit rings -->
      <circle cx="300" cy="240" r="200" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-dasharray="4 8"/>
      <circle cx="300" cy="240" r="140" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-dasharray="2 6"/>
      <!-- center clock -->
      <circle cx="300" cy="240" r="70" fill="#ffffff"/>
      <circle cx="300" cy="240" r="60" fill="none" stroke="#123a63" stroke-width="3"/>
      <line x1="300" y1="240" x2="300" y2="195" stroke="#123a63" stroke-width="5" stroke-linecap="round"/>
      <line x1="300" y1="240" x2="335" y2="240" stroke="#2f9a82" stroke-width="4" stroke-linecap="round"/>
      <circle cx="300" cy="240" r="5" fill="#123a63"/>
      <!-- nodes -->
      <g>
        <rect x="60" y="80" width="120" height="80" rx="14" fill="url(#sysNode)"/>
        <text x="120" y="115" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="14" font-weight="700">Frontend</text>
        <text x="120" y="135" text-anchor="middle" fill="#e6f1ff" font-family="system-ui" font-size="11">Vue 3 SPA</text>
      </g>
      <g>
        <rect x="420" y="80" width="120" height="80" rx="14" fill="url(#sysNode2)"/>
        <text x="480" y="115" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="14" font-weight="700">Backend</text>
        <text x="480" y="135" text-anchor="middle" fill="#e6e9f5" font-family="system-ui" font-size="11">Express API</text>
      </g>
      <g>
        <rect x="240" y="380" width="120" height="80" rx="14" fill="url(#sysNode3)"/>
        <text x="300" y="415" text-anchor="middle" fill="#fff" font-family="system-ui" font-size="14" font-weight="700">Datenbank</text>
        <text x="300" y="435" text-anchor="middle" fill="#dff6ec" font-family="system-ui" font-size="11">MongoDB</text>
      </g>
      <!-- connectors -->
      <path d="M180 120 Q 240 200 240 230" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M420 120 Q 360 200 360 230" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 4"/>
      <path d="M300 310 L 300 380" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 4"/>
    </svg>

    <!-- 2. MODULES (Problem & Ziel) -->
    <svg v-else-if="name === 'modules'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="modCard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#e7eef7"/>
        </linearGradient>
      </defs>
      <rect width="600" height="480" rx="24" fill="#ffffff" fill-opacity="0.08"/>
      <!-- big circle with check -->
      <circle cx="300" cy="160" r="90" fill="#ffffff" fill-opacity="0.15"/>
      <circle cx="300" cy="160" r="65" fill="#ffffff"/>
      <path d="M268 162 L292 186 L336 138" stroke="#1b805d" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- three cards -->
      <g v-for="(card, i) in 3" :key="i">
        <rect :x="50 + 175 * i" y="290" width="150" height="150" rx="14" fill="url(#modCard)"/>
      </g>
      <!-- icons in cards -->
      <!-- card 1: clock -->
      <circle cx="125" cy="345" r="22" fill="none" stroke="#1d63b7" stroke-width="4"/>
      <line x1="125" y1="345" x2="125" y2="328" stroke="#1d63b7" stroke-width="4" stroke-linecap="round"/>
      <line x1="125" y1="345" x2="138" y2="345" stroke="#2f9a82" stroke-width="4" stroke-linecap="round"/>
      <text x="125" y="405" text-anchor="middle" fill="#26344e" font-family="system-ui" font-size="13" font-weight="700">Zeit sparen</text>
      <!-- card 2: eye -->
      <path d="M278 345 Q 300 320 322 345 Q 300 370 278 345 Z" fill="none" stroke="#1d63b7" stroke-width="4"/>
      <circle cx="300" cy="345" r="8" fill="#2f9a82"/>
      <text x="300" y="405" text-anchor="middle" fill="#26344e" font-family="system-ui" font-size="13" font-weight="700">Transparenz</text>
      <!-- card 3: flow -->
      <rect x="455" y="330" width="16" height="16" rx="3" fill="#1d63b7"/>
      <rect x="485" y="330" width="16" height="16" rx="3" fill="#2f9a82"/>
      <rect x="470" y="356" width="16" height="16" rx="3" fill="#1d63b7"/>
      <line x1="471" y1="338" x2="485" y2="338" stroke="#26344e" stroke-width="2"/>
      <line x1="478" y1="346" x2="478" y2="356" stroke="#26344e" stroke-width="2"/>
      <text x="478" y="405" text-anchor="middle" fill="#26344e" font-family="system-ui" font-size="13" font-weight="700">Prozesse</text>
    </svg>

    <!-- 3. FRONTEND -->
    <svg v-else-if="name === 'frontend'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="480" rx="24" fill="#f6f8fb"/>
      <!-- browser chrome -->
      <rect x="20" y="20" width="560" height="40" rx="10" fill="#17345d"/>
      <circle cx="40" cy="40" r="6" fill="#ff6058"/>
      <circle cx="60" cy="40" r="6" fill="#ffbd2e"/>
      <circle cx="80" cy="40" r="6" fill="#28ca41"/>
      <rect x="110" y="30" width="380" height="20" rx="10" fill="#ffffff" fill-opacity="0.2"/>
      <!-- sidebar -->
      <rect x="20" y="60" width="140" height="400" fill="#17345d"/>
      <g font-family="system-ui" font-size="11" fill="#ffffff">
        <rect x="35" y="85" width="110" height="28" rx="6" fill="#ffffff" fill-opacity="0.18"/>
        <text x="48" y="103">Dashboard</text>
        <rect x="35" y="120" width="110" height="28" rx="6" fill="#ffffff" fill-opacity="0.08"/>
        <text x="48" y="138">Zeiterfassung</text>
        <rect x="35" y="155" width="110" height="28" rx="6" fill="#ffffff" fill-opacity="0.08"/>
        <text x="48" y="173">Kalender</text>
        <rect x="35" y="190" width="110" height="28" rx="6" fill="#ffffff" fill-opacity="0.08"/>
        <text x="48" y="208">Urlaub</text>
        <rect x="35" y="225" width="110" height="28" rx="6" fill="#ffffff" fill-opacity="0.08"/>
        <text x="48" y="243">Reports</text>
      </g>
      <!-- main -->
      <rect x="180" y="80" width="380" height="60" rx="8" fill="#ffffff"/>
      <text x="200" y="115" font-family="system-ui" font-size="20" font-weight="800" fill="#1b805d">07:42 h</text>
      <text x="200" y="132" font-family="system-ui" font-size="10" fill="#526177">Heute gearbeitet</text>
      <rect x="480" y="98" width="60" height="24" rx="12" fill="#2f9a82"/>
      <text x="510" y="115" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#fff">Start</text>
      <!-- cards row -->
      <rect x="180" y="155" width="115" height="80" rx="8" fill="#1c67b1"/>
      <text x="237" y="200" text-anchor="middle" font-family="system-ui" font-size="22" font-weight="800" fill="#fff">38</text>
      <text x="237" y="218" text-anchor="middle" font-family="system-ui" font-size="10" fill="#dbe9f7">Std. Woche</text>
      <rect x="312" y="155" width="115" height="80" rx="8" fill="#2c9f78"/>
      <text x="369" y="200" text-anchor="middle" font-family="system-ui" font-size="22" font-weight="800" fill="#fff">12</text>
      <text x="369" y="218" text-anchor="middle" font-family="system-ui" font-size="10" fill="#dbf3e7">Urlaubstage</text>
      <rect x="444" y="155" width="116" height="80" rx="8" fill="#46a9c6"/>
      <text x="502" y="200" text-anchor="middle" font-family="system-ui" font-size="22" font-weight="800" fill="#fff">3</text>
      <text x="502" y="218" text-anchor="middle" font-family="system-ui" font-size="10" fill="#dff2f6">Anträge</text>
      <!-- chart -->
      <rect x="180" y="250" width="380" height="200" rx="8" fill="#ffffff"/>
      <polyline points="200,420 240,380 280,395 320,340 360,360 400,300 440,320 480,270 520,290 540,250"
        fill="none" stroke="#1c67b1" stroke-width="3"/>
      <polyline points="200,420 240,380 280,395 320,340 360,360 400,300 440,320 480,270 520,290 540,250 540,440 200,440"
        fill="#1c67b1" fill-opacity="0.15"/>
      <g stroke="#edf4fb" stroke-width="1">
        <line x1="200" y1="290" x2="540" y2="290"/>
        <line x1="200" y1="350" x2="540" y2="350"/>
        <line x1="200" y1="410" x2="540" y2="410"/>
      </g>
    </svg>

    <!-- 4. BACKEND -->
    <svg v-else-if="name === 'backend'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="480" rx="24" fill="#101827"/>
      <!-- terminal header -->
      <rect x="20" y="20" width="360" height="36" rx="8" fill="#1f2937"/>
      <circle cx="40" cy="38" r="5" fill="#ff6058"/>
      <circle cx="58" cy="38" r="5" fill="#ffbd2e"/>
      <circle cx="76" cy="38" r="5" fill="#28ca41"/>
      <text x="200" y="42" text-anchor="middle" font-family="Consolas,monospace" font-size="11" fill="#9ab">server.js</text>
      <!-- code -->
      <g font-family="Consolas,monospace" font-size="12">
        <rect x="20" y="70" width="360" height="32" rx="6" fill="#ffffff" fill-opacity="0.06"/>
        <text x="35" y="91" fill="#dce9ff">POST <tspan fill="#65d6ad">/api/auth/login</tspan></text>
        <rect x="20" y="110" width="360" height="32" rx="6" fill="#ffffff" fill-opacity="0.06"/>
        <text x="35" y="131" fill="#dce9ff">GET  <tspan fill="#65d6ad">/api/work-sessions</tspan></text>
        <rect x="20" y="150" width="360" height="32" rx="6" fill="#ffffff" fill-opacity="0.06"/>
        <text x="35" y="171" fill="#dce9ff">POST <tspan fill="#65d6ad">/api/leave-requests</tspan></text>
        <rect x="20" y="190" width="360" height="32" rx="6" fill="#ffffff" fill-opacity="0.06"/>
        <text x="35" y="211" fill="#dce9ff">GET  <tspan fill="#65d6ad">/healthz</tspan></text>
      </g>
      <!-- layered stack -->
      <g font-family="system-ui" font-size="12" font-weight="800" fill="#fff">
        <rect x="400" y="70" width="180" height="56" rx="10" fill="#194c8f"/>
        <text x="490" y="103" text-anchor="middle">Security Headers</text>
        <rect x="400" y="135" width="180" height="56" rx="10" fill="#2065a8"/>
        <text x="490" y="168" text-anchor="middle">JWT Middleware</text>
        <rect x="400" y="200" width="180" height="56" rx="10" fill="#2d80c5"/>
        <text x="490" y="233" text-anchor="middle">Controller</text>
        <rect x="400" y="265" width="180" height="56" rx="10" fill="#3a96d3"/>
        <text x="490" y="298" text-anchor="middle">Service Layer</text>
        <rect x="400" y="330" width="180" height="56" rx="10" fill="#46a9c6"/>
        <text x="490" y="363" text-anchor="middle">Mongoose Models</text>
      </g>
      <!-- DB cylinder bottom -->
      <ellipse cx="200" cy="320" rx="120" ry="20" fill="#1c5ea8"/>
      <rect x="80" y="320" width="240" height="80" fill="#194c8f"/>
      <ellipse cx="200" cy="400" rx="120" ry="20" fill="#123a63"/>
      <ellipse cx="200" cy="320" rx="120" ry="20" fill="none" stroke="#7fd4ff" stroke-width="2"/>
      <ellipse cx="200" cy="360" rx="120" ry="20" fill="none" stroke="#7fd4ff" stroke-opacity="0.4"/>
      <text x="200" y="365" text-anchor="middle" font-family="system-ui" font-size="14" font-weight="800" fill="#fff">MongoDB</text>
    </svg>

    <!-- 5. DATA -->
    <svg v-else-if="name === 'data'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="480" rx="24" fill="#ffffff" fill-opacity="0.08"/>
      <g font-family="system-ui">
        <g v-for="i in 6" :key="i">
          <rect
            :x="30 + ((i-1) % 3) * 190"
            :y="30 + Math.floor((i-1)/3) * 210"
            width="170" height="190" rx="12" fill="#ffffff"/>
        </g>
      </g>
      <!-- model 1 User -->
      <g font-family="system-ui">
        <rect x="30" y="30" width="170" height="36" rx="12" fill="#0c604f"/>
        <text x="115" y="54" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">User</text>
        <text x="48" y="92" font-size="11" fill="#41516a">• name</text>
        <text x="48" y="112" font-size="11" fill="#41516a">• email</text>
        <text x="48" y="132" font-size="11" fill="#41516a">• role</text>
        <text x="48" y="152" font-size="11" fill="#41516a">• department</text>
        <!-- WorkSession -->
        <rect x="220" y="30" width="170" height="36" rx="12" fill="#0c604f"/>
        <text x="305" y="54" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">WorkSession</text>
        <text x="238" y="92" font-size="11" fill="#41516a">• user</text>
        <text x="238" y="112" font-size="11" fill="#41516a">• start</text>
        <text x="238" y="132" font-size="11" fill="#41516a">• end</text>
        <text x="238" y="152" font-size="11" fill="#41516a">• breaks</text>
        <!-- LeaveRequest -->
        <rect x="410" y="30" width="170" height="36" rx="12" fill="#0c604f"/>
        <text x="495" y="54" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">LeaveRequest</text>
        <text x="428" y="92" font-size="11" fill="#41516a">• status</text>
        <text x="428" y="112" font-size="11" fill="#41516a">• from</text>
        <text x="428" y="132" font-size="11" fill="#41516a">• to</text>
        <text x="428" y="152" font-size="11" fill="#41516a">• reason</text>
        <!-- Department -->
        <rect x="30" y="240" width="170" height="36" rx="12" fill="#16745d"/>
        <text x="115" y="264" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Department</text>
        <text x="48" y="302" font-size="11" fill="#41516a">• name</text>
        <text x="48" y="322" font-size="11" fill="#41516a">• members</text>
        <text x="48" y="342" font-size="11" fill="#41516a">• manager</text>
        <!-- Schedule -->
        <rect x="220" y="240" width="170" height="36" rx="12" fill="#16745d"/>
        <text x="305" y="264" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Schedule</text>
        <text x="238" y="302" font-size="11" fill="#41516a">• date</text>
        <text x="238" y="322" font-size="11" fill="#41516a">• shift</text>
        <text x="238" y="342" font-size="11" fill="#41516a">• assignedUsers</text>
        <!-- Log -->
        <rect x="410" y="240" width="170" height="36" rx="12" fill="#16745d"/>
        <text x="495" y="264" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Log</text>
        <text x="428" y="302" font-size="11" fill="#41516a">• level</text>
        <text x="428" y="322" font-size="11" fill="#41516a">• message</text>
        <text x="428" y="342" font-size="11" fill="#41516a">• requestId</text>
      </g>
      <!-- connecting lines -->
      <g stroke="#ffffff" stroke-opacity="0.5" stroke-dasharray="3 4" fill="none">
        <path d="M115 220 Q 160 230 220 240"/>
        <path d="M305 220 L 305 240"/>
        <path d="M495 220 Q 450 230 390 240"/>
      </g>
    </svg>

    <!-- 6. STACK (Technologien) -->
    <svg v-else-if="name === 'stack'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="480" rx="24" fill="#ffffff" fill-opacity="0.08"/>
      <g font-family="system-ui">
        <!-- 8 hex-ish cards in grid -->
        <g v-for="(t, idx) in stackItems" :key="idx">
          <rect
            :x="30 + (idx % 4) * 140"
            :y="40 + Math.floor(idx / 4) * 200"
            width="125" height="170" rx="14" fill="#ffffff"/>
          <rect
            :x="30 + (idx % 4) * 140"
            :y="40 + Math.floor(idx / 4) * 200"
            width="125" height="40" rx="14" :fill="t.color"/>
          <text
            :x="92 + (idx % 4) * 140"
            :y="65 + Math.floor(idx / 4) * 200"
            text-anchor="middle" font-size="11" font-weight="800" fill="#fff">{{ t.area }}</text>
          <text
            :x="92 + (idx % 4) * 140"
            :y="120 + Math.floor(idx / 4) * 200"
            text-anchor="middle" font-size="16" font-weight="800" fill="#26344e">{{ t.name }}</text>
          <text
            :x="92 + (idx % 4) * 140"
            :y="160 + Math.floor(idx / 4) * 200"
            text-anchor="middle" font-size="9" fill="#526177">{{ t.use }}</text>
        </g>
      </g>
    </svg>

    <!-- 7. LIVE -->
    <svg v-else-if="name === 'live'" viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="480" rx="24" fill="#ffffff"/>
      <!-- topbar -->
      <rect x="20" y="20" width="560" height="50" rx="10" fill="#edf3f8"/>
      <circle cx="48" cy="45" r="8" fill="#2c9f78">
        <animate attributeName="r" values="8;10;8" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <text x="70" y="50" font-family="system-ui" font-size="13" font-weight="700" fill="#172033">localhost:5173/login</text>
      <text x="540" y="50" text-anchor="end" font-family="system-ui" font-size="12" font-weight="800" fill="#175ea8">LIVE</text>
      <!-- login card -->
      <rect x="170" y="110" width="260" height="320" rx="16" fill="#ffffff" stroke="#e3ebf3" stroke-width="2"/>
      <!-- logo -->
      <circle cx="300" cy="160" r="28" fill="#14345b"/>
      <path d="M300 145 L300 162 L312 168" stroke="#43a479" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="300" cy="160" r="20" stroke="#fff" stroke-width="2" fill="none"/>
      <text x="300" y="215" text-anchor="middle" font-family="system-ui" font-size="16" font-weight="800" fill="#14345b">Anmelden</text>
      <!-- inputs -->
      <rect x="200" y="240" width="200" height="36" rx="8" fill="#f4f7fb" stroke="#dde5ee"/>
      <text x="215" y="262" font-family="system-ui" font-size="11" fill="#8a95a6">E-Mail</text>
      <rect x="200" y="286" width="200" height="36" rx="8" fill="#f4f7fb" stroke="#dde5ee"/>
      <text x="215" y="308" font-family="system-ui" font-size="11" fill="#8a95a6">••••••••</text>
      <!-- button -->
      <rect x="200" y="340" width="200" height="40" rx="8" fill="#236c9c"/>
      <text x="300" y="365" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="800" fill="#fff">Login</text>
      <text x="300" y="405" text-anchor="middle" font-family="system-ui" font-size="10" fill="#8a95a6">Zeiterfassung · Demo</text>
      <!-- floating tags -->
      <g font-family="system-ui" font-size="11" font-weight="700">
        <rect x="30" y="120" width="110" height="34" rx="8" fill="#43a479"/>
        <text x="85" y="142" text-anchor="middle" fill="#fff">Dashboard</text>
        <rect x="30" y="200" width="110" height="34" rx="8" fill="#1d75b8"/>
        <text x="85" y="222" text-anchor="middle" fill="#fff">Zeiterfassung</text>
        <rect x="30" y="280" width="110" height="34" rx="8" fill="#14345b"/>
        <text x="85" y="302" text-anchor="middle" fill="#fff">Admin</text>
        <rect x="460" y="160" width="110" height="34" rx="8" fill="#2c9f78"/>
        <text x="515" y="182" text-anchor="middle" fill="#fff">JWT Token</text>
        <rect x="460" y="240" width="110" height="34" rx="8" fill="#236c9c"/>
        <text x="515" y="262" text-anchor="middle" fill="#fff">Vue Router</text>
      </g>
    </svg>
  </div>

      <article class="slide">
        <div class="slide-copy">
          <p class="eyebrow">{{ activeSlide.kicker }}</p>
          <h1>{{ activeSlide.title }}</h1>
          <p class="lead">{{ activeSlide.lead }}</p>

          <div v-if="activeSlide.people" class="people-grid">
            <article v-for="person in activeSlide.people" :key="person.label" class="person-item">
              <span class="item-label">{{ person.label }}</span>
              <strong class="item-value">{{ person.name }}</strong>
            </article>
          </div>

          <div v-if="activeSlide.points" class="point-grid">
            <article v-for="point in activeSlide.points" :key="point.title" class="point-item">
              <span class="point-mark">{{ point.mark }}</span>
              <div class="point-content">
                <h2>{{ point.title }}</h2>
                <p>{{ point.text }}</p>
              </div>
            </article>
          </div>
        </div>

        <div class="slide-visual">
          <div v-if="activeSlide.visual === 'system'" class="visual-panel system-map">
            <svg viewBox="0 0 800 500" class="svg-map">
              <defs>
                <linearGradient id="fe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff15;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ffffff05;stop-opacity:1" />
                </linearGradient>
                <filter id="blur">
                  <feGaussianBlur stdDeviation="15" />
                </filter>
              </defs>

              <rect x="50" y="100" width="180" height="300" rx="20" class="node-card browser" />
              <text x="140" y="140" class="node-title browser-title" text-anchor="middle">SPA</text>
              <circle cx="140" y="220" r="40" class="node-icon fe-icon" />
              <text x="140" y="225" class="node-mark" text-anchor="middle">V3</text>
              <text x="140" y="300" class="node-text browser-sub" text-anchor="middle">Vue 3 Single Page</text>
              <text x="140" y="325" class="node-text browser-sub" text-anchor="middle">Application</text>
              <rect x="80" y="360" width="120" height="2" class="node-line browser-line" />

              <line x1="230" y1="250" x2="330" y2="250" class="connection-line" />
              <rect x="250" y="235" width="60" height="30" rx="15" class="connection-tag" />
              <text x="280" y="255" class="connection-text" text-anchor="middle">REST</text>

              <rect x="330" y="100" width="220" height="300" rx="20" class="node-card server" />
              <text x="440" y="140" class="node-title server-title" text-anchor="middle">API</text>
              <rect x="360" y="190" width="160" height="150" rx="10" class="node-icon be-icon" />
              <text x="440" y="255" class="node-text server-sub" text-anchor="middle">Node + Express.js</text>
              <text x="440" y="280" class="node-text server-sub" text-anchor="middle">Controller | Service | Middleware</text>

              <line x1="550" y1="250" x2="620" y2="250" class="connection-line" />
              <rect x="560" y="235" width="60" height="30" rx="15" class="connection-tag" />
              <text x="590" y="255" class="connection-text" text-anchor="middle">ORM</text>

              <rect x="620" y="100" width="130" height="300" rx="20" class="node-card database" />
              <text x="685" y="140" class="node-title db-title" text-anchor="middle">DB</text>
              <path d="M 640 180 q 45 40 90 0 q -45 40 -90 0 Z" class="node-icon db-icon-stack" />
              <text x="685" y="260" class="node-text db-sub" text-anchor="middle">MongoDB</text>
            </svg>
          </div>

          <div v-else-if="activeSlide.visual === 'modules'" class="visual-panel module-map">
            <svg viewBox="0 0 600 400" class="svg-map">
              <defs>
                <linearGradient id="mod-grad-on" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#ffffff01;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ffffff01;stop-opacity:1" />
                </linearGradient>
              </defs>
              <g transform="translate(30, 30)">
                <g v-for="(module, index) in modules" :key="module.name" class="card-item-svg"
                  :style="{
                    transform: `translate(${(index % 3) * 190}px, ${Math.floor(index / 3) * 170}px)`
                  }">
                  <rect x="0" y="0" width="170" height="150" rx="15" class="module-card-rect"
                    :class="{ active: index < 4 }" />
                  <rect x="15" y="15" width="35" height="20" rx="5" class="module-code-rect" />
                  <text x="23" y="29" class="module-code-text">{{ module.code }}</text>
                  <text x="15" y="65" class="module-name-text">{{ module.name }}</text>
                  <text x="15" y="90" class="module-desc-text"
                    v-for="(line, lIndex) in module.description.split(' und ')" :key="lIndex"
                    :dy="lIndex * 15">{{ line }}</text>
                </g>
              </g>
            </svg>
          </div>

          <div v-else-if="activeSlide.visual === 'backend'" class="visual-panel backend-picture">
            <div class="backend-browser">
              <div class="backend-bar">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="backend-code">
                <p><b>POST</b> /api/auth/login</p>
                <p><b>GET</b> /api/users/profile</p>
                <p><b>POST</b> /api/sessions/start</p>
                <p><b>GET</b> /api/leave-requests/reports</p>
              </div>
            </div>
            <div class="backend-layers">
              <span>Security (JWT/CORS)</span>
              <span>Middleware Stack</span>
              <span>REST Controllers</span>
              <span>Business Logic Service</span>
              <span>Data Models (Mongoose)</span>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'data'" class="visual-panel data-picture">
            <div v-for="model in dataModels" :key="model.name" class="data-table">
              <strong>{{ model.name }}</strong>
              <div class="field-tags">
                <span v-for="field in model.fields" :key="field">{{ field }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'frontend'" class="visual-panel frontend-picture">
            <div class="mock-app">
              <aside>
                <strong class="brand">TT-System</strong>
                <nav class="mock-nav">
                  <span class="active">Dashboard</span>
                  <span>Terminal</span>
                  <span>Urlaub</span>
                  <span>Administration</span>
                </nav>
              </aside>
              <section>
                <div class="mock-header">
                  <span>Dienstag, 18.06.</span>
                  <strong>07:55 h</strong>
                </div>
                <div class="mock-cards">
                  <article>Dienstantritt</article>
                  <article class="pause">Pause</article>
                  <article class="end">Abmeldung</article>
                </div>
                <div class="mock-chart"></div>
              </section>
            </div>
          </div>

          <div v-else-if="activeSlide.visual === 'live'" class="visual-panel stack-picture">
            <article v-for="tech in technologies" :key="tech.name" class="card-item">
              <div class="card-content">
                <span class="tech-area">{{ tech.area }}</span>
                <strong>{{ tech.name }}</strong>
                <small>{{ tech.use }}</small>
              </div>
            </article>
          </div>

          <div v-else class="visual-panel live-panel">
            <div class="live-topbar">
              <span class="status-indicator"></span>
              <strong>{{ demoFrameUrl }}</strong>
              <a :href="demoFrameUrl" target="_blank" rel="noreferrer">Öffnen</a>
            </div>
            <iframe class="demo-frame" :src="demoFrameUrl" title="Zeiterfassung Live Demo"></iframe>
          </div>
        </div>
      </article>

      <nav class="slide-nav" aria-label="Folien">
        <button v-for="(slide, index) in slides" :key="slide.title" type="button"
          :class="{ active: index === currentSlide }" :title="slide.title" @click="goToSlide(index)">
          {{ String(index + 1).padStart(2, "0") }}
        </button>
      </nav>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const currentSlide = ref(0);

const slides = [
  {
    kicker: "MEVN Stack Projekt",
    title: "Digitales Zeiterfassungssystem",
    lead: "Eine integrierte Webanwendung zur Verwaltung von Arbeitszeiten, Dienstplänen, Urlaubsanträgen und Berichten.",
    theme: "theme-cover",
    visual: "system",
    people: [
      { label: "Entwickelt von", name: "Nawal Kayal & Ahmad Alalan" },
      { label: "Architektur", name: "SPA (Vue 3) & REST API (Node/Express)" },
    ],
  },
  {
    kicker: "Problemstellung",
    title: "Vom Papier zur Plattform",
    lead: "Ablösung manueller, fehleranfälliger Prozesse (Tabellenkalkulationen) durch eine zentrale, digitale Lösung.",
    theme: "theme-light",
    visual: "modules",
    points: [
      { mark: "01", title: "Prozess-Optimierung", text: "Zeiten werden direkt digital erfasst; sofortige Validierung und Auswertung." },
      { mark: "02", title: "Transparenz & Nachvollziehbarkeit", text: "Alle Status (Anwesenheit, Anträge, Reports) sind rollenbasiert einsehbar." },
      { mark: "03", title: "Integrierte Workflows", text: "Dienstplan, Kalender, Urlaub und Berichte sind zentral verknüpft." },
    ],
  },
  {
    kicker: "Backend Architektur",
    title: "Robuste API & Security",
    lead: "Das Backend verarbeitet alle REST-Anfragen, stellt die Sicherheit sicher, prüft Berechtigungen und persistiert Daten.",
    theme: "theme-dark",
    visual: "backend",
    points: [
      { mark: "REST", title: "Express.js API", text: "Saubere Endpunkte für Authentifizierung, User, Sessions, Urlaub und Administration." },
      { mark: "AUTH", title: "Sicherheits-Schicht", text: "Implementierung von JWT, bcrypt, Security Headers und zentralem Error-Handling." },
      { mark: "DATA", title: "Datenmodellierung", text: "Komplexe Geschäftsregeln abgebildet via Mongoose Modelle und Services." },
    ],
  },
  {
    kicker: "Datenbank & Modellierung",
    title: "Saubere NoSQL Strukturen",
    lead: "Mongoose-Modelle definieren die Datenkonsistenz und Struktur der NoSQL-Dokumente.",
    theme: "theme-green",
    visual: "data",
    points: [
      { mark: "DB", title: "MongoDB Datenbank", text: "Hohe Flexibilität für komplexe Datenstrukturen (Sessions, Anträge)." },
      { mark: "MOD", title: "Validierung", text: "Definition von Schemas, Beziehungen und Validierungsregeln direkt im Code." },
    ],
  },
  {
    kicker: "Frontend (Client)",
    title: "Moderne SPA Benutzerführung",
    lead: "Das Frontend ist eine reaktive Vue Single Page Application mit rollenbasierten Ansichten.",
    theme: "theme-blue",
    visual: "frontend",
    points: [
      { mark: "UI", title: "Vue 3 & Komponenten", text: "Modulares, wartbares Interface mit Dashboard, Terminal, Kalender und Reports." },
      { mark: "UX", title: "Schnelle Bedienung", text: "Intuitiver Prozess: Login, Zeiterfassung starten, Urlaub beantragen, Berichte einsehen." },
    ],
  },
  {
    kicker: "Technologie Stack",
    title: "Technologien & Werkzeuge",
    lead: "Der Stack ist modern, testbar und optimiert für agile Entwicklung sowie Cloud-Deployment.",
    theme: "theme-tech",
    visual: "live",
    points: [
      { mark: "Vite", title: "Modernes Build Tool", text: "Hohe Entwicklungsgeschwindigkeit und optimiertes Production Build." },
      { mark: "Jest", title: "Qualitätssicherung", text: "Automatisierte Unit- und Integrationstests für kritische Backend-Funktionen." },
    ],
  },
];

const modules = [
  { code: "D1", name: "Dashboard", description: "Zentraler Tagesstatus und Schnellzugriff" },
  { code: "T2", name: "Terminal", description: "Dienstantritt, Pause und Abmeldung" },
  { code: "K3", name: "Kalender", description: "Integrierte Dienstplanung und Feiertage" },
  { code: "U4", name: "Urlaubsplaner", description: "Antrag, Freigabe und Übersicht" },
  { code: "R5", name: "Reporting", description: "Detaillierte Auswertungen und Abrechnung" },
  { code: "A6", name: "Administration", description: "Benutzer, Rollen und Abteilungen" },
];

const dataModels = [
  { name: "User", fields: ["name", "email", "role", "dept"] },
  { name: "WorkSession", fields: ["user", "start", "end", "breaks"] },
  { name: "LeaveRequest", fields: ["status", "from", "to", "reason"] },
  { name: "Department", fields: ["name", "members", "manager"] },
  { name: "Log", fields: ["level", "message", "timestamp"] },
];

const technologies = [
  { area: "Frontend", name: "Vue 3 (Composition)", use: "Reaktive UI und Komponenten" },
  { area: "Tooling", name: "Vite", use: "Schneller Dev Server und Build" },
  { area: "HTTP", name: "Axios", use: "API-Kommunikation mit Token-Handling" },
  { area: "Backend", name: "Node + Express.js", use: "REST API und Middleware" },
  { area: "Datenbank", name: "MongoDB + Mongoose", use: "Persistenz und ORM Layer" },
  { area: "Security", name: "JWT + bcrypt", use: "Sicherer Login und Passwortschutz" },
];

const activeSlide = computed(() => slides[currentSlide.value]);
const demoFrameUrl = computed(() => typeof window !== 'undefined' ? `${window.location.origin}/login` : '#');

const goToSlide = (index) => {
  currentSlide.value = index;
};

const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) currentSlide.value++;
};

const prevSlide = () => {
  if (currentSlide.value > 0) currentSlide.value--;
};

const onKeydown = (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    nextSlide();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevSlide();
  }
};

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});

defineProps({
  name: { type: String, required: true },
});

const stackItems = [
  { area: "Frontend", name: "Vue 3", use: "Reaktive UI", color: "#41b883" },
  { area: "Build", name: "Vite", use: "Dev Server", color: "#646cff" },
  { area: "UI", name: "Bootstrap", use: "Layouts", color: "#7952b3" },
  { area: "HTTP", name: "Axios", use: "API Calls", color: "#5a29e4" },
  { area: "Backend", name: "Express", use: "REST API", color: "#26344e" },
  { area: "DB", name: "MongoDB", use: "Persistenz", color: "#13aa52" },
  { area: "Auth", name: "JWT", use: "Login", color: "#d63aff" },
  { area: "Tests", name: "Jest", use: "Qualität", color: "#c63d14" },
];
</script>

<style scoped>
/* --- Basis & Layout (Refined) --- */
.presentation-page {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #e2e8f0;
  overflow: hidden;
}

.deck {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 1.25rem;
  box-sizing: border-box;
  transition: background 0.6s ease;
}

/* --- Navigation / Toolbar (Refined) --- */
.deck-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.deck-label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.deck-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.slide-counter {
  font-size: 0.85rem;
  font-weight: 600;
  color: #ffffff;
  min-width: 3rem;
  text-align: center;
}

.icon-button {
  width: 1.8rem;
  height: 1.8rem;
  border: none;
  border-radius: 50%;
  color: #0f172a;
  background: #ffffff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.icon-button:hover:not(:disabled) {
  transform: scale(1.08);
}

.icon-button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

/* --- Hauptlayout der Slides (Refined) --- */
.slide {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 2.5rem;
  align-items: center;
  padding: 1.5rem 0;
}

.slide-copy {
  animation: fadeIn 0.4s ease-out forwards;
}

.eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 0.4rem 0;
}

h1 {
  font-size: clamp(2rem, 3.2vw, 2.8rem);
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  margin: 0 0 1.25rem 0;
  letter-spacing: -0.015em;
}

.lead {
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.75rem 0;
}

/* --- Grids (Links) --- */
.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.person-item {
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.item-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.item-value {
  display: block;
  font-size: 1rem;
  color: #ffffff;
  font-weight: 600;
}

.point-grid {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.point-item {
  display: flex;
  gap: 1.1rem;
  padding: 1.1rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

.point-mark {
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #0f172a;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.point-content h2 {
  margin: 0 0 0.2rem 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
}

.point-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.65);
}

/* --- Visuelle Container (Rechts) (Glassmorphism & New SVGs) --- */
.visual-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
  min-height: 480px;
  display: flex;
  animation: slideIn 0.5s ease-out forwards;
}

/* --- SVG Base Style --- */
.svg-map {
  width: 100%;
  height: 100%;
  fill: none;
}

.node-card {
  fill: rgba(255, 255, 255, 0.08);
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 1px;
}

.node-title {
  font-size: 1.5rem;
  font-weight: 800;
  fill: #ffffff;
}

.node-mark {
  fill: #0f172a;
  font-size: 2.2rem;
  font-weight: 900;
}

.fe-icon {
  fill: #ffffff;
}

.node-text {
  font-size: 0.85rem;
  fill: rgba(255, 255, 255, 0.8);
}

.browser-line {
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 2px;
}

.be-icon {
  fill: rgba(255, 255, 255, 0.05);
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 1px;
}

.db-icon-stack {
  fill: none;
  stroke: rgba(255, 255, 255, 0.6);
  stroke-width: 3px;
}

/* Connection Tag */
.connection-line {
  stroke: rgba(255, 255, 255, 0.15);
  stroke-width: 2px;
}

.connection-tag {
  fill: #ffffff;
}

.connection-text {
  fill: #0f172a;
  font-size: 0.7rem;
  font-weight: 700;
}

/* Module SVGs */
.module-card-rect {
  fill: rgba(255, 255, 255, 0.98);
  stroke: rgba(0, 0, 0, 0.05);
  stroke-width: 1px;
  transition: all 0.3s ease;
}

.module-card-rect.active {
  fill: rgba(255, 255, 255, 1);
  stroke: rgba(37, 99, 235, 0.2);
}

.module-code-rect {
  fill: #e0f2fe;
}

.module-card-rect.active+.module-code-rect {
  fill: #2563eb;
}

.module-code-text {
  fill: #0369a1;
  font-weight: 700;
  font-size: 0.85rem;
}

.module-card-rect.active+.module-code-rect+.module-code-text {
  fill: #ffffff;
}

.module-name-text {
  fill: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.module-desc-text {
  fill: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* --- Backend Code & Layers (Glass & Consolas) --- */
.backend-picture {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;
  width: 100%;
}

.backend-browser {
  background: #0f172a;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.backend-bar {
  background: #1e293b;
  padding: 0.6rem;
  display: flex;
  gap: 0.4rem;
}

.backend-bar span {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

.backend-code {
  padding: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8rem;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  height: 100%;
}

.backend-code p {
  margin: 0;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.35rem;
}

.backend-code b {
  color: #34d399;
}

.backend-layers {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
}

.backend-layers span {
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  color: #ffffff;
  padding: 0.65rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* --- Data Table View (Glass Cards) --- */
.data-picture {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
}

.data-table {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-table strong {
  color: #0f172a;
  font-size: 0.95rem;
}

.field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.field-tags span {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

/* --- Frontend Mock View --- */
.frontend-picture {
  padding: 0;
  overflow: hidden;
}

.mock-app {
  display: grid;
  grid-template-columns: 140px 1fr;
  width: 100%;
  height: 100%;
  background: #f8fafc;
}

.mock-app aside {
  background: #0f172a;
  padding: 1rem;
  color: #ffffff;
}

.brand {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
}

.mock-nav {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.mock-nav span {
  font-size: 0.75rem;
  padding: 0.4rem;
  border-radius: 0.25rem;
  color: #94a3b8;
}

.mock-nav span.active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.mock-app section {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mock-header {
  background: #ffffff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  font-size: 0.8rem;
}

.mock-header strong {
  color: #10b981;
  font-size: 1.1rem;
}

.mock-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.mock-cards article {
  background: #2563eb;
  color: #ffffff;
  padding: 0.75rem;
  text-align: center;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.mock-cards article.pause {
  background: #f59e0b;
}

.mock-cards article.end {
  background: #ef4444;
}

.mock-chart {
  flex-grow: 1;
  background: linear-gradient(180deg, #ffffff, #f1f5f9);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* --- Stack View (Tech Cards) --- */
.stack-picture {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  width: 100%;
  align-content: center;
}

.card-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-content strong {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 600;
}

.card-content small {
  color: #475569;
  font-size: 0.8rem;
  margin-top: 0.15rem;
  line-height: 1.4;
}

.tech-area {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 0.15rem;
}

/* --- Untere Navigation (Dots) --- */
.slide-nav {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.slide-nav button {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slide-nav button:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.slide-nav button.active {
  background: #ffffff;
  color: #0f172a;
  transform: scale(1.05);
}

/* --- Themes (Verläufe) --- */
.theme-cover {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.theme-light {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.theme-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%);
}

.theme-dark {
  background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
}

.theme-green {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
}

.theme-tech {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
}

/* --- Responsive Anpassungen --- */
@media (max-width: 1024px) {
  .slide {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .visual-panel {
    min-height: 400px;
  }
}

@media (max-width: 640px) {
  .deck {
    padding: 0.75rem;
  }

  .people-grid,
  .point-grid,
  .visual-panel,
  .svg-map {
    width: 100% !important;
    height: auto !important;
  }

  .point-item {
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .point-mark {
    width: 2rem;
    height: 2rem;
  }

  .backend-picture,
  .module-map,
  .data-picture,
  .stack-picture {
    grid-template-columns: 1fr;
  }
}

/* --- Animationen --- */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-svg-wrap {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.slide-svg-wrap svg {
  width: 100%;
  height: auto;
  max-height: 100%;
  display: block;
}
</style>
