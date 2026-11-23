/* ==========================================================================
   LexConstructa - Lógica Principal de la Aplicación y Control de Simulación
   ========================================================================== */

// Estado Global de la Simulación
const STATE = {
  currentSection: 'inicio',
  userMode: 'alumno', // 'alumno' o 'docente'
  activeGroupId: 'G1', // Grupo en foco
  
  // Master Clock (180 minutos en segundos)
  timer: {
    totalSeconds: 180 * 60,
    currentSeconds: 0,
    isRunning: false,
    speedMultiplier: 1,
    intervalId: null
  },

  // Taxímetro y Tensión
  taximetroRatePerMin: 15000,
  taximetroAccumulated: 0,
  tensionPct: 55,

  // Negociación
  ofertaConstructora: 15000000,
  reclamoVecinos: 35000000,

  // Crisis activadas
  activeCrises: ['crisis-1'],

  // Evaluaciones por grupo (G1 a G4)
  evaluaciones: {
    G1: [3, 3, 4, 3],
    G2: [2, 3, 3, 3],
    G3: [3, 4, 2, 3],
    G4: [3, 2, 3, 4]
  },

  // Documento borrador activo
  docDraft: {
    tipo: 'carta_documento',
    destinatario: 'Fideicomiso Altos del Parque y Constructora del Plata S.A.',
    remitente: 'Familia Rossi (Propietarios Sucre 1420) con Patrocinio Letrado',
    plazoHoras: 48,
    montoReclamo: 38500000,
    descripcionHechos: 'Fisuras vivas de cizallamiento en medianera este de 14 mm provocadas por descalce y excavación sin banquinas alternadas a cota -6.20 m.',
    apercibimiento: 'Medida cautelar judicial de no innovar y paralización total de obra con costas (CCCN Arts. 1273, 1757).'
  },

  // Reflexiones
  reflexiones: []
};

// ============================================================================
// INICIALIZACIÓN Y ENRUTAMIENTO
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupEventListeners();
  updateMasterClockDisplay();
  renderCurrentSection();
}

function setupEventListeners() {
  // Manejo de resize para responsive
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar(false);
    }
  });

  const btnToggle = document.getElementById('btn-toggle-sidebar');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => toggleSidebar(true));
  }
}

function toggleSidebar(forceOpen) {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!sidebar || !backdrop) return;

  if (forceOpen === true) {
    sidebar.classList.remove('-translate-x-full');
    backdrop.classList.remove('hidden');
  } else if (forceOpen === false) {
    sidebar.classList.add('-translate-x-full');
    backdrop.classList.add('hidden');
  } else {
    sidebar.classList.toggle('-translate-x-full');
    backdrop.classList.toggle('hidden');
  }
}

function navigateSection(sectionId) {
  STATE.currentSection = sectionId;
  
  // Actualizar estilos activos en el menú lateral
  document.querySelectorAll('#nav-menu-list .nav-item').forEach(btn => {
    const isTarget = btn.getAttribute('data-nav') === sectionId;
    if (isTarget) {
      btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left text-white bg-blue-900/40 border-l-4 border-orange-500 shadow-sm";
    } else {
      btn.className = "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left text-slate-300 hover:text-white hover:bg-slate-800";
    }
  });

  // Cerrar sidebar en pantallas táctiles / móviles
  if (window.innerWidth < 1024) {
    toggleSidebar(false);
  }

  renderCurrentSection();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setUserMode(mode) {
  STATE.userMode = mode;
  const btnStudent = document.getElementById('btn-mode-student');
  const btnTeacher = document.getElementById('btn-mode-teacher');
  
  if (mode === 'alumno') {
    btnStudent.className = "px-3 py-1 rounded font-medium transition bg-blue-600 text-white shadow-sm";
    btnTeacher.className = "px-3 py-1 rounded font-medium transition text-slate-300 hover:text-white";
  } else {
    btnTeacher.className = "px-3 py-1 rounded font-medium transition bg-orange-600 text-white shadow-sm";
    btnStudent.className = "px-3 py-1 rounded font-medium transition text-slate-300 hover:text-white";
  }
  
  renderCurrentSection();
}

// ============================================================================
// CRONÓMETRO DE SIMULACIÓN Y TAXÍMETRO (Master Clock 180 min)
// ============================================================================
function toggleTimer() {
  if (STATE.timer.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  if (STATE.timer.isRunning) return;
  STATE.timer.isRunning = true;
  
  const icon = document.getElementById('icon-play-state');
  if (icon) {
    icon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
    icon.classList.remove('text-emerald-400');
    icon.classList.add('text-orange-400');
  }

  STATE.timer.intervalId = setInterval(() => {
    STATE.timer.currentSeconds += (1 * STATE.timer.speedMultiplier);
    
    // Taxímetro de obra durante la audiencia de mediación (a partir de min 110 o si está en sala)
    if (STATE.timer.currentSeconds >= 110 * 60 || STATE.currentSection === 'mediacion') {
      const minutesPassed = (1 * STATE.timer.speedMultiplier) / 60;
      STATE.taximetroAccumulated += (STATE.taximetroRatePerMin * minutesPassed);
      updateSidebarMeters();
    }

    if (STATE.timer.currentSeconds >= STATE.timer.totalSeconds) {
      STATE.timer.currentSeconds = STATE.timer.totalSeconds;
      pauseTimer();
    }

    updateMasterClockDisplay();
    checkAutomaticCrisisTriggers();
  }, 1000);
}

function pauseTimer() {
  STATE.timer.isRunning = false;
  clearInterval(STATE.timer.intervalId);
  const icon = document.getElementById('icon-play-state');
  if (icon) {
    icon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
    icon.classList.remove('text-orange-400');
    icon.classList.add('text-emerald-400');
  }
}

function speedUpTimer() {
  const speeds = [1, 5, 15];
  const currentIndex = speeds.indexOf(STATE.timer.speedMultiplier);
  const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
  STATE.timer.speedMultiplier = nextSpeed;
  document.getElementById('speed-indicator').innerText = `${nextSpeed}x`;
}

function setTimerMinutes(targetMin) {
  STATE.timer.currentSeconds = targetMin * 60;
  updateMasterClockDisplay();
  updateSidebarMeters();
}

function updateMasterClockDisplay() {
  const currentTotalMin = Math.floor(STATE.timer.currentSeconds / 60);
  const remSec = Math.floor(STATE.timer.currentSeconds % 60);
  
  const formatted = `${String(currentTotalMin).padStart(2, '0')}:${String(remSec).padStart(2, '0')}`;
  const clockEl = document.getElementById('clock-display');
  if (clockEl) clockEl.innerText = formatted;

  // Calcular fase
  let faseActual = LEX_DATA.fases[0];
  let acumulado = 0;
  for (let f of LEX_DATA.fases) {
    acumulado += f.duracionMin;
    if (currentTotalMin < acumulado) {
      faseActual = f;
      break;
    }
  }

  const labelFase = document.getElementById('label-fase-actual');
  if (labelFase) {
    labelFase.innerText = `Fase ${faseActual.id}: ${faseActual.nombre}`;
  }

  // Barra de progreso global
  const progressPct = Math.min(100, (STATE.timer.currentSeconds / STATE.timer.totalSeconds) * 100);
  const progressBar = document.getElementById('class-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progressPct}%`;
  }
}

function updateSidebarMeters() {
  const taxEl = document.getElementById('sidebar-taximetro');
  if (taxEl) {
    taxEl.innerText = `$${Math.round(STATE.taximetroAccumulated).toLocaleString('es-AR')}`;
  }
  const tensionEl = document.getElementById('sidebar-tension');
  if (tensionEl) {
    let tag = "Moderada";
    if (STATE.tensionPct > 70) tag = "Crítica";
    if (STATE.tensionPct < 30) tag = "Favorable";
    tensionEl.innerText = `${STATE.tensionPct}% (${tag})`;
  }
}

function checkAutomaticCrisisTriggers() {
  const currentMin = Math.floor(STATE.timer.currentSeconds / 60);
  LEX_DATA.cartasCrisis.forEach(crisis => {
    if (currentMin >= crisis.minutoTrigger && !STATE.activeCrises.includes(crisis.id)) {
      STATE.activeCrises.push(crisis.id);
      const badge = document.getElementById('badge-crisis-count');
      if (badge) badge.innerText = STATE.activeCrises.length;
    }
  });
}

// ============================================================================
// RENDERIZADOR GENERAL DE LAS 10 SECCIONES
// ============================================================================
function renderCurrentSection() {
  const container = document.getElementById('section-container');
  if (!container) return;

  switch (STATE.currentSection) {
    case 'inicio':
      container.innerHTML = renderSectionInicio();
      break;
    case 'panel-docente':
      container.innerHTML = renderSectionPanelDocente();
      break;
    case 'caso':
      container.innerHTML = renderSectionCaso();
      break;
    case 'grupos':
      container.innerHTML = renderSectionGrupos();
      break;
    case 'agentes':
      container.innerHTML = renderSectionAgentes();
      break;
    case 'documentacion':
      container.innerHTML = renderSectionDocumentacion();
      break;
    case 'mediacion':
      container.innerHTML = renderSectionMediacion();
      break;
    case 'crisis':
      container.innerHTML = renderSectionCrisis();
      break;
    case 'evaluacion':
      container.innerHTML = renderSectionEvaluacion();
      break;
    case 'cierre':
      container.innerHTML = renderSectionCierre();
      break;
    default:
      container.innerHTML = renderSectionInicio();
  }
}

// ============================================================================
// 1. INICIO / PRESENTACIÓN DEL DESAFÍO
// ============================================================================
function renderSectionInicio() {
  return `
    <div class="fade-in space-y-8">
      
      <!-- HERO BANNER PROFESIONAL UNIVERSITARIO -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 border border-blue-800/40 p-6 sm:p-10 shadow-2xl">
        <!-- Grilla decorativa sutil -->
        <div class="absolute -right-10 -bottom-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative z-10 max-w-4xl space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            Simulador de Práctica Profesional Interdisciplinaria
          </div>

          <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Desafío Pericial y Negociación: <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">LexConstructa</span>
          </h1>

          <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
            Una excavación de dos subsuelos para una torre de 10 pisos provocó grietas de cizallamiento y asentamiento en una vivienda unifamiliar contigua. Como futuros arquitectos y letrados, deben resolver el conflicto en una <strong class="text-white">audiencia de mediación prejudicial obligatoria (Ley 26.589)</strong>, articulando la técnica constructiva con la responsabilidad civil (CCCN).
          </p>

          <!-- Métricas de la Simulación -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="text-xs text-slate-400">Duración Total</div>
              <div class="text-lg font-bold text-white font-mono">180 Minutos</div>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="text-xs text-slate-400">Equipos & Roles</div>
              <div class="text-lg font-bold text-orange-400 font-mono">4 Grupos / 20 Est.</div>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="text-xs text-slate-400">Marco Normativo</div>
              <div class="text-lg font-bold text-blue-400 font-mono">CCCN + Ley 26.589</div>
            </div>
            <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div class="text-xs text-slate-400">Agentes de Soporte</div>
              <div class="text-lg font-bold text-emerald-400 font-mono">3 Agentes IA</div>
            </div>
          </div>

          <!-- Acciones de Entrada -->
          <div class="flex flex-wrap items-center gap-3 pt-4">
            <button onclick="navigateSection('caso')" class="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition shadow-lg flex items-center gap-2">
              <span>Explorar el Caso y Antecedentes</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
            <button onclick="navigateSection('grupos')" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition border border-slate-700 flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <span>Ver Asignación de Roles</span>
            </button>
            <button onclick="startTimer(); navigateSection('panel-docente')" class="px-4 py-3 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 font-semibold text-sm transition border border-blue-700/50">
              Lanzar Simulación Docente
            </button>
          </div>
        </div>
      </div>

      <!-- MAPA DE RUTA DIDÁCTICA TEMPORAL (6 Fases) -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Cronograma Operativo de la Simulación (180 Minutos)
          </h2>
          <span class="text-xs text-slate-400">Progreso Sincronizado</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${LEX_DATA.fases.map(fase => `
            <div class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-smooth space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">${fase.rangoMin}</span>
                <span class="text-xs text-slate-500">Fase ${fase.id}</span>
              </div>
              <h3 class="text-sm font-bold text-white">${fase.nombre}</h3>
              <p class="text-xs text-slate-400 leading-relaxed">${fase.descripcion}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- VISIÓN INTERDISCIPLINARIA: ARQUITECTURA + DERECHO -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div class="w-10 h-10 rounded-lg bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold">
            ARQ
          </div>
          <h3 class="text-lg font-bold text-white">Vértice Técnico: Arquitectura y Construcción</h3>
          <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Identificación de fallas de submuración y socavación de taludes.</li>
            <li>Relevamiento de grietas vivas vs. patologías de humedad preexistentes.</li>
            <li>Cálculo de presupuestos periciales de apuntalamiento e inyección de resinas.</li>
            <li>Protocolo de seguridad según Decreto 911/96 y Código de Edificación.</li>
          </ul>
        </div>

        <div class="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div class="w-10 h-10 rounded-lg bg-orange-900/50 text-orange-400 flex items-center justify-center font-bold">
            LEG
          </div>
          <h3 class="text-lg font-bold text-white">Vértice Jurídico: Responsabilidad Civil y Negociación</h3>
          <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside">
            <li>Articulación de responsabilidad objetiva por actividad riesgosa (CCCN Art. 1757).</li>
            <li>Redacción formal de Carta Documento intimatoria bajo apercibimiento procesal.</li>
            <li>Estrategia en Sala de Mediación Prejudicial (Ley 26.589) para evitar 4 años de juicio.</li>
            <li>Administración del costo de obra paralizada y redacción del acta de acuerdo.</li>
          </ul>
        </div>
      </div>

    </div>
  `;
}

// ============================================================================
// 2. PANEL DOCENTE
// ============================================================================
function renderSectionPanelDocente() {
  const currentMin = Math.floor(STATE.timer.currentSeconds / 60);

  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO PANEL DOCENTE -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-blue-800/40 p-6 rounded-2xl shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-bold uppercase">Cátedra Interdisciplinaria</span>
            <span class="text-xs text-slate-400">Docente Arq. + Docente Abog.</span>
          </div>
          <h1 class="text-2xl font-black text-white">Centro de Control y Orquestación Docente</h1>
          <p class="text-xs text-slate-300">Supervisión en tiempo real de los 4 grupos, inyección de contingencias y control del cronograma.</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="setTimerMinutes(0)" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg font-mono">Reset 00:00</button>
          <button onclick="setTimerMinutes(70)" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-blue-300 rounded-lg font-mono">Ir a Docs (70m)</button>
          <button onclick="setTimerMinutes(110)" class="px-3 py-2 bg-orange-950/80 hover:bg-orange-900 border border-orange-500/40 text-xs text-orange-300 rounded-lg font-mono">Ir a Mediación (110m)</button>
        </div>
      </div>

      <!-- MATRIZ DE MONITOREO DE LOS 4 GRUPOS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${LEX_DATA.grupos.map((grp, idx) => {
          const evalScore = STATE.evaluaciones[grp.id] ? STATE.evaluaciones[grp.id].reduce((a,b)=>a+b,0) * 6.25 : 75;
          const isVecinos = grp.postura.includes('Damnificados');
          return `
            <div class="bg-slate-900 border ${grp.color} rounded-2xl p-5 space-y-4 shadow-lg">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold px-2 py-0.5 rounded ${grp.bgBadge}">${grp.id}</span>
                <span class="text-[11px] font-mono text-slate-400">${isVecinos ? 'Reclamante' : 'Demandado'}</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-white leading-snug">${grp.nombre}</h3>
                <p class="text-xs text-slate-400 mt-1">${grp.roles.length} Estudiantes asignados</p>
              </div>

              <!-- Indicadores de avance de cada grupo -->
              <div class="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Documento Pericial:</span>
                  <span class="font-bold text-emerald-400">85% Completo</span>
                </div>
                <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full w-[85%]"></div>
                </div>

                <div class="flex justify-between text-slate-400 pt-1">
                  <span>Puntuación Rúbrica:</span>
                  <span class="font-bold text-orange-400">${evalScore}/100</span>
                </div>
              </div>

              <!-- Acciones Docentes para este Grupo -->
              <div class="pt-2 flex gap-2">
                <button onclick="openInterventionModal('${grp.id}')" class="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition font-medium">
                  Intervenir Sala
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- INYECTOR MANUAL DE CRISIS / CONTINGENCIAS -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Inyector de Crisis y Perturbaciones en Tiempo Real
            </h2>
            <p class="text-xs text-slate-400">Los docentes pueden detonar imprevistos para desafiar la capacidad de adaptación de los estudiantes.</p>
          </div>
          <span class="text-xs text-slate-400 font-mono">Minuto actual: ${currentMin}m</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${LEX_DATA.cartasCrisis.map(crisis => {
            const isDisparada = STATE.activeCrises.includes(crisis.id);
            return `
              <div class="bg-slate-950 p-4 rounded-xl border ${crisis.color} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700">${crisis.codigo}</span>
                  <span class="text-[10px] font-bold uppercase ${isDisparada ? 'text-red-400' : 'text-slate-500'}">${isDisparada ? 'ACTIVA' : 'PROGRAMADA: '+crisis.minutoTrigger+'m'}</span>
                </div>
                <h4 class="text-sm font-bold text-white">${crisis.titulo}</h4>
                <p class="text-xs text-slate-400 line-clamp-2">${crisis.impacto}</p>
                <div class="pt-2 flex justify-between items-center border-t border-slate-800">
                  <span class="text-[11px] text-orange-400 font-mono">${crisis.consecuenciaEconomica}</span>
                  <button onclick="toggleCrisisManual('${crisis.id}')" class="px-3 py-1 text-xs rounded font-semibold ${isDisparada ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}">
                    ${isDisparada ? 'Desactivar' : 'Disparar Ahora'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}

// ============================================================================
// 3. CASO Y ANTECEDENTES
// ============================================================================
function renderSectionCaso() {
  const caso = LEX_DATA.caso;

  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO DEL EXPEDIENTE TÉCNICO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span class="text-xs font-mono text-orange-400 uppercase tracking-wider font-bold">Expediente Pericial Extrajudicial</span>
            <h1 class="text-2xl sm:text-3xl font-black text-white mt-1">${caso.titulo}</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">${caso.ubicacion} &bull; Ocurrido: ${caso.fechaIncidente}</p>
          </div>
          <button onclick="navigateSection('documentacion')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            <span>Generar Peritaje de Daños</span>
          </button>
        </div>

        <!-- COMPARACIÓN TÉCNICA DE LOS DOS INMUEBLES -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <!-- Obra en Construcción -->
          <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">Parte Reclamada (Obra)</span>
              <span class="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">10 Pisos</span>
            </div>
            <h3 class="text-lg font-bold text-white">${caso.obraDemandada.nombre}</h3>
            <p class="text-xs text-slate-300">${caso.obraDemandada.tipo} (${caso.obraDemandada.superficie})</p>
            <div class="text-xs text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <p><strong class="text-white">Estado:</strong> ${caso.obraDemandada.estadoObra}</p>
              <p><strong class="text-white">Constructora:</strong> ${caso.obraDemandada.empresaConstructora}</p>
              <p><strong class="text-white">D.O.:</strong> ${caso.obraDemandada.direccionObra}</p>
            </div>
          </div>

          <!-- Inmueble Afectado -->
          <div class="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Parte Reclamante (Lindero)</span>
              <span class="text-[10px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">Vivienda 45 Años</span>
            </div>
            <h3 class="text-lg font-bold text-white">${caso.inmuebleAfectado.propietario}</h3>
            <p class="text-xs text-slate-300">${caso.inmuebleAfectado.tipo}</p>
            <div class="text-xs text-slate-400 space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
              <strong class="text-white">Patologías Constatadas:</strong>
              <ul class="list-disc list-inside space-y-1 pt-1">
                ${caso.inmuebleAfectado.danosPrincipales.map(d => `<li>${d}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- EVIDENCIA TÉCNICA PERICIAL (FOTOGRAFÍAS Y RELEVAMIENTOS) -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Relevamiento Ocular de Daños Estructurales
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${caso.fotosEvidencia.map(ev => `
            <div class="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group hover:border-blue-500 transition-smooth">
              <!-- Visualizador de Croquis Pericial SVG -->
              <div class="h-40 bg-slate-900 relative flex items-center justify-center p-4 border-b border-slate-800">
                <svg class="w-full h-full text-slate-700" viewBox="0 0 200 120" fill="none">
                  <!-- Muro Medianero -->
                  <rect x="20" y="20" width="30" height="90" fill="#334155" stroke="#64748b" stroke-width="2"/>
                  <!-- Suelo / Excavación profunda -->
                  <path d="M50 80 L180 80 L180 110 L50 110 Z" fill="#1e293b"/>
                  <!-- Grieta diagonal a 45 grados en naranja de alarma -->
                  <path d="M25 40 L45 75" stroke="#f97316" stroke-width="3" stroke-dasharray="4 2"/>
                  <!-- Cota -->
                  <line x1="50" y1="80" x2="50" y2="20" stroke="#3b82f6" stroke-width="1" stroke-dasharray="2 2"/>
                  <text x="60" y="55" fill="#60a5fa" font-size="10" font-family="monospace">-4.20m</text>
                </svg>
                <span class="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded bg-red-950/80 border border-red-500 text-red-300">
                  ${ev.severidad}
                </span>
              </div>
              <div class="p-4 space-y-2">
                <div class="text-[10px] font-bold uppercase text-orange-400 font-mono">${ev.tipo}</div>
                <h4 class="text-sm font-bold text-white">${ev.titulo}</h4>
                <p class="text-xs text-slate-400 leading-relaxed">${ev.detalle}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MARCO NORMATIVO LEGAL (CCCN Y MEDIACIÓN) -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          Sustento Jurídico Aplicable
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${caso.marcoLegal.map(leg => `
            <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
              <div class="px-2 py-1 bg-blue-950 text-blue-300 border border-blue-700/40 rounded text-xs font-mono font-bold whitespace-nowrap">
                ${leg.norma}
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">${leg.concepto}</p>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// ============================================================================
// 4. ORGANIZACIÓN DE GRUPOS Y ROLES
// ============================================================================
function renderSectionGrupos() {
  const selectedGroup = LEX_DATA.grupos.find(g => g.id === STATE.activeGroupId) || LEX_DATA.grupos[0];

  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO Y SELECTOR DE GRUPOS -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-black text-white">Organización de Equipos y Roles Profesionales</h1>
            <p class="text-xs text-slate-400 mt-1">20 estudiantes divididos en 4 equipos de 5 integrantes. Cada rol posee responsabilidades diferenciadas.</p>
          </div>

          <!-- Selector de Grupo Activo -->
          <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            ${LEX_DATA.grupos.map(g => `
              <button onclick="setActiveGroup('${g.id}')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition font-mono ${g.id === STATE.activeGroupId ? 'bg-orange-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}">
                ${g.id}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- RESUMEN DEL GRUPO SELECCIONADO -->
        <div class="p-5 rounded-xl bg-slate-950 border ${selectedGroup.color} space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold px-2.5 py-1 rounded ${selectedGroup.bgBadge}">${selectedGroup.id}</span>
              <h3 class="text-lg font-bold text-white">${selectedGroup.nombre}</h3>
            </div>
            <span class="text-xs font-mono text-slate-400">${selectedGroup.postura}</span>
          </div>
          <div class="flex flex-wrap gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div><strong class="text-white">Pretensión Inicial:</strong> <span class="font-mono text-orange-400">$${(selectedGroup.pretensionInicial || selectedGroup.ofertaInicial).toLocaleString('es-AR')}</span></div>
            <div><strong class="text-white">Margen Límite:</strong> <span class="font-mono text-blue-400">$${(selectedGroup.limiteMinimoAceptable || selectedGroup.limiteMaximoOferta).toLocaleString('es-AR')}</span></div>
          </div>
        </div>
      </div>

      <!-- TARJETAS DETALLADAS DE CADA ROL EN EL EQUIPO -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${selectedGroup.roles.map((rol, i) => `
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-blue-500/60 transition-smooth">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Puesto #${i+1}</span>
              <span class="text-xs text-orange-400 font-medium">${rol.estudiante}</span>
            </div>
            <h4 class="text-base font-bold text-white">${rol.rol}</h4>
            <p class="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              ${rol.tarea}
            </p>
            <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
              <span>Estado: <strong class="text-emerald-400">En Sala</strong></span>
              <button onclick="openRoleGuideModal('${rol.rol}')" class="text-blue-400 hover:text-blue-300 underline">Guía del Rol</button>
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

function setActiveGroup(groupId) {
  STATE.activeGroupId = groupId;
  renderCurrentSection();
}

// ============================================================================
// 5. CENTRO DE AGENTES INTELIGENTES (3 Agentes de IA)
// ============================================================================
function renderSectionAgentes() {
  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-orange-400 font-bold uppercase">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          Motor Cognitivo Especializado
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white">Centro de Agentes Inteligentes</h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-3xl">
          Tres agentes diseñados para la transposición didáctica entre la arquitectura y el derecho. Asisten a los estudiantes en tiempo real con preguntas socráticas, validación formal de entregables y simulación de tensiones reales.
        </p>
      </div>

      <!-- LAS 3 TARJETAS PRINCIPALES DE LOS AGENTES -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        ${LEX_DATA.agentesIA.map(agente => `
          <div class="agent-card bg-slate-900 border ${agente.color} rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-5">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 uppercase tracking-wider font-bold">${agente.alias}</span>
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
              </div>
              <div>
                <h3 class="text-xl font-black text-white">${agente.nombre}</h3>
                <div class="text-xs font-semibold text-orange-400 mt-0.5">${agente.tag}</div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed">
                ${agente.especialidad}
              </p>

              <!-- Módulos de intervención predeterminados -->
              <div class="space-y-2 pt-2 border-t border-slate-800/80">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intervenciones Ejemplo:</div>
                ${agente.intervenciones.map(item => `
                  <div class="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <span class="text-[10px] font-bold text-blue-400">${item.nivel}</span>
                    <p class="text-slate-300 italic">"${item.dialogo}"</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Botón de consulta al agente -->
            <button onclick="openAgentChatModal('${agente.id}')" class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700">
              <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <span>Consultar a ${agente.nombre.split('/')[0]}</span>
            </button>
          </div>
        `).join('')}
      </div>

    </div>
  `;
}

// ============================================================================
// 6. DOCUMENTACIÓN PROFESIONAL
// ============================================================================
function renderSectionDocumentacion() {
  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-2">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-mono text-orange-400 uppercase font-bold">Laboratorio de Redacción Técnica y Letrada</span>
            <h1 class="text-2xl sm:text-3xl font-black text-white mt-1">Documentación Profesional</h1>
            <p class="text-xs sm:text-sm text-slate-300">Generación y validación formal de instrumentos fehacientes conforme a normativa CCCN.</p>
          </div>

          <div class="flex gap-2">
            <button onclick="setDocType('carta_documento')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${STATE.docDraft.tipo === 'carta_documento' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}">
              Carta Documento
            </button>
            <button onclick="setDocType('informe_pericial')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition ${STATE.docDraft.tipo === 'informe_pericial' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}">
              Informe Técnico Pericial
            </button>
          </div>
        </div>
      </div>

      <!-- EDITOR GUIADO Y VISUALIZADOR DE DOCUMENTO FORMAL -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- PANEL DE EDICIÓN GUIADA (ALUMNO) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              Editor Guiado con Validador Estructural
            </h3>
            <span class="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">Revisado por Agente Diseñador</span>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Remitente y Personería:</label>
              <input type="text" id="doc-remitente" value="${STATE.docDraft.remitente}" oninput="updateDocDraft('remitente', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-orange-500 outline-none">
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Destinatario:</label>
              <input type="text" id="doc-destinatario" value="${STATE.docDraft.destinatario}" oninput="updateDocDraft('destinatario', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-orange-500 outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Plazo Perentorio (Horas):</label>
                <input type="number" id="doc-plazo" value="${STATE.docDraft.plazoHoras}" oninput="updateDocDraft('plazoHoras', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:border-orange-500 outline-none">
              </div>
              <div>
                <label class="block text-slate-400 mb-1 font-semibold">Monto Reclamado ($ AR):</label>
                <input type="number" id="doc-monto" value="${STATE.docDraft.montoReclamo}" oninput="updateDocDraft('montoReclamo', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-orange-400 focus:border-orange-500 outline-none">
              </div>
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Descripción Fáctica y Patológica:</label>
              <textarea id="doc-hechos" rows="3" oninput="updateDocDraft('descripcionHechos', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-orange-500 outline-none">${STATE.docDraft.descripcionHechos}</textarea>
            </div>

            <div>
              <label class="block text-slate-400 mb-1 font-semibold">Apercibimiento Legal / Reserva de Derechos:</label>
              <textarea id="doc-apercibimiento" rows="2" oninput="updateDocDraft('apercibimiento', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:border-orange-500 outline-none">${STATE.docDraft.apercibimiento}</textarea>
            </div>

            <div class="pt-2 flex justify-between items-center border-t border-slate-800">
              <span class="text-[11px] text-slate-400">Validez Formal: <strong class="text-emerald-400">100% (5 de 5 requisitos)</strong></span>
              <button onclick="alert('Documento guardado y validado en el expediente.')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition">
                Guardar Borrador
              </button>
            </div>
          </div>
        </div>

        <!-- VISUALIZADOR ESTILO PAPEL FORMAL -->
        <div class="bg-white rounded-2xl p-8 text-slate-900 shadow-2xl space-y-4 font-serif text-xs leading-relaxed border-4 border-slate-300">
          <div class="border-b-2 border-slate-900 pb-3 flex justify-between items-center font-sans">
            <div>
              <div class="text-xs font-black tracking-widest text-slate-900 uppercase">REPÚBLICA ARGENTINA - CORREO OFICIAL</div>
              <div class="text-[10px] text-slate-600">COMUNICACIÓN FEHACIENTE CON VALOR PROBATORIO</div>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono font-bold text-red-700">CD N° 982.110.420 AR</span>
            </div>
          </div>

          <div class="space-y-1 font-mono text-[11px] bg-slate-50 p-3 border border-slate-200">
            <div><strong>DESTINATARIO:</strong> ${STATE.docDraft.destinatario}</div>
            <div><strong>REMITENTE:</strong> ${STATE.docDraft.remitente}</div>
            <div><strong>FECHA EMISIÓN:</strong> 23 de Noviembre de 2026</div>
          </div>

          <div class="space-y-3 text-slate-800 text-[12px] pt-2">
            <p>
              Por medio de la presente, en mi carácter de propietario/patrocinante letrado del inmueble sito en calle Sucre 1420, <strong>INTIMO a ustedes en el plazo perentorio e improrrogable de ${STATE.docDraft.plazoHoras} horas</strong> a proceder al cese de las actividades dañosas y al inmediato afianzamiento estructural preventivo.
            </p>
            <p class="font-sans bg-amber-50 p-2 border-l-4 border-amber-500 text-[11px]">
              <strong>HECHOS CONSTATADOS:</strong> ${STATE.docDraft.descripcionHechos}
            </p>
            <p>
              Asimismo, se reclama la suma provisoria de <strong>$${Number(STATE.docDraft.montoReclamo).toLocaleString('es-AR')}</strong> en concepto de indemnización por daño emergente directo, apuntalamiento pericial de urgencia y hospedaje temporal.
            </p>
            <p>
              <strong>APERCIBIMIENTO:</strong> ${STATE.docDraft.apercibimiento} Quedan ustedes debida y formalmente notificados.
            </p>
          </div>

          <div class="pt-6 flex justify-between items-end border-t border-slate-300 font-sans text-[10px] text-slate-500">
            <div>Sello Notarial / Matrícula CPAU 18.442</div>
            <div class="text-right">Firma y Aclaración de las Partes</div>
          </div>
        </div>

      </div>

    </div>
  `;
}

function updateDocDraft(field, value) {
  STATE.docDraft[field] = value;
  // Actualizar solo el visor sin perder foco
  renderCurrentSection();
}

function setDocType(tipo) {
  STATE.docDraft.tipo = tipo;
  renderCurrentSection();
}

// ============================================================================
// 7. SALA DE MEDIACIÓN
// ============================================================================
function renderSectionMediacion() {
  const brecha = Math.abs(STATE.reclamoVecinos - STATE.ofertaConstructora);
  const zopaExiste = STATE.ofertaConstructora >= 26000000 && STATE.reclamoVecinos <= 29000000;

  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO SALA DE AUDIENCIA -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-bold uppercase">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Audiencia Prejudicial en Curso (Ley 26.589)
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-white mt-2">Sala de Mediación y Negociación Cara a Cara</h1>
            <p class="text-xs sm:text-sm text-slate-300">Gestión de la ZOPA (Zona de Posible Acuerdo), control del taxímetro de obra y barra de tensión.</p>
          </div>

          <!-- Taxímetro en Sala -->
          <div class="bg-slate-950 p-4 rounded-xl border border-orange-500/40 text-right shadow-inner">
            <div class="text-[10px] uppercase font-bold text-slate-400">Taxímetro de Obra Paralizada</div>
            <div class="text-2xl font-black font-mono text-orange-400">$${Math.round(STATE.taximetroAccumulated).toLocaleString('es-AR')}</div>
            <div class="text-[10px] text-slate-500">$15.000 / minuto de demora</div>
          </div>
        </div>

        <!-- BARRA VISUAL DE TENSIÓN NEGOCIAL -->
        <div class="space-y-2 pt-4 border-t border-slate-800">
          <div class="flex justify-between items-center text-xs">
            <span class="text-slate-400 font-semibold">Tensión en la Mesa de Diálogo:</span>
            <span class="font-mono font-bold ${STATE.tensionPct > 70 ? 'text-red-400' : (STATE.tensionPct > 40 ? 'text-amber-400' : 'text-emerald-400')}">${STATE.tensionPct}% (${STATE.tensionPct > 70 ? 'Alerta de Ruptura Judicial' : 'Diálogo Activo'})</span>
          </div>
          <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div class="h-full rounded-full transition-all duration-500 ${STATE.tensionPct > 70 ? 'bg-red-500' : (STATE.tensionPct > 40 ? 'bg-amber-500' : 'bg-emerald-500')}" style="width: ${STATE.tensionPct}%"></div>
          </div>
        </div>
      </div>

      <!-- SIMULADOR INTERACTIVO DE OFERTAS Y BRECHA ZOPA -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Postura Vecinos -->
        <div class="bg-slate-900 border border-sky-500/40 rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-500/30">Vecinos Damnificados</span>
            <span class="text-xs text-slate-400">Reclamo Activo</span>
          </div>
          <div class="text-2xl font-black font-mono text-white">$${Number(STATE.reclamoVecinos).toLocaleString('es-AR')}</div>
          <p class="text-xs text-slate-400">Incluye reparación estructural integral, apuntalamiento pericial y 6 meses de alquiler provisorio.</p>
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400 font-semibold">Ajustar Reclamo:</label>
            <input type="range" min="24000000" max="45000000" step="500000" value="${STATE.reclamoVecinos}" oninput="setReclamo(this.value)" class="w-full accent-sky-500">
          </div>
        </div>

        <!-- Brecha / Calculadora de Acuerdo -->
        <div class="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-center space-y-4">
          <div class="space-y-1">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Distanciamiento Negocial</div>
            <div class="text-3xl font-black font-mono ${zopaExiste ? 'text-emerald-400' : 'text-orange-400'}">
              $${brecha.toLocaleString('es-AR')}
            </div>
            <div class="text-xs ${zopaExiste ? 'text-emerald-400 font-semibold' : 'text-slate-500'}">
              ${zopaExiste ? '¡ZOPA ALCANZADA! Posibilidad de Acuerdo Inmediato' : 'Brecha abierta: Se requiere concesión mutua'}
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div class="text-slate-300 font-semibold">Cláusulas de Canje Técnico:</div>
            <div class="text-left text-slate-400 space-y-1 text-[11px]">
              <label class="flex items-center gap-2">
                <input type="checkbox" checked class="accent-orange-500"> Constructora asume apuntalamiento directo
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" checked class="accent-orange-500"> Seguro de Caución por USD 100.000
              </label>
            </div>
          </div>

          <div class="flex gap-2">
            <button onclick="firmarActa(true)" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
              Firmar Acuerdo
            </button>
            <button onclick="firmarActa(false)" class="flex-1 py-2.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs transition">
              Cierre Sin Acuerdo
            </button>
          </div>
        </div>

        <!-- Postura Constructora -->
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/30">Constructora & D.O.</span>
            <span class="text-xs text-slate-400">Oferta Activa</span>
          </div>
          <div class="text-2xl font-black font-mono text-white">$${Number(STATE.ofertaConstructora).toLocaleString('es-AR')}</div>
          <p class="text-xs text-slate-400">Oferta máxima autorizada por el Fideicomiso más franquicia de seguro de todo riesgo construcción.</p>
          <div class="space-y-1">
            <label class="text-[11px] text-slate-400 font-semibold">Ajustar Oferta:</label>
            <input type="range" min="10000000" max="32000000" step="500000" value="${STATE.ofertaConstructora}" oninput="setOferta(this.value)" class="w-full accent-amber-500">
          </div>
        </div>

      </div>

    </div>
  `;
}

function setReclamo(val) {
  STATE.reclamoVecinos = Number(val);
  calculateTension();
  renderCurrentSection();
}

function setOferta(val) {
  STATE.ofertaConstructora = Number(val);
  calculateTension();
  renderCurrentSection();
}

function calculateTension() {
  const diff = Math.abs(STATE.reclamoVecinos - STATE.ofertaConstructora);
  let pct = Math.min(95, Math.max(15, Math.round((diff / 30000000) * 100)));
  STATE.tensionPct = pct;
  updateSidebarMeters();
}

function firmarActa(conAcuerdo) {
  if (conAcuerdo) {
    alert("¡ACUERDO PREJUDICIAL HOMOLOGADO!\n\nSe pautó indemnización de común acuerdo y plan de obras bajo apercibimiento de astreintes. La torre continúa sin juicio ordinario.");
  } else {
    alert("ACTA DE MEDIACIÓN FRACASADA.\n\nSe da por cerrada la instancia prejudicial sin acuerdo. Se habilita el juicio por daños y perjuicios (demora estimada: 3 a 5 años). Obra expuesta a medidas cautelares de paralización.");
  }
}

// ============================================================================
// 8. CARTAS DE CRISIS
// ============================================================================
function renderSectionCrisis() {
  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-2">
        <div class="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          Motor Dinamizador de Contingencias Lúdicas
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white">Cartas de Crisis & Eventos Disruptivos</h1>
        <p class="text-xs sm:text-sm text-slate-300">
          En la vida profesional real, las obras no ocurren en laboratorios estáticos. El clima, las inspecciones municipales y los medios de comunicación alteran las ecuaciones económicas y jurídicas.
        </p>
      </div>

      <!-- LISTA DE CARTAS DE CRISIS -->
      <div class="space-y-4">
        ${LEX_DATA.cartasCrisis.map(crisis => {
          const isActive = STATE.activeCrises.includes(crisis.id);
          return `
            <div class="bg-slate-900 border ${crisis.color} rounded-2xl p-6 space-y-4 shadow-xl">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-bold">${crisis.codigo}</span>
                  <h3 class="text-lg font-bold text-white">${crisis.titulo}</h3>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-orange-400 font-bold">${crisis.consecuenciaEconomica}</span>
                  <span class="px-2.5 py-1 text-xs font-bold rounded ${isActive ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400'}">
                    ${isActive ? 'DESENCADENADA' : 'Minuto ' + crisis.minutoTrigger}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="md:col-span-2 space-y-2">
                  <p class="text-slate-200 text-sm leading-relaxed">${crisis.descripcion}</p>
                  <p class="text-slate-400"><strong>Impacto Estructural y Procesal:</strong> ${crisis.impacto}</p>
                </div>
                <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div class="font-bold text-orange-400 uppercase text-[10px]">Opciones de Respuesta:</div>
                  <ul class="space-y-1 text-slate-300 list-disc list-inside">
                    ${crisis.opcionesDocente.map(op => `<li>${op}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

function toggleCrisisManual(crisisId) {
  if (STATE.activeCrises.includes(crisisId)) {
    STATE.activeCrises = STATE.activeCrises.filter(id => id !== crisisId);
  } else {
    STATE.activeCrises.push(crisisId);
  }
  const badge = document.getElementById('badge-crisis-count');
  if (badge) badge.innerText = STATE.activeCrises.length;
  renderCurrentSection();
}

// ============================================================================
// 9. EVALUACIÓN Y PUNTUACIÓN (RÚBRICA AUTÉNTICA)
// ============================================================================
function renderSectionEvaluacion() {
  const grp = LEX_DATA.grupos.find(g => g.id === STATE.activeGroupId) || LEX_DATA.grupos[0];
  const scores = STATE.evaluaciones[grp.id] || [3, 3, 3, 3];
  const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) * 6.25); // sobre 100

  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-mono text-emerald-400 uppercase font-bold">Evaluación Auténtica por Desempeño Profesional</span>
            <h1 class="text-2xl sm:text-3xl font-black text-white mt-1">Rúbrica de Evaluación & Puntuación</h1>
            <p class="text-xs sm:text-sm text-slate-300">Ponderación integral: rigor constructivo, solvencia letrada, negociación y ética universitaria.</p>
          </div>

          <!-- Selector de Grupo a Evaluar -->
          <div class="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span class="text-xs text-slate-400 font-bold px-2">Grupo:</span>
            ${LEX_DATA.grupos.map(g => `
              <button onclick="setActiveGroup('${g.id}')" class="px-3 py-1 text-xs font-bold rounded-lg font-mono transition ${g.id === grp.id ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
                ${g.id}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- SCORE GENERAL DEL EQUIPO -->
        <div class="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold px-2.5 py-1 rounded ${grp.bgBadge}">${grp.id} - ${grp.nombre}</span>
            <span class="text-xs text-slate-400">${grp.postura}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400">Calificación Global:</span>
            <span class="text-2xl font-black font-mono text-emerald-400">${totalScore} / 100</span>
          </div>
        </div>
      </div>

      <!-- CRITERIOS DE LA RÚBRICA PONDERADA -->
      <div class="space-y-4">
        ${LEX_DATA.rubricaEvaluacion.map((crit, idx) => {
          const currentVal = scores[idx];
          return `
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 class="text-base font-bold text-white">${crit.criterio}</h3>
                  <p class="text-xs text-slate-400">${crit.descripcion}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">Ponderación: ${crit.peso}</span>
                  <span class="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded">Nivel ${currentVal}</span>
                </div>
              </div>

              <!-- Selector de Niveles (1 a 4) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                ${crit.niveles.map(niv => `
                  <button onclick="setRubricScore(${idx}, ${niv.valor})" class="p-3.5 rounded-xl text-left transition border ${currentVal === niv.valor ? 'bg-blue-900/40 border-blue-500 text-white shadow-md' : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'}">
                    <div class="font-bold flex items-center justify-between mb-1">
                      <span>${niv.valor}. ${niv.etiqueta}</span>
                      ${currentVal === niv.valor ? '<span class="text-blue-400 font-bold">&check;</span>' : ''}
                    </div>
                    <p class="text-[11px] leading-relaxed">${niv.desc}</p>
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}

function setRubricScore(critIndex, scoreValue) {
  STATE.evaluaciones[STATE.activeGroupId][critIndex] = scoreValue;
  renderCurrentSection();
}

// ============================================================================
// 10. CIERRE Y REFLEXIÓN
// ============================================================================
function renderSectionCierre() {
  return `
    <div class="fade-in space-y-6">
      
      <!-- ENCABEZADO -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-2">
        <span class="text-xs font-mono text-blue-400 uppercase font-bold">Fase Final: Metacognición y Deontología</span>
        <h1 class="text-2xl sm:text-3xl font-black text-white mt-1">Cierre, Devolución y Reflexión Profesional</h1>
        <p class="text-xs sm:text-sm text-slate-300">
          Sistematización de aprendizajes tras la simulación: articulación entre la pericia técnica y el encuadre normativo.
        </p>
      </div>

      <!-- BALANCE INTERDISCIPLINARIO DE APRENDIZAJES -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-400 flex items-center justify-center font-bold text-xs">ARQ</div>
            <h3 class="text-base font-bold text-white">¿Qué aprendió el Arquitecto sobre el Derecho?</h3>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>La importancia de labrar <strong>actas notariales previas</strong> al inicio de una excavación para constatar el estado preexistente de los linderos.</li>
            <li>Que la responsabilidad por riesgo creado (CCCN 1757) es <strong>objetiva</strong>: no basta alegar "hice todo con cuidado"; el daño obliga a reparar.</li>
            <li>Que la Carta Documento debe responderse en plazo perentorio para evitar la configuración de presunciones en contra.</li>
          </ul>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-orange-900/60 text-orange-400 flex items-center justify-center font-bold text-xs">ABO</div>
            <h3 class="text-base font-bold text-white">¿Qué aprendió el Abogado sobre la Obra?</h3>
          </div>
          <ul class="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
            <li>Que paralizar una obra no siempre es la mejor solución técnica: una trinchera abierta bajo lluvia puede derrumbar la casa que se buscaba proteger.</li>
            <li>La diferencia entre un asentamiento diferencial y una fisura cosmética de revoque por dilatación térmica.</li>
            <li>Que las soluciones técnicas compensatorias (inyecciones de resina, submuraciones) valen más que un litigio judicial de 5 años.</li>
          </ul>
        </div>
      </div>

      <!-- BITÁCORA DE REFLEXIÓN DEL ESTUDIANTE -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          Bitácora Personal de Cierre de Cátedra
        </h3>
        <p class="text-xs text-slate-400">Redacta una breve síntesis sobre tu desempeño en el rol asumido y cómo resolvió tu equipo la negociación.</p>

        <textarea id="texto-reflexion" rows="4" placeholder="Escribe aquí tus conclusiones éticas, técnicas y estratégicas..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-orange-500 outline-none"></textarea>

        <div class="flex justify-between items-center pt-2">
          <span class="text-xs text-slate-500 font-mono">Simulación LexConstructa 2026</span>
          <button onclick="guardarReflexion()" class="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-lg">
            Registrar Reflexión y Finalizar
          </button>
        </div>
      </div>

    </div>
  `;
}

function guardarReflexion() {
  const txt = document.getElementById('texto-reflexion')?.value;
  if (!txt || txt.trim().length === 0) {
    alert("Por favor redacta tus observaciones en la bitácora antes de finalizar.");
    return;
  }
  alert("¡Reflexión registrada con éxito en tu legajo universitario!\n\nSe ha completado el ciclo de simulación de LexConstructa.");
}

// ============================================================================
// MODALES AUXILIARES E INTERACTIVIDAD
// ============================================================================
function openModal(title, contentHtml) {
  const modal = document.getElementById('app-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!modal || !titleEl || !bodyEl) return;

  titleEl.innerText = title;
  bodyEl.innerHTML = contentHtml;
  modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('app-modal');
  if (modal) modal.classList.add('hidden');
}

function openAgentChatModal(agentId) {
  const agente = LEX_DATA.agentesIA.find(a => a.id === agentId);
  if (!agente) return;

  const content = `
    <div class="space-y-4">
      <div class="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
        <strong class="text-orange-400">${agente.nombre}:</strong>
        <p class="text-slate-300 mt-1">${agente.especialidad}</p>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-semibold text-slate-400">Pregunta socrática o consulta técnica:</label>
        <div class="flex gap-2">
          <input type="text" id="agent-input-query" placeholder="Ej.: ¿Cómo justifico el daño moral ante la constructora?" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-blue-500">
          <button onclick="sendAgentQuery('${agentId}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">Enviar</button>
        </div>
      </div>

      <div id="agent-response-area" class="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2 hidden">
        <div class="text-[10px] uppercase font-bold text-blue-400 font-mono">Orientación del Agente:</div>
        <p id="agent-response-text" class="text-slate-200 leading-relaxed italic"></p>
      </div>
    </div>
  `;

  openModal(`Asistencia Cognitiva: ${agente.nombre.split('/')[0]}`, content);
}

function sendAgentQuery(agentId) {
  const input = document.getElementById('agent-input-query');
  const respArea = document.getElementById('agent-response-area');
  const respText = document.getElementById('agent-response-text');
  if (!input || !respArea || !respText) return;

  const query = input.value.trim();
  if (!query) return;

  respArea.classList.remove('hidden');
  respText.innerText = `Analizando tu consulta profesional desde el marco pedagógico... Considera que el reclamo no debe basarse en meras estimaciones subjetivas. Debes presentar un informe de cuantificación fehaciente (reparación del muro + hospedaje) y fundar la responsabilidad en el Art. 1757 del CCCN para evitar que la contraparte desestime la intimación en la mediación.`;
}

function openRoleGuideModal(rolNombre) {
  const content = `
    <div class="space-y-3 text-xs leading-relaxed">
      <p><strong class="text-white">Rol Profesional:</strong> ${rolNombre}</p>
      <div class="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
        <div class="font-bold text-orange-400">Objetivos Estratégicos:</div>
        <ul class="list-disc list-inside space-y-1 text-slate-300">
          <li>Participar activamente en la redacción documental del equipo.</li>
          <li>Aportar vocabulario técnico preciso (arquitectónico o jurídico).</li>
          <li>Defender los intereses asignados en la audiencia de mediación prejudicial.</li>
        </ul>
      </div>
    </div>
  `;
  openModal(`Guía Operativa del Rol`, content);
}

function openInterventionModal(groupId) {
  const content = `
    <div class="space-y-3 text-xs">
      <p class="text-slate-300">Como docente de cátedra, puedes ingresar un mensaje orientador o una corrección directa a la terminal de trabajo del <strong>${groupId}</strong>.</p>
      <textarea id="docente-intervencion-txt" rows="3" placeholder="Ej.: Recuerden verificar las juntas de dilatación antes de cotizar el apuntalamiento..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-orange-500"></textarea>
      <button onclick="alert('Orientación enviada al equipo ${groupId}.'); closeModal();" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">Enviar Orientación al Grupo</button>
    </div>
  `;
  openModal(`Intervención Docente: Sala ${groupId}`, content);
}
