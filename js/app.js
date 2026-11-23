/* =========================================================================
   IronBand — logique applicative
   PWA mobile-first · localStorage · minuteur · bibliothèque · carnet de charges
   ========================================================================= */

'use strict';

/* ------------------------------ Constantes ------------------------------ */

const STORE_KEY = 'ironband.v1';
const LEGACY_STORE_KEYS = ['ketofit.v1', 'kettleband.v1'];
const APP_VERSION = '1.2.0';

const GIF_CACHE_NAME = 'ironband-gifs-v1';
const GIF_URLS = [...new Set(EXERCISES.map((ex) => GIF_BASE + ex.gif))];

const DURATIONS = [
  {
    min: 15, label: 'Express', kb: 2, band: 1, sets: 3, rest: 45,
    hint: 'Express · 3 exercices (2 Kettlebell + 1 Bande) · 3 séries · repos 45–60 s'
  },
  {
    min: 30, label: 'Standard', kb: 3, band: 2, sets: 3, rest: 60, recommended: true,
    hint: 'Standard · 5 exercices (3 Kettlebell + 2 Bandes) · 3 à 4 séries · repos 60–90 s'
  },
  {
    min: 45, label: 'Complet', kb: 4, band: 2, sets: 4, rest: 90,
    hint: 'Complet · 6 exercices (4 Kettlebell + 2 Bandes) · 4 séries · repos 90 s'
  },
  {
    min: 60, label: 'Volume max', kb: 5, band: 3, sets: 4, rest: 90,
    hint: 'Volume max · 8 exercices (5 Kettlebell + 3 Bandes) · 4 séries · repos 90–120 s'
  }
];

const DAY_BY_DOW = { 0: 'rest7', 1: 'j1', 2: 'j2', 3: 'rest3', 4: 'j4', 5: 'j5', 6: 'rest6' };
const DOW_LABELS = { 1: 'Lun', 2: 'Mar', 3: 'Mer', 4: 'Jeu', 5: 'Ven', 6: 'Sam', 7: 'Dim' };
const MUSCLES = ['Tous', 'Pectoraux', 'Dos', 'Épaules', 'Bras', 'Jambes & Fessiers', 'Gainage'];

const RING_C = 2 * Math.PI * 44;

const byId = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/* ------------------------------- Utilitaires ---------------------------- */

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function esc(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function norm(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function pad(n) { return String(n).padStart(2, '0'); }

function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isoWeekKey(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const fDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - fDay + 3);
  const week = 1 + Math.round((t - firstThursday) / (7 * 864e5));
  return `${t.getUTCFullYear()}-W${pad(week)}`;
}

function mondayOfWeek(d = new Date()) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((d.getDay() + 6) % 7));
  return m;
}

function dateForDow(dow, base = new Date()) {
  const m = mondayOfWeek(base);
  const d = new Date(m);
  d.setDate(m.getDate() + (dow - 1));
  return d;
}

function fmtClock(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* --------------------------------- État --------------------------------- */

const state = {
  duration: 30,
  variant: 'A',
  selectedDay: null,
  selectedDayDate: null,
  quote: { last: -1, seen: [] },
  sessions: {},
  sets: {},
  done: {},
  usage: {},
  loads: {},
  installHidden: false
};

const offline = {
  total: GIF_URLS.length,
  cached: 0,
  failed: 0,
  running: false,
  ready: false
};

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    /* stockage indisponible (navigation privée) : l’app reste utilisable en mémoire */
  }
}

function loadState() {
  try {
    let raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORE_KEYS) {
        const legacy = localStorage.getItem(key);
        if (legacy) {
          raw = legacy;
          try { localStorage.setItem(STORE_KEY, legacy); } catch (err) { /* ignore */ }
          break;
        }
      }
    }
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return;
    if (DURATIONS.some((d) => d.min === saved.duration)) state.duration = saved.duration;
    if (['A', 'B', 'C'].includes(saved.variant)) state.variant = saved.variant;
    if (typeof saved.selectedDay === 'string') state.selectedDay = saved.selectedDay;
    if (typeof saved.selectedDayDate === 'string') state.selectedDayDate = saved.selectedDayDate;
    if (saved.quote && typeof saved.quote === 'object') {
      if (Number.isInteger(saved.quote.last)) state.quote.last = saved.quote.last;
      if (Array.isArray(saved.quote.seen)) state.quote.seen = saved.quote.seen.slice(-12);
    }
    ['sessions', 'sets', 'done', 'usage', 'loads'].forEach((k) => {
      if (saved[k] && typeof saved[k] === 'object') state[k] = saved[k];
    });
    if (saved.installHidden === true) state.installHidden = true;
    pruneOldWeeks();
  } catch (err) {
    /* état corrompu : on repart de zéro */
  }
}

function recentWeekKeys(count = 8) {
  const out = new Set();
  const d = new Date();
  for (let i = 0; i < count; i++) {
    out.add(isoWeekKey(d));
    d.setDate(d.getDate() - 7);
  }
  return out;
}

function pruneOldWeeks() {
  const allowed = recentWeekKeys(8);
  ['sessions', 'sets', 'done'].forEach((bucket) => {
    Object.keys(state[bucket]).forEach((key) => {
      const week = key.split('|')[0];
      if (!allowed.has(week)) delete state[bucket][key];
    });
  });
}

/* ---------------------------- Carnet de charges -------------------------- */

const noteTimers = {};

function bandById(id) {
  return BAND_LOADS.find((b) => b.id === id) || null;
}

function currentLoad(exId) {
  return state.loads[exId] || null;
}

function loadLabel(load) {
  if (!load || load.v == null) return '';
  if (load.eq === 'kb') return `KB ${load.v} kg`;
  const band = bandById(load.v);
  return band ? `Bande ${band.label}` : 'Bande';
}

function loadDateLabel(dateStr) {
  if (!dateStr) return '';
  if (dateStr === dateKey()) return 'aujourd’hui';
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(d);
}

function loadBadgeInner(load) {
  const label = loadLabel(load);
  if (!label) return 'Première fois · note ta charge';
  return `Dernière fois : <b>${esc(label)}</b> <span class="ll-date">· ${esc(loadDateLabel(load.date))}</span>`;
}

function loadChipsHTML(ex, load) {
  if (ex.equipment === 'kb') {
    return KB_LOADS.map((kg) => {
      const active = load && load.v === kg;
      return `<button type="button" class="load-chip ${active ? 'is-active' : ''}" data-act="load" data-ex="${ex.id}" data-v="${kg}" aria-pressed="${active}"><span class="dot" style="background:#ffb02e"></span>${kg} kg</button>`;
    }).join('');
  }
  return BAND_LOADS.map((band) => {
    const active = load && load.v === band.id;
    return `<button type="button" class="load-chip ${active ? 'is-active' : ''}" data-act="load" data-ex="${ex.id}" data-v="${band.id}" aria-pressed="${active}"><span class="dot" style="background:${band.color}"></span>${band.label} <span class="range">${band.range}</span></button>`;
  }).join('');
}

function loadBlockHTML(ex, context = 'card') {
  const load = currentLoad(ex.id);
  const hasContent = load && (load.v != null || (typeof load.note === 'string' && load.note.trim()));
  const clear = hasContent
    ? `<button type="button" class="load-clear" data-act="clear-load" data-ex="${ex.id}" aria-label="Effacer la charge enregistrée" title="Effacer">×</button>`
    : '';
  return `
    <div class="load-block" data-load-wrap="${ex.id}" data-context="${context}">
      <div class="load-head">
        <span class="load-title">Charge</span>
        <span class="last-load ${load && load.v != null ? '' : 'is-empty'}">${loadBadgeInner(load)}</span>
      </div>
      <div class="load-chips" role="group" aria-label="Choisir la charge pour ${esc(ex.name)}">
        ${loadChipsHTML(ex, load)}
      </div>
      <div class="load-note-row">
        <input class="load-note-input" type="text" maxlength="80" data-ex="${ex.id}"
          value="${esc(load && load.note ? load.note : '')}"
          placeholder="Reps exactes / remarque (ex. 10 reps propres)"
          aria-label="Note de charge pour ${esc(ex.name)}" autocomplete="off">
        ${clear}
      </div>
    </div>`;
}

function refreshLoadUI(exId) {
  const ex = byId[exId];
  if (!ex) return;
  $all(`[data-load-wrap="${exId}"]`).forEach((wrap) => {
    const context = wrap.dataset.context || 'card';
    wrap.outerHTML = loadBlockHTML(ex, context);
  });
}

function saveLoad(exId, value) {
  const ex = byId[exId];
  if (!ex) return;
  const prev = state.loads[exId] || {};
  const liveInput = document.querySelector(`.load-note-input[data-ex="${exId}"]`);
  const note = liveInput ? liveInput.value.slice(0, 80) : (typeof prev.note === 'string' ? prev.note : '');
  state.loads[exId] = {
    eq: ex.equipment,
    v: value,
    note,
    date: dateKey(),
    ts: Date.now()
  };
  saveState();
  refreshLoadUI(exId);
}

function clearLoad(exId) {
  if (!state.loads[exId]) return;
  delete state.loads[exId];
  saveState();
  refreshLoadUI(exId);
}

function saveLoadNote(exId, note) {
  const ex = byId[exId];
  if (!ex) return;
  const clean = String(note).slice(0, 80);
  const prev = state.loads[exId];
  if (!prev && !clean.trim()) return;
  state.loads[exId] = {
    eq: ex.equipment,
    v: prev ? prev.v : null,
    note: clean,
    date: dateKey(),
    ts: Date.now()
  };
  saveState();
  $all(`[data-load-wrap="${exId}"] .last-load`).forEach((badge) => {
    const load = state.loads[exId];
    badge.innerHTML = loadBadgeInner(load);
    badge.classList.toggle('is-empty', !loadLabel(load));
  });
}

/* ------------------------------- Sessions ------------------------------- */

function currentDuration() {
  return DURATIONS.find((d) => d.min === state.duration) || DURATIONS[1];
}

function weekKey() { return isoWeekKey(); }

function currentDayId() {
  const today = dateKey();
  if (state.selectedDay && state.selectedDayDate === today && PLANS[state.selectedDay]) {
    return state.selectedDay;
  }
  return DAY_BY_DOW[new Date().getDay()];
}

function sessionKeyFor(dayId, duration, variant = state.variant) {
  return `${weekKey()}|${dayId}|${duration.min}|${variant}`;
}

function slotsFor(plan, duration) {
  const slots = [];
  plan.kb.slice(0, duration.kb).forEach((focus) => slots.push({ equipment: 'kb', focus }));
  plan.band.slice(0, duration.band).forEach((focus) => slots.push({ equipment: 'band', focus }));
  return slots;
}

function weightedPick(pool, rng) {
  if (!pool.length) return null;
  const weights = pool.map((ex) => 1 / (1 + (state.usage[ex.id] || 0)));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function familyOf(name) {
  return norm(name)
    .replace(/\b(kettlebell|bandes?|elastiques?)\b/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join(' ');
}

function generateSession(dayId, duration, { seed, exclude = [] } = {}) {
  const plan = PLANS[dayId];
  if (!plan || plan.rest) return null;
  const excludeSet = new Set(exclude);
  const rng = mulberry32((seed !== undefined ? seed : hashString(sessionKeyFor(dayId, duration))) >>> 0);
  const ids = [];
  const used = new Set();
  const usedFamilies = new Set();

  for (const slot of slotsFor(plan, duration)) {
    const pool = EXERCISES.filter((e) => e.equipment === slot.equipment && e.focus === slot.focus);
    let candidates = pool.filter((e) => !used.has(e.id) && !excludeSet.has(e.id));
    if (!candidates.length) candidates = pool.filter((e) => !used.has(e.id));
    if (!candidates.length) candidates = pool;

    // Évite de répéter le même mouvement dans les deux blocs (ex. extension triceps KB + bande)
    const distinct = candidates.filter((e) => !usedFamilies.has(familyOf(e.name)));
    if (distinct.length) candidates = distinct;

    const picked = weightedPick(candidates, rng);
    if (!picked) continue;
    ids.push(picked.id);
    used.add(picked.id);
    usedFamilies.add(familyOf(picked.name));
    state.usage[picked.id] = (state.usage[picked.id] || 0) + 1;
  }
  return { seed, ids };
}

function ensureSession(dayId, duration, { regenerate = false } = {}) {
  const plan = PLANS[dayId];
  if (!plan || plan.rest) return null;
  const key = sessionKeyFor(dayId, duration);
  const expected = duration.kb + duration.band;
  const existing = state.sessions[key];
  const validExisting = existing && Array.isArray(existing.ids) &&
    existing.ids.length === expected && existing.ids.every((id) => byId[id]);

  if (validExisting && !regenerate) return existing;

  const exclude = validExisting ? existing.ids : [];
  const seed = validExisting
    ? (existing.seed + 1 + Math.floor(Math.random() * 997)) >>> 0
    : hashString(`${sessionKeyFor(dayId, duration)}|${APP_VERSION}`);
  const fresh = generateSession(dayId, duration, { seed, exclude });

  state.sessions[key] = fresh;
  if (validExisting) {
    const current = new Set(fresh.ids);
    const oldSets = state.sets[key] || {};
    Object.keys(oldSets).forEach((id) => {
      if (!current.has(id)) delete oldSets[id];
    });
    if (state.done[key]) delete state.done[key];
  }
  saveState();
  return fresh;
}

function getSets(key, exId, count) {
  if (!state.sets[key]) state.sets[key] = {};
  const arr = state.sets[key][exId];
  if (!Array.isArray(arr) || arr.length !== count) {
    state.sets[key][exId] = new Array(count).fill(false);
  }
  return state.sets[key][exId];
}

function sessionExercises(dayId, duration) {
  const sess = ensureSession(dayId, duration);
  if (!sess) return [];
  return sess.ids.map((id) => byId[id]).filter(Boolean);
}

function sessionStats(dayId, duration) {
  const key = sessionKeyFor(dayId, duration);
  const exercises = sessionExercises(dayId, duration);
  let total = 0;
  let done = 0;
  exercises.forEach((ex) => {
    const sets = getSets(key, ex.id, duration.sets);
    total += sets.length;
    done += sets.filter(Boolean).length;
  });
  return { key, exercises, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

/* --------------------------------- Quotes -------------------------------- */

function pickQuoteIndex(excludeList, rng = Math.random) {
  const exclude = new Set(excludeList);
  let pool = QUOTES.map((_, i) => i).filter((i) => !exclude.has(i));
  if (!pool.length) pool = QUOTES.map((_, i) => i);
  return pool[Math.floor(rng() * pool.length)];
}

function rotateQuote() {
  const recent = [state.quote.last, ...(state.quote.seen || [])].filter((i) => Number.isInteger(i) && i >= 0);
  const idx = pickQuoteIndex(recent.slice(0, 6));
  state.quote.last = idx;
  state.quote.seen = [...(state.quote.seen || []), idx].slice(-8);
  saveState();
  renderQuote(true);
}

function renderQuote(animate = false) {
  const el = $('#quoteText');
  if (!el) return;
  const idx = Number.isInteger(state.quote.last) && state.quote.last >= 0
    ? state.quote.last
    : pickQuoteIndex([]);
  if (!Number.isInteger(state.quote.last) || state.quote.last < 0) {
    state.quote.last = idx;
    state.quote.seen = [idx];
  }
  el.textContent = QUOTES[idx];
  if (animate) {
    el.animate(
      [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
      { duration: 260, easing: 'ease-out' }
    );
  }
}

/* ---------------------------- Rendu : durée ------------------------------ */

function renderDurationTabs() {
  const wrap = $('#durationTabs');
  wrap.innerHTML = DURATIONS.map((d) => `
    <button type="button" role="tab" class="seg-btn ${d.min === state.duration ? 'is-active' : ''}"
      aria-selected="${d.min === state.duration}" data-act="duration" data-min="${d.min}">
      ${d.min}<span>min</span><em>${d.label}</em>
    </button>
  `).join('');
  const d = currentDuration();
  $('#durationHint').textContent = d.hint;
}

/* ---------------------------- Rendu : semaine ---------------------------- */

function doneDaysThisWeek() {
  const prefix = `${weekKey()}|`;
  const set = new Set();
  Object.keys(state.done).forEach((k) => {
    if (!k.startsWith(prefix)) return;
    const dayId = k.split('|')[1];
    if (PLANS[dayId] && !PLANS[dayId].rest) set.add(dayId);
  });
  return set;
}

function renderWeekStrip() {
  const wrap = $('#weekStrip');
  const todayDow = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const selected = currentDayId();
  const done = doneDaysThisWeek();
  wrap.innerHTML = Object.keys(DOW_LABELS).map((dowStr) => {
    const dow = Number(dowStr);
    const dayId = DAY_BY_DOW[dow === 7 ? 0 : dow];
    const plan = PLANS[dayId];
    const date = dateForDow(dow);
    const classes = [
      'day-pill',
      plan && plan.rest ? 'is-rest' : '',
      dow === todayDow ? 'is-today' : '',
      dayId === selected ? 'is-selected' : '',
      done.has(dayId) ? 'is-done' : ''
    ].filter(Boolean).join(' ');
    return `
      <button type="button" class="${classes}" data-act="day" data-day="${dayId}"
        aria-label="${plan ? plan.day : ''} ${date.getDate()} — ${plan ? plan.title : ''}${done.has(dayId) ? ', séance validée' : ''}"
        aria-pressed="${dayId === selected}">
        <span class="dp-dow">${DOW_LABELS[dow]}</span>
        <span class="dp-num">${date.getDate()}</span>
        <span class="dp-dot" aria-hidden="true"></span>
      </button>`;
  }).join('');
}

function renderWeekBadge() {
  const n = doneDaysThisWeek().size;
  $('#weekBadge').innerHTML = `<b>${n}</b>/4`;
}

/* --------------------------- Rendu : exercices --------------------------- */

function gifTag(ex, cls, altSuffix = '', context = 'card') {
  const alt = `Démonstration animée : ${ex.name}${altSuffix}`;
  return `<img class="${cls}" src="${GIF_BASE}${ex.gif}" alt="${esc(alt)}" loading="lazy" decoding="async" data-ex="${ex.id}" data-context="${context}" onerror="ironbandGifFallback(this)">`;
}

function exerciseCardHTML(ex, idx, duration, key) {
  const sets = getSets(key, ex.id, duration.sets);
  const doneCount = sets.filter(Boolean).length;
  const equLabel = ex.equipment === 'kb' ? 'Kettlebell' : 'Bandes';
  return `
    <article class="ex-card equipment-${ex.equipment} ${doneCount === sets.length ? 'is-complete' : ''}" data-ex="${ex.id}">
      <div class="ex-top">
        ${gifTag(ex, 'ex-gif')}
        <div class="ex-info">
          <div class="ex-badges">
            <span class="badge ${ex.equipment === 'kb' ? 'kb' : 'band'}">${equLabel}</span>
            <span class="badge soft">${esc(ex.group)}</span>
          </div>
          <h3 class="ex-name">${esc(ex.name)}</h3>
          <p class="ex-meta"><b>${duration.sets} séries</b> × ${esc(ex.reps)}</p>
        </div>
        <button type="button" class="swap-btn" data-act="swap" data-index="${idx}"
          data-name="${esc(ex.name)}" aria-label="Remplacer ${esc(ex.name)} par un exercice équivalent"
          title="Varier cet exercice">🎲</button>
      </div>
      <div class="set-row" role="group" aria-label="Séries de ${esc(ex.name)}">
        <span class="set-label">Séries</span>
        ${sets.map((on, i) => `
          <button type="button" class="set-btn ${on ? 'is-done' : ''}" data-act="set" data-index="${idx}" data-set="${i}"
            aria-pressed="${on}" aria-label="Série ${i + 1} de ${esc(ex.name)}">${on ? '✓' : i + 1}</button>
        `).join('')}
      </div>
      ${loadBlockHTML(ex, 'card')}
      <div class="ex-foot">
        <button type="button" class="link-btn" data-act="technique" data-id="${ex.id}">
          <span aria-hidden="true">ⓘ</span> Technique &amp; charge
        </button>
        <span class="rest-hint">Repos ${duration.rest} s</span>
      </div>
    </article>`;
}

/* ---------------------------- Rendu : séance ----------------------------- */

function nextTrainingDay(fromId) {
  const order = ['j1', 'j2', 'rest3', 'j4', 'j5', 'rest6', 'rest7'];
  const start = order.indexOf(fromId);
  for (let i = 1; i <= order.length; i++) {
    const id = order[(start + i) % order.length];
    if (PLANS[id] && !PLANS[id].rest) return id;
  }
  return 'j1';
}

function renderSession() {
  const root = $('#sessionRoot');
  const dayId = currentDayId();
  const plan = PLANS[dayId];
  const duration = currentDuration();
  if (!plan) { root.innerHTML = ''; return; }

  if (plan.rest) {
    const nextId = nextTrainingDay(dayId);
    const next = PLANS[nextId];
    root.innerHTML = `
      <div class="rest-card">
        <div class="rest-emoji" aria-hidden="true">🌿</div>
        <h2>${esc(plan.title)}</h2>
        <p>${esc(plan.intention)}</p>
        <div class="next-session">Prochaine séance&nbsp;: <b>${esc(next.title)}</b><br>${esc(next.focus)}</div>
        <button type="button" class="primary-btn" data-act="goto-next" data-day="${nextId}">
          Voir la prochaine séance
        </button>
      </div>`;
    return;
  }

  const { key, exercises, total, done, pct } = sessionStats(dayId, duration);
  const kb = exercises.filter((e) => e.equipment === 'kb');
  const band = exercises.filter((e) => e.equipment === 'band');
  const isToday = DAY_BY_DOW[new Date().getDay()] === dayId;
  const isDone = Boolean(state.done[key]);
  const kIdx = (ex) => exercises.indexOf(ex);

  const kbCards = kb.map((ex) => exerciseCardHTML(ex, kIdx(ex), duration, key)).join('');
  const bandCards = band.map((ex) => exerciseCardHTML(ex, kIdx(ex), duration, key)).join('');

  root.innerHTML = `
    <div class="session-head">
      <div class="session-eyebrow"><span class="dot" aria-hidden="true"></span>${esc(plan.day)}${isToday ? ' · Aujourd’hui' : ''} · ${duration.min} min</div>
      <h2>${esc(plan.title)}</h2>
      <p class="session-focus">${esc(plan.focus)}</p>
      <div class="session-meta">
        <span class="meta-chip ratio-kb"><b>${kb.length}</b> Kettlebell${kb.length > 1 ? 's' : ''} · 70 %</span>
        <span class="meta-chip ratio-bd"><b>${band.length}</b> Bande${band.length > 1 ? 's' : ''} · 30 %</span>
        <span class="meta-chip"><b>${duration.sets}</b> séries</span>
        <span class="meta-chip">Repos ${duration.rest} s</span>
      </div>
      <p class="intention">${esc(plan.intention)}</p>
      <div class="variant-row">
        <span class="variant-label">Semaine</span>
        <div class="variant-switch" role="group" aria-label="Choisir une variante de séance">
          ${['A', 'B', 'C'].map((v) => `
            <button type="button" class="${state.variant === v ? 'is-active' : ''}" data-act="variant" data-variant="${v}"
              aria-pressed="${state.variant === v}" title="Variante ${v}">${v}</button>
          `).join('')}
        </div>
      </div>
      <button type="button" class="guided-btn" data-act="guided">
        <span class="play" aria-hidden="true">▶</span> Mode séance guidée
      </button>
      <button type="button" class="dice-btn" data-act="vary">
        <span class="dice" aria-hidden="true">🎲</span> Varier les exercices
      </button>
    </div>

    <details class="warmup">
      <summary>
        <span class="acc-icon" aria-hidden="true">🔥</span>
        <span class="acc-title">Échauffement<small>3 min · obligatoire avant la première série</small></span>
        <span class="acc-chev" aria-hidden="true">▾</span>
      </summary>
      <div class="acc-body">
        <p class="acc-intro">${esc(WARMUP.intro)}</p>
        <ul class="acc-list">
          ${WARMUP.items.map((it) => `<li><span class="acc-time">${it.t}</span><span><b>${esc(it.title)}</b><span class="d">${esc(it.desc)}</span></span></li>`).join('')}
        </ul>
      </div>
    </details>

    <section class="block" aria-label="Bloc 1 Kettlebell 70 %">
      <div class="block-head">
        <span class="block-bar kb" aria-hidden="true"></span>
        <h3>Bloc 1 · Kettlebell<small>70 % · Force &amp; volume</small></h3>
        <span class="block-count">${kb.length} exo${kb.length > 1 ? 's' : ''}</span>
      </div>
      ${kbCards}
    </section>

    <section class="block" aria-label="Bloc 2 Bandes élastiques 30 %">
      <div class="block-head">
        <span class="block-bar bd" aria-hidden="true"></span>
        <h3>Bloc 2 · Bandes élastiques<small>30 % · Congestion &amp; isolation</small></h3>
        <span class="block-count">${band.length} exo${band.length > 1 ? 's' : ''}</span>
      </div>
      ${bandCards}
    </section>

    <details class="warmup">
      <summary>
        <span class="acc-icon" aria-hidden="true">🧘</span>
        <span class="acc-title">Étirements<small>3 min · après la dernière série</small></span>
        <span class="acc-chev" aria-hidden="true">▾</span>
      </summary>
      <div class="acc-body">
        <p class="acc-intro">${esc(COOLDOWN.intro)}</p>
        <ul class="acc-list">
          ${COOLDOWN.items.map((it) => `<li><span class="acc-time">${it.t}</span><span><b>${esc(it.title)}</b><span class="d">${esc(it.desc)}</span></span></li>`).join('')}
        </ul>
      </div>
    </details>

    <div class="progress-card">
      <div class="progress-top">
        <strong>Progression de la séance</strong>
        <span id="progressText">${done}/${total} séries</span>
      </div>
      <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progression de la séance">
        <div class="progress-fill" id="progressFill" style="width:${pct}%"></div>
      </div>
      <button type="button" class="primary-btn ${isDone ? 'is-done' : ''}" id="validateBtn" data-act="validate">
        ${isDone ? 'Séance validée ✓' : 'Valider ma séance'}
      </button>
    </div>

    <p class="durations-hint" style="margin-top:12px">Astuce : coche une série pour lancer automatiquement le minuteur de repos.</p>
  `;
}

function updateProgressUI() {
  const dayId = currentDayId();
  const duration = currentDuration();
  const stats = sessionStats(dayId, duration);
  const text = $('#progressText');
  const fill = $('#progressFill');
  const track = fill ? fill.parentElement : null;
  if (text) text.textContent = `${stats.done}/${stats.total} séries`;
  if (fill) fill.style.width = `${stats.pct}%`;
  if (track) track.setAttribute('aria-valuenow', String(stats.pct));
}

/* ------------------------- Rendu : programme ----------------------------- */

function renderWeek() {
  const root = $('#weekRoot');
  const duration = currentDuration();
  const done = doneDaysThisWeek();
  const selected = currentDayId();
  const todayDow = new Date().getDay() === 0 ? 7 : new Date().getDay();

  const rows = Object.keys(DOW_LABELS).map((dowStr) => {
    const dow = Number(dowStr);
    const dayId = DAY_BY_DOW[dow === 7 ? 0 : dow];
    const plan = PLANS[dayId];
    const date = dateForDow(dow);
    const isRest = plan.rest;
    let exCount = 0;
    if (!isRest) {
      const sess = ensureSession(dayId, duration);
      exCount = sess ? sess.ids.length : 0;
    }
    const status = isRest ? 'Repos' : done.has(dayId) ? 'Validée ✓' : 'À faire';
    const classes = ['week-row', isRest ? 'is-rest' : '', dow === todayDow ? 'is-today' : '',
      done.has(dayId) ? 'is-done' : '', dayId === selected ? 'is-selected' : ''].filter(Boolean).join(' ');
    return `
      <button type="button" class="${classes}" data-act="goto-day" data-day="${dayId}"
        aria-label="${plan.day} — ${plan.title}${isRest ? '' : `, ${exCount} exercices`}">
        <span class="wr-date"><span class="d">${DOW_LABELS[dow]}</span><span class="n">${date.getDate()}</span></span>
        <span class="wr-main">
          <span class="wr-title">${esc(plan.title)}</span>
          <span class="wr-focus">${esc(plan.focus)}${isRest ? '' : ` · ${exCount} exercices`}</span>
        </span>
        <span class="wr-status">${status}</span>
      </button>`;
  }).join('');

  root.innerHTML = `
    <div class="variant-row" style="margin-bottom:14px">
      <span class="variant-label">Variantes</span>
      <div class="variant-switch" role="group" aria-label="Choisir la semaine A, B ou C">
        ${['A', 'B', 'C'].map((v) => `
          <button type="button" class="${state.variant === v ? 'is-active' : ''}" data-act="variant" data-variant="${v}"
            aria-pressed="${state.variant === v}">${v}</button>
        `).join('')}
      </div>
    </div>
    <p class="muted" style="margin-bottom:12px">Trois rotations pré-construites : passe de A à B ou C pour changer les exercices sans perdre ta progression. La durée sélectionnée (${duration.min} min) s’applique à toutes les séances.</p>
    ${rows}
    <div class="tips-card">
      <h3>7 règles de prise de masse</h3>
      <p>Le programme ne fait que la moitié du travail. L’autre moitié se joue dans l’assiette et le lit.</p>
      <ul class="tips-list">
        <li>Surplus de 250 à 400 kcal par jour : vise +0,25 à +0,5 kg par mois, pas plus.</li>
        <li>Protéines : 1,6 à 2 g par kg de poids de corps, réparties sur 3 à 4 repas.</li>
        <li>Glucides autour des séances : riz, pâtes, pommes de terre, flocons d’avoine.</li>
        <li>Dors 7 à 9 heures : la récupération et les hormones en dépendent.</li>
        <li>Progresse d’un seul paramètre à la fois : +1 répétition OU +2 kg, jamais les deux.</li>
        <li>Bois 2 à 3 litres d’eau par jour, encore plus les jours de séance.</li>
        <li>Le repos n’est pas une option : 3 jours par semaine, tu laisses le muscle pousser.</li>
      </ul>
    </div>
    <button type="button" class="offline-row" data-act="offline">
      <span class="or-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 18h9a4 4 0 0 0 .6-7.96A6 6 0 0 0 5.1 11.2 3.5 3.5 0 0 0 7 18Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10.5v6m0 0 2.2-2.2M12 16.5l-2.2-2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span class="or-text">
        <b>GIFs hors-ligne</b>
        <small class="offline-count">${offline.cached} / ${offline.total} GIFs en cache</small>
      </span>
      <span class="or-arrow" aria-hidden="true">›</span>
    </button>
    <button type="button" class="reset-btn" id="resetBtn">Réinitialiser mes données locales</button>
  `;
}

/* ------------------------ Rendu : bibliothèque --------------------------- */

const libState = { equip: 'all', muscle: 'Tous', query: '' };

function renderLibrary() {
  const grid = $('#libGrid');
  const equipWrap = $('#libEquip');
  $all('button', equipWrap).forEach((btn) => {
    const active = btn.dataset.equip === libState.equip;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  const chips = $('#libMuscles');
  chips.innerHTML = MUSCLES.map((m) => `
    <button type="button" class="chip-btn ${libState.muscle === m ? 'is-active' : ''}" data-muscle="${esc(m)}"
      aria-pressed="${libState.muscle === m}">${esc(m)}</button>
  `).join('');

  const q = norm(libState.query.trim());
  const filtered = EXERCISES.filter((ex) => {
    if (libState.equip !== 'all' && ex.equipment !== libState.equip) return false;
    if (libState.muscle !== 'Tous' && ex.group !== libState.muscle) return false;
    if (!q) return true;
    return norm(ex.name).includes(q) || norm(ex.group).includes(q) || norm(ex.source).includes(q);
  });

  const kbCount = filtered.filter((e) => e.equipment === 'kb').length;
  $('#libCount').textContent = `${filtered.length} exercice${filtered.length > 1 ? 's' : ''} · ${kbCount} kettlebell · ${filtered.length - kbCount} bandes`;

  grid.innerHTML = filtered.length ? filtered.map((ex) => `
    <button type="button" class="lib-card" data-lib="${ex.id}" aria-label="Voir la technique de ${esc(ex.name)}">
      ${gifTag(ex, 'lib-gif')}
      <span class="lib-name">${esc(ex.name)}</span>
      <span class="lib-sub">
        <span class="lib-group">${esc(ex.group)}</span>
        <span class="badge ${ex.equipment === 'kb' ? 'kb' : 'band'}">${ex.equipment === 'kb' ? 'KB' : 'BD'}</span>
      </span>
    </button>
  `).join('') : `<p class="empty">Aucun exercice ne correspond à cette recherche.<br>Essaie « rowing », « squat » ou efface les filtres.</p>`;
}

/* ------------------------------- Modale ---------------------------------- */

const FALLBACK_GIF = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <rect width="240" height="240" fill="#12151b"/>
  <circle cx="120" cy="142" r="44" fill="#ff9a3c" opacity=".22"/>
  <path d="M100 104c0-16 9-26 20-26s20 10 20 26" fill="none" stroke="#ffb02e" stroke-width="10" stroke-linecap="round" opacity=".7"/>
  <circle cx="120" cy="148" r="34" fill="#ffb02e" opacity=".55"/>
  <text x="120" y="208" text-anchor="middle" fill="#9aa4b2" font-family="system-ui,sans-serif" font-size="14" font-weight="600">Aperçu GIF indisponible</text>
</svg>`)}`;

function openTechnique(id) {
  const ex = byId[id];
  if (!ex) return;
  const modalRoot = $('#modalRoot');
  const isBand = ex.equipment === 'band';
  const equipmentLabel = isBand ? 'Bandes élastiques' : 'Kettlebell';
  const guide = LOAD_GUIDE[ex.equipment];

  modalRoot.innerHTML = `
    <div class="modal" id="techModal" role="dialog" aria-modal="true" aria-labelledby="techTitle">
      <div class="sheet">
        <button type="button" class="sheet-close" data-act="close-modal" aria-label="Fermer la fiche technique">✕</button>
        <div class="sheet-head">
          <div>
            <div class="ex-badges">
              <span class="badge ${isBand ? 'band' : 'kb'}">${equipmentLabel}</span>
              <span class="badge soft">${esc(ex.group)}</span>
              ${ex.proxy ? '<span class="badge proxy">démo proche</span>' : ''}
            </div>
            <h2 id="techTitle">${esc(ex.name)}</h2>
            <p class="sheet-sub">${esc(ex.reps)} · ${ex.proxy ? 'aperçu d’une variante proche' : 'démonstration du mouvement'}</p>
          </div>
        </div>

        ${gifTag(ex, 'gif-large', '', 'modal')}

        ${loadBlockHTML(ex, 'modal')}

        <div class="info-block ${isBand ? 'band-accent' : ''}">
          <h3>Position de départ</h3>
          <p>${esc(ex.setup)}</p>
        </div>

        <div class="info-block">
          <h3>Exécution pas à pas</h3>
          <ol class="steps-list">
            ${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}
          </ol>
          <div class="tempo-box"><span aria-hidden="true">⏱</span><span><b>Tempo :</b> ${esc(ex.tempo)}</span></div>
        </div>

        <div class="info-block">
          <h3>L’erreur de débutant à éviter</h3>
          <div class="alert"><span class="alert-icon" aria-hidden="true">⚠️</span><span>${esc(ex.mistake)}</span></div>
        </div>

        <div class="info-block ${isBand ? 'band-accent' : ''}">
          <h3>Quelle charge choisir ?</h3>
          <div class="load-note"><b>Pour cet exercice :</b> ${esc(ex.charge)}</div>
          <div class="load-list" style="margin-top:9px">
            ${guide.map((g) => `<div class="load-item"><b>${esc(g.name)}</b><span>${esc(g.use)}</span></div>`).join('')}
          </div>
        </div>

        <div class="tech-foot">
          <span>Démo : ${esc(ex.source)} · © Gym visual</span>
          <span>${ex.proxy ? 'variante proche' : 'mouvement exact'}</span>
        </div>
      </div>
    </div>`;

  document.body.classList.add('modal-open');
  const close = $('.sheet-close', modalRoot);
  if (close) close.focus({ preventScroll: true });
}

function closeModal() {
  const modalRoot = $('#modalRoot');
  modalRoot.innerHTML = '';
  document.body.classList.remove('modal-open');
}

function openInstallModal() {
  const modalRoot = $('#modalRoot');
  modalRoot.innerHTML = `
    <div class="modal" id="installModal" role="dialog" aria-modal="true" aria-labelledby="installTitle">
      <div class="sheet">
        <button type="button" class="sheet-close" data-act="close-modal" aria-label="Fermer les instructions d’installation">✕</button>
        <div class="sheet-head">
          <div>
            <div class="ex-badges"><span class="badge kb">PWA</span><span class="badge soft">Chrome Android</span></div>
            <h2 id="installTitle">Installer IronBand</h2>
            <p class="sheet-sub">Plein écran, icône sur l’écran d’accueil et fonctionnement hors-ligne.</p>
          </div>
        </div>

        <div class="info-block">
          <h3>Chrome sur Android — 2 clics</h3>
          <ol class="steps-list">
            <li>Ouvre l’adresse du site dans <b>Google Chrome</b>.</li>
            <li>Appuie sur le menu <b>⋮</b> en haut à droite.</li>
            <li>Choisis <b>« Installer l’application »</b> (ou « Ajouter à l’écran d’accueil »).</li>
            <li>Confirme : l’icône IronBand apparaît sur ton écran d’accueil.</li>
          </ol>
          <p style="margin-top:8px;font-size:12.5px">Sur ordinateur, utilise l’icône d’installation <b>⊕</b> à droite de la barre d’adresse.</p>
        </div>

        <div class="info-block">
          <h3>iPhone / iPad</h3>
          <p>Ouvre l’app dans <b>Safari</b>, appuie sur <b>Partager</b> puis <b>« Sur l’écran d’accueil »</b>.</p>
        </div>

        <div class="info-block">
          <h3>Hors-ligne</h3>
          <p>Une fois installée et ouverte au moins une fois, l’application démarre sans réseau. Les GIFs déjà consultés restent disponibles ; les autres se chargent à la prochaine connexion.</p>
        </div>

        <p class="load-note"><b>Astuce :</b> la PWA ne s’installe qu’en <b>HTTPS</b> (GitHub Pages) ou sur <b>localhost</b>.</p>
      </div>
    </div>`;
  document.body.classList.add('modal-open');
  const close = $('.sheet-close', modalRoot);
  if (close) close.focus({ preventScroll: true });
}

/* -------------------------------- Toast ---------------------------------- */

let toastTimer = null;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
}

/* ------------------------------- Actions --------------------------------- */

function setDuration(min) {
  if (!DURATIONS.some((d) => d.min === min)) return;
  if (state.duration === min) return;
  state.duration = min;
  saveState();
  renderDurationTabs();
  renderSession();
  renderWeek();
  renderWeekStrip();
}

function selectDay(dayId) {
  if (!PLANS[dayId]) return;
  state.selectedDay = dayId;
  state.selectedDayDate = dateKey();
  saveState();
  renderSession();
  renderWeekStrip();
  renderWeek();
  showView('seance');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setVariant(variant) {
  if (!['A', 'B', 'C'].includes(variant)) return;
  state.variant = variant;
  saveState();
  renderSession();
  renderWeek();
  renderWeekStrip();
  toast(`Variante ${variant} chargée`);
}

function varySession() {
  const dayId = currentDayId();
  const duration = currentDuration();
  if (!PLANS[dayId] || PLANS[dayId].rest) return;
  const previous = ensureSession(dayId, duration).ids.slice();
  ensureSession(dayId, duration, { regenerate: true });
  const next = state.sessions[sessionKeyFor(dayId, duration)].ids;
  const changed = next.filter((id) => !previous.includes(id)).length;
  if (!changed) {
    toast('Toutes les variantes de cette cible sont déjà utilisées. Change de semaine A/B/C.');
  } else {
    toast(`${changed} exercice${changed > 1 ? 's' : ''} remplacé${changed > 1 ? 's' : ''} 🎲`);
  }
  renderSession();
}

function swapExercise(index) {
  const dayId = currentDayId();
  const duration = currentDuration();
  const key = sessionKeyFor(dayId, duration);
  const sess = ensureSession(dayId, duration);
  if (!sess || !sess.ids[index]) return;
  const oldId = sess.ids[index];
  const oldEx = byId[oldId];
  if (!oldEx) return;
  const pool = EXERCISES.filter((e) =>
    e.equipment === oldEx.equipment && e.focus === oldEx.focus && !sess.ids.includes(e.id)
  );
  if (!pool.length) {
    toast('Aucune autre variante pour cette cible dans la bibliothèque.');
    return;
  }
  const next = weightedPick(pool, Math.random);
  sess.ids[index] = next.id;
  state.usage[next.id] = (state.usage[next.id] || 0) + 1;
  if (state.sets[key]) delete state.sets[key][oldId];
  saveState();
  renderSession();
  toast(`Remplacé par « ${next.name} »`);
}

function toggleSet(card, button, setIndex) {
  const duration = currentDuration();
  const dayId = currentDayId();
  const key = sessionKeyFor(dayId, duration);
  const exId = card.dataset.ex;
  const sets = getSets(key, exId, duration.sets);
  sets[setIndex] = !sets[setIndex];
  saveState();

  button.classList.toggle('is-done', sets[setIndex]);
  button.setAttribute('aria-pressed', String(sets[setIndex]));
  button.textContent = sets[setIndex] ? '✓' : String(setIndex + 1);

  const allDone = sets.every(Boolean);
  card.classList.toggle('is-complete', allDone);
  updateProgressUI();

  if (sets[setIndex]) startRest(duration.rest);
}

function validateSession() {
  const dayId = currentDayId();
  const duration = currentDuration();
  const plan = PLANS[dayId];
  if (!plan || plan.rest) return;
  const key = sessionKeyFor(dayId, duration);
  const stats = sessionStats(dayId, duration);

  if (state.done[key]) {
    if (window.confirm('Annuler la validation de cette séance ?')) {
      delete state.done[key];
      saveState();
      renderSession();
      renderWeek();
      renderWeekStrip();
      renderWeekBadge();
      toast('Validation annulée');
    }
    return;
  }

  if (stats.done === 0) {
    toast('Coche au moins une série avant de valider.');
    return;
  }
  if (stats.done < stats.total) {
    const rest = stats.total - stats.done;
    if (!window.confirm(`Il reste ${rest} série${rest > 1 ? 's' : ''} non cochée${rest > 1 ? 's' : ''}. Valider la séance quand même ?`)) return;
  }

  state.done[key] = new Date().toISOString();
  saveState();
  renderSession();
  renderWeek();
  renderWeekStrip();
  renderWeekBadge();
  vibrate([120, 60, 120, 60, 220]);
  toast('Séance validée 💪 Continue comme ça.');
}

function resetData() {
  if (!window.confirm('Effacer toutes tes données locales (séries, séances validées, variantes) ? Cette action est définitive.')) return;
  try { localStorage.removeItem(STORE_KEY); } catch (err) { /* ignore */ }
  state.sessions = {};
  state.sets = {};
  state.done = {};
  state.usage = {};
  state.quote = { last: -1, seen: [] };
  state.variant = 'A';
  state.duration = 30;
  state.selectedDay = null;
  state.selectedDayDate = null;
  saveState();
  rotateQuote();
  renderAll();
  toast('Données réinitialisées');
}

/* -------------------------------- Vues ----------------------------------- */

function showView(name) {
  ['seance', 'semaine', 'biblio'].forEach((v) => {
    const section = $(`#view-${v}`);
    if (section) section.hidden = v !== name;
  });
  $all('.nav-btn').forEach((btn) => {
    const active = btn.dataset.view === name;
    btn.classList.toggle('is-active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });
  if (name === 'biblio') renderLibrary();
  if (name === 'semaine') renderWeek();
}

/* -------------------------------- Timer ---------------------------------- */

const timer = {
  total: 60,
  endAt: 0,
  interval: null,
  running: false
};

let audioCtx = null;

function vibrate(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (err) { /* ignore */ }
  }
}

function beep() {  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    [0, 0.22].forEach((offset, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i === 0 ? 880 : 660;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.2);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.22);
    });
  } catch (err) {
    /* audio indisponible : la vibration suffit */
  }
}

function primeAudio() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (err) {
    /* audio indisponible */
  }
}

function renderTimer() {
  const panel = $('#timerPanel');
  const remaining = timer.running
    ? Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000))
    : Math.max(0, Math.round(timer.total));
  const ratio = timer.total > 0 ? Math.min(1, remaining / timer.total) : 0;
  $('#timerTime').textContent = fmtClock(remaining);
  $('#ringProgress').style.strokeDashoffset = String(RING_C * (1 - ratio));
  $all('.timer-quick button').forEach((b) => {
    b.classList.toggle('is-active', Number(b.dataset.rest) === timer.total);
  });
  panel.classList.remove('is-done');
}

function startRest(seconds) {
  const value = Number(seconds) || 60;
  const panel = $('#timerPanel');
  clearInterval(timer.interval);
  timer.total = value;
  timer.endAt = Date.now() + value * 1000;
  timer.running = true;
  panel.hidden = false;
  panel.classList.remove('is-done');
  $('#timerFab').hidden = true;
  renderTimer();
  timer.interval = setInterval(tickTimer, 200);
}

function tickTimer() {
  if (!timer.running) return;
  const remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
  const ratio = Math.min(1, remaining / timer.total);
  $('#timerTime').textContent = fmtClock(remaining);
  $('#ringProgress').style.strokeDashoffset = String(RING_C * (1 - ratio));
  if (remaining <= 0 || Date.now() >= timer.endAt) finishTimer();
}

function finishTimer() {
  timer.running = false;
  clearInterval(timer.interval);
  const panel = $('#timerPanel');
  panel.classList.add('is-done');
  $('#timerTime').textContent = 'Repos terminé 💪';
  $('#ringProgress').style.strokeDashoffset = '0';
  vibrate([200, 100, 200, 100, 300]);
  beep();
  toast('Repos terminé — à toi de jouer !');
}

function openTimerPanel() {
  const panel = $('#timerPanel');
  panel.hidden = false;
  $('#timerFab').hidden = true;
  if (!timer.running) renderTimer();
}

function closeTimerPanel() {
  const panel = $('#timerPanel');
  panel.hidden = true;
  $('#timerFab').hidden = false;
  if (timer.running) {
    timer.running = false;
    clearInterval(timer.interval);
  }
}

/* ------------------------------ Séance guidée ---------------------------- */

const guided = {
  open: false,
  dayId: null,
  duration: null,
  exercises: [],
  key: null,
  index: 0,
  set: 0,
  phase: 'work',
  restEnd: 0,
  restTotal: 0,
  interval: null,
  wake: null,
  pending: null
};

function guidedSetsFor(ex) {
  return getSets(guided.key, ex.id, guided.duration.sets);
}

function guidedDoneCount() {
  return guided.exercises.reduce((n, ex) => n + guidedSetsFor(ex).filter(Boolean).length, 0);
}

function guidedNextPosition() {
  if (!guided.open) return null;
  if (guided.set + 1 < guided.duration.sets) return { index: guided.index, set: guided.set + 1 };
  if (guided.index + 1 < guided.exercises.length) return { index: guided.index + 1, set: 0 };
  return null;
}

function guidedNextLabel(next) {
  if (!next) return 'Dernière série';
  const nextEx = guided.exercises[next.index];
  if (!nextEx) return '';
  return next.index === guided.index
    ? `${nextEx.name} · série ${next.set + 1}`
    : `${nextEx.name} · série 1`;
}

async function enterGuidedFullscreen() {
  try {
    const el = document.documentElement;
    if (document.fullscreenElement) return;
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  } catch (err) {
    /* plein écran refusé : l’overlay couvre quand même l’écran */
  }
}

function exitGuidedFullscreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
  } catch (err) {
    /* ignore */
  }
}

async function requestGuidedWakeLock() {
  try {
    if (!('wakeLock' in navigator) || guided.wake) return;
    guided.wake = await navigator.wakeLock.request('screen');
    guided.wake.addEventListener('release', () => { guided.wake = null; });
  } catch (err) {
    guided.wake = null;
  }
}

function releaseGuidedWakeLock() {
  try {
    if (guided.wake) {
      guided.wake.release();
      guided.wake = null;
    }
  } catch (err) {
    /* ignore */
  }
}

function startGuided() {
  const dayId = currentDayId();
  const plan = PLANS[dayId];
  if (!plan || plan.rest) return;
  closeModal();
  closeTimerPanel();

  const duration = currentDuration();
  const sess = ensureSession(dayId, duration);
  const exercises = sess.ids.map((id) => byId[id]).filter(Boolean);
  const key = sessionKeyFor(dayId, duration);

  let start = { index: 0, set: 0 };
  outer:
  for (let i = 0; i < exercises.length; i++) {
    const sets = getSets(key, exercises[i].id, duration.sets);
    for (let s = 0; s < sets.length; s++) {
      if (!sets[s]) {
        start = { index: i, set: s };
        break outer;
      }
    }
  }

  guided.open = true;
  guided.dayId = dayId;
  guided.duration = duration;
  guided.exercises = exercises;
  guided.key = key;
  guided.index = start.index;
  guided.set = start.set;
  guided.phase = 'work';
  guided.pending = null;
  guided.restEnd = 0;
  guided.restTotal = 0;

  document.body.classList.add('guided-open');
  renderGuided();
  primeAudio();
  enterGuidedFullscreen();
  requestGuidedWakeLock();
}

function closeGuided() {
  clearInterval(guided.interval);
  guided.interval = null;
  guided.open = false;
  guided.phase = 'work';
  guided.pending = null;
  const root = $('#guidedRoot');
  if (root) root.innerHTML = '';
  document.body.classList.remove('guided-open');
  exitGuidedFullscreen();
  releaseGuidedWakeLock();
  renderSession();
  renderWeekStrip();
  renderWeek();
  renderWeekBadge();
}

function guidedRest(next) {
  guided.pending = next;
  guided.phase = 'rest';
  guided.restTotal = guided.duration.rest;
  guided.restEnd = Date.now() + guided.restTotal * 1000;
  renderGuided();
  clearInterval(guided.interval);
  guided.interval = setInterval(guidedTick, 200);
}

function guidedTick() {
  if (!guided.open || guided.phase !== 'rest') return;
  const remaining = Math.max(0, Math.ceil((guided.restEnd - Date.now()) / 1000));
  const timeEl = $('#guidedTime');
  const ring = $('#guidedRing');
  if (timeEl) timeEl.textContent = fmtClock(remaining);
  if (ring) {
    const ratio = Math.min(1, remaining / guided.restTotal);
    ring.style.strokeDashoffset = String(RING_C * (1 - ratio));
  }
  if (Date.now() >= guided.restEnd) endGuidedRest();
}

function endGuidedRest() {
  clearInterval(guided.interval);
  guided.interval = null;
  beep();
  vibrate([120, 60, 120]);
  const next = guided.pending;
  guided.pending = null;
  if (next) guidedAdvance(next);
}

function guidedAdvance(next) {
  clearInterval(guided.interval);
  guided.interval = null;
  guided.index = next.index;
  guided.set = next.set;
  guided.phase = 'work';
  renderGuided();
  vibrate([40]);
}

function guidedFinishSet(mark) {
  if (!guided.open || guided.phase !== 'work') return;
  const ex = guided.exercises[guided.index];
  if (mark) {
    const sets = getSets(guided.key, ex.id, guided.duration.sets);
    sets[guided.set] = true;
    saveState();
  }
  const next = guidedNextPosition();
  if (!next) {
    guided.phase = 'done';
    clearInterval(guided.interval);
    guided.interval = null;
    renderGuided();
    if (mark) {
      beep();
      vibrate([100, 60, 100, 60, 200]);
    }
    return;
  }
  if (mark) guidedRest(next);
  else guidedAdvance(next);
}

function renderGuided() {
  const root = $('#guidedRoot');
  if (!root) return;
  if (!guided.open) {
    root.innerHTML = '';
    return;
  }

  const dur = guided.duration;
  const plan = PLANS[guided.dayId];
  const ex = guided.exercises[guided.index];
  const total = dur.sets * guided.exercises.length;
  const done = guidedDoneCount();
  const pct = total ? Math.round((done / total) * 100) : 0;
  const equLabel = ex.equipment === 'kb' ? 'Kettlebell' : 'Bandes';

  const top = `
    <div class="guided-top">
      <button type="button" class="guided-exit" data-act="guided-exit" aria-label="Quitter la séance guidée">✕</button>
      <span class="guided-top-title">${esc(plan.title)}</span>
      <span class="guided-count" aria-hidden="true">${done}/${total}</span>
    </div>
    <div class="guided-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progression de la séance guidée">
      <span style="width:${pct}%"></span>
    </div>`;

  let body = '';

  if (guided.phase === 'work') {
    body = `
      <div class="guided-body">
        <div class="guided-badges">
          <span class="badge ${ex.equipment === 'kb' ? 'kb' : 'band'}">${equLabel}</span>
          <span class="badge soft">${esc(ex.group)}</span>
        </div>
        ${gifTag(ex, 'guided-gif', '', 'guided')}
        <h2 class="guided-name">${esc(ex.name)}</h2>
        <p class="guided-serie" role="status">Série ${guided.set + 1} / ${dur.sets}</p>
        <div class="guided-meta"><span><b>${esc(ex.reps)}</b></span><span>Repos ${dur.rest} s</span></div>
        <p class="guided-tempo">Tempo : ${esc(ex.tempo)}</p>
        <p class="guided-load"><b>Charge :</b> ${esc(ex.charge)}</p>
      </div>
      <div class="guided-actions">
        <button type="button" class="guided-primary" data-act="guided-done">✓ Série terminée</button>
        <button type="button" class="guided-secondary" data-act="guided-skip">Passer la série</button>
        <button type="button" class="guided-quit" data-act="guided-exit">Quitter la séance guidée</button>
      </div>`;
  } else if (guided.phase === 'rest') {
    body = `
      <div class="guided-body guided-rest">
        <p class="label">Repos</p>
        <div class="guided-ring-wrap">
          <svg class="guided-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle class="bg" cx="50" cy="50" r="44"></circle>
            <circle class="fg" id="guidedRing" cx="50" cy="50" r="44"></circle>
          </svg>
          <span class="guided-time" id="guidedTime" aria-live="off">${fmtClock(guided.restTotal)}</span>
        </div>
        <p class="guided-rest-next">Ensuite : <b>${esc(guidedNextLabel(guided.pending))}</b></p>
        <div class="guided-rest-actions">
          <button type="button" class="skip" data-act="guided-skip-rest">Passer le repos</button>
          <button type="button" class="plus" data-act="guided-add">+15 s</button>
        </div>
      </div>`;
  } else {
    const complete = done === total;
    body = `
      <div class="guided-body guided-done">
        <div class="big-check" aria-hidden="true">✓</div>
        <h2>Séance terminée</h2>
        <p class="muted">${esc(plan.title)} · ${esc(plan.focus)}</p>
        <div class="guided-summary">
          <div><b>${done}/${total}</b><span>séries</span></div>
          <div><b>${guided.exercises.length}</b><span>exercices</span></div>
          <div><b>${dur.min} min</b><span>format</span></div>
        </div>
        <p class="muted" style="font-size:12px">${complete ? 'Toutes les séries sont cochées. Valide ta séance pour la compter.' : 'Il reste des séries non cochées : tu peux valider quand même.'}</p>
      </div>
      <div class="guided-actions">
        <button type="button" class="guided-primary" data-act="guided-validate">Valider ma séance</button>
        <button type="button" class="guided-secondary" data-act="guided-exit">Fermer sans valider</button>
      </div>`;
  }

  root.innerHTML = `<div class="guided-backdrop"><div class="guided" role="dialog" aria-modal="true" aria-label="Séance guidée">${top}${body}</div></div>`;

  const ring = $('#guidedRing');
  if (ring && guided.phase === 'rest') {
    const remaining = Math.max(0, Math.ceil((guided.restEnd - Date.now()) / 1000));
    ring.style.strokeDashoffset = String(RING_C * (1 - Math.min(1, remaining / guided.restTotal)));
  }
  const primary = root.querySelector('.guided-primary');
  if (primary) primary.focus({ preventScroll: true });
}

/* ----------------------------- Mode hors-ligne --------------------------- */

function updateOfflineIndicators() {
  const percent = offline.total ? Math.round((offline.cached / offline.total) * 100) : 0;
  const dot = $('#offlineDot');
  if (dot) dot.hidden = offline.total === 0 || offline.cached >= offline.total;
  const btn = $('#offlineBtn');
  if (btn) {
    btn.classList.toggle('is-busy', offline.running);
    btn.title = `GIFs hors-ligne : ${offline.cached}/${offline.total} en cache`;
  }
  $all('.offline-count').forEach((el) => {
    el.textContent = `${offline.cached} / ${offline.total} GIFs en cache`;
  });
  const bar = $('#offlineBar');
  if (bar) bar.style.width = `${percent}%`;
  const count = $('#offlineCount');
  if (count) count.textContent = `${offline.cached} / ${offline.total}`;
  const status = $('#offlineStatus');
  const startBtn = $('#offlineStart');
  if (status) {
    if (offline.running) {
      status.innerHTML = `<b>Téléchargement en cours…</b> ${offline.cached} / ${offline.total} GIFs. Garde l’app ouverte.`;
    } else if (offline.failed > 0) {
      status.innerHTML = `<b>${offline.failed} GIF(s) n’ont pas pu être téléchargés.</b> Vérifie ta connexion puis relance.`;
    } else if (offline.cached >= offline.total) {
      status.innerHTML = `<b>Tous les GIFs sont disponibles hors-ligne ✓</b> Tu peux t’entraîner sans réseau.`;
    } else {
      status.innerHTML = `<b>${offline.total - offline.cached} GIF(s) restent à télécharger.</b> Garde l’app ouverte pendant l’opération.`;
    }
  }
  if (startBtn) {
    startBtn.disabled = offline.running || offline.cached >= offline.total;
    startBtn.textContent = offline.running
      ? `Téléchargement… ${offline.cached}/${offline.total}`
      : offline.cached >= offline.total
        ? 'Tout est prêt ✓'
        : '📥 Télécharger les GIFs hors-ligne';
  }
}

async function countCachedGifs() {
  try {
    if (!('caches' in window)) { offline.ready = true; return; }
    const cache = await caches.open(GIF_CACHE_NAME);
    const keys = await cache.keys();
    const urls = new Set(keys.map((r) => r.url));
    offline.cached = GIF_URLS.filter((u) => urls.has(u)).length;
    offline.ready = true;
  } catch (err) {
    offline.ready = true;
  }
  updateOfflineIndicators();
}

function openOfflineModal() {
  const modalRoot = $('#modalRoot');
  modalRoot.innerHTML = `
    <div class="modal" id="offlineModal" role="dialog" aria-modal="true" aria-labelledby="offlineTitle">
      <div class="sheet">
        <button type="button" class="sheet-close" data-act="close-modal" aria-label="Fermer">✕</button>
        <div class="sheet-head">
          <div>
            <div class="ex-badges"><span class="badge band">Hors-ligne</span><span class="badge soft">GIFs</span></div>
            <h2 id="offlineTitle">Démonstrations sans réseau</h2>
            <p class="sheet-sub">Toute la bibliothèque en cache pour t’entraîner sans 4G.</p>
          </div>
        </div>
        <div class="offline-hero">
          <div class="offline-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 4v10m0 0 4-4m-4 4-4-4M6 18h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="offline-stats">
            <b id="offlineCount">${offline.cached} / ${offline.total}</b>
            <span>GIFs en cache sur cet appareil</span>
          </div>
        </div>
        <div class="offline-bar"><span id="offlineBar" style="width:0%"></span></div>
        <p class="offline-status" id="offlineStatus"></p>
        <div class="offline-actions">
          <button type="button" class="primary-btn" id="offlineStart" data-act="download-gifs">📥 Télécharger les GIFs hors-ligne</button>
        </div>
        <p class="offline-note"><b>Comment ça marche :</b> les GIFs proviennent de GitHub. Une fois téléchargés, ils sont stockés durablement sur ton téléphone et s’affichent même sans réseau. La première visite d’un GIF le met déjà en cache automatiquement.</p>
      </div>
    </div>`;
  document.body.classList.add('modal-open');
  updateOfflineIndicators();
  countCachedGifs();
  const close = $('.sheet-close', modalRoot);
  if (close) close.focus({ preventScroll: true });
}

async function downloadGifs() {
  if (offline.running) return;
  if (!('caches' in window)) {
    toast('Le cache hors-ligne n’est pas disponible dans ce navigateur.');
    return;
  }
  offline.running = true;
  offline.failed = 0;
  updateOfflineIndicators();

  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      await navigator.storage.persist().catch(() => {});
    }
  } catch (err) { /* ignore */ }

  let cache;
  try {
    cache = await caches.open(GIF_CACHE_NAME);
  } catch (err) {
    offline.running = false;
    updateOfflineIndicators();
    toast('Impossible d’ouvrir le cache hors-ligne.');
    return;
  }

  let have = new Set();
  try {
    const keys = await cache.keys();
    have = new Set(keys.map((r) => r.url));
  } catch (err) { /* ignore */ }
  const queue = GIF_URLS.filter((u) => !have.has(u));

  if (!queue.length) {
    offline.cached = offline.total;
    offline.running = false;
    updateOfflineIndicators();
    toast('Tous les GIFs sont déjà hors-ligne ✓');
    return;
  }

  let cursor = 0;
  const worker = async () => {
    while (true) {
      const i = cursor++;
      if (i >= queue.length) return;
      const url = queue[i];
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res && (res.ok || res.type === 'opaque')) {
          try {
            await cache.put(url, res.clone());
            offline.cached += 1;
          } catch (err) {
            offline.failed += 1;
          }
        } else {
          offline.failed += 1;
        }
      } catch (err) {
        offline.failed += 1;
      }
      updateOfflineIndicators();
    }
  };

  const concurrency = Math.min(4, queue.length);
  await Promise.all(Array.from({ length: concurrency }, () => worker()));

  try {
    const keys = await cache.keys();
    const urls = new Set(keys.map((r) => r.url));
    offline.cached = GIF_URLS.filter((u) => urls.has(u)).length;
  } catch (err) { /* ignore */ }

  offline.running = false;
  updateOfflineIndicators();
  if (offline.cached >= offline.total) {
    toast('Tous les GIFs sont disponibles hors-ligne 📥');
  } else if (offline.failed > 0) {
    toast(`${offline.failed} GIF(s) en échec — relance le téléchargement.`);
  } else {
    toast(`${offline.cached}/${offline.total} GIFs en cache.`);
  }
  vibrate([80, 40, 80]);
}

/* -------------------------------- Installation --------------------------- */

let deferredPrompt = null;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
}

function updateInstallButton() {
  const btn = $('#installBtn');
  if (!btn) return;
  const hide = isStandalone() || state.installHidden;
  btn.hidden = hide;
}

async function handleInstallClick() {
  if (deferredPrompt) {
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        state.installHidden = true;
        saveState();
        updateInstallButton();
        toast('IronBand s’installe…');
      }
    } catch (err) {
      openInstallModal();
    }
    deferredPrompt = null;
    return;
  }
  openInstallModal();
}

/* ----------------------------- Rendu global ------------------------------ */

function renderAll() {
  renderDurationTabs();
  renderWeekStrip();
  renderSession();
  renderWeek();
  renderWeekBiblio();
  renderWeekBadge();
}

function renderWeekBiblio() {
  if (!$('#view-biblio').hidden) renderLibrary();
}

/* -------------------------------- Events --------------------------------- */

function bindEvents() {
  document.addEventListener('click', (event) => {
    primeAudio();
    const target = event.target.closest('[data-act]');
    if (!target) return;
    const act = target.dataset.act;

    switch (act) {
      case 'duration':
        setDuration(Number(target.dataset.min));
        break;
      case 'day':
      case 'goto-day':
        selectDay(target.dataset.day);
        break;
      case 'variant':
        setVariant(target.dataset.variant);
        break;
      case 'vary':
        varySession();
        break;
      case 'swap':
        swapExercise(Number(target.dataset.index));
        break;
      case 'set': {
        const card = target.closest('.ex-card');
        if (card) toggleSet(card, target, Number(target.dataset.set));
        break;
      }
      case 'technique':
        openTechnique(target.dataset.id);
        break;
      case 'load': {
        const exId = target.dataset.ex;
        const ex = byId[exId];
        if (ex) {
          const isNumeric = ex.equipment === 'kb';
          saveLoad(exId, isNumeric ? Number(target.dataset.v) : target.dataset.v);
        }
        break;
      }
      case 'clear-load':
        clearLoad(target.dataset.ex);
        break;
      case 'offline':
        openOfflineModal();
        break;
      case 'download-gifs':
        downloadGifs();
        break;
      case 'guided':
        startGuided();
        break;
      case 'guided-done':
        guidedFinishSet(true);
        break;
      case 'guided-skip':
        guidedFinishSet(false);
        break;
      case 'guided-skip-rest': {
        clearInterval(guided.interval);
        guided.interval = null;
        const pending = guided.pending;
        guided.pending = null;
        if (pending) guidedAdvance(pending);
        break;
      }
      case 'guided-add':
        if (guided.phase === 'rest') {
          guided.restEnd += 15000;
          guided.restTotal += 15;
          guidedTick();
        }
        break;
      case 'guided-exit':
        closeGuided();
        break;
      case 'guided-validate':
        closeGuided();
        validateSession();
        break;
      case 'validate':
        validateSession();
        break;
      case 'goto-next':
        selectDay(target.dataset.day);
        break;
      case 'close-modal':
        closeModal();
        break;
      default:
        break;
    }
  });

  document.addEventListener('input', (event) => {
    const input = event.target.closest('.load-note-input');
    if (!input) return;
    const exId = input.dataset.ex;
    clearTimeout(noteTimers[exId]);
    noteTimers[exId] = setTimeout(() => saveLoadNote(exId, input.value), 350);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (guided.open) closeGuided();
      else if ($('#modalRoot').children.length) closeModal();
      else if (!$('#timerPanel').hidden) closeTimerPanel();
    }
  });

  // Fermeture de la modale en cliquant sur le fond
  $('#modalRoot').addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) closeModal();
  });

  // Phrase suivante
  $('#quoteNext').addEventListener('click', rotateQuote);

  // Bibliothèque
  $('#libEquip').addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-equip]');
    if (!btn) return;
    libState.equip = btn.dataset.equip;
    renderLibrary();
  });

  $('#libMuscles').addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-muscle]');
    if (!btn) return;
    libState.muscle = btn.dataset.muscle;
    renderLibrary();
  });

  $('#libSearch').addEventListener('input', (event) => {
    libState.query = event.target.value;
    renderLibrary();
  });

  $('#libGrid').addEventListener('click', (event) => {
    const card = event.target.closest('button[data-lib]');
    if (card) openTechnique(card.dataset.lib);
  });

  // Navigation
  $all('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });

  // Programme : réinitialisation
  document.addEventListener('click', (event) => {
    if (event.target.closest('#resetBtn')) resetData();
  });

  // Minuteur
  $('#timerFab').addEventListener('click', openTimerPanel);
  $('#timerClose').addEventListener('click', closeTimerPanel);
  $('#timerStop').addEventListener('click', closeTimerPanel);
  $('#timerAdd').addEventListener('click', () => {
    if (!timer.running) { startRest(30); return; }
    timer.endAt += 30000;
    timer.total += 30;
    renderTimer();
  });
  $all('.timer-quick button').forEach((btn) => {
    btn.addEventListener('click', () => startRest(Number(btn.dataset.rest)));
  });

  // Installation
  $('#installBtn').addEventListener('click', handleInstallClick);
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    updateInstallButton();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    state.installHidden = true;
    saveState();
    updateInstallButton();
    toast('IronBand installée ✓');
  });

  // Retour au premier plan : on rafraîchit la séance du jour
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      renderWeekStrip();
      renderWeekBadge();
      if (guided.open) requestGuidedWakeLock();
    }
  });
}

/* --------------------------- Service worker ------------------------------ */

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (location.protocol !== 'https:' && !isLocal) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {
      /* le hors-ligne est un bonus : l’app fonctionne sans SW */
    });
  });
}

/* --------------------------------- Init ---------------------------------- */

function init() {
  loadState();
  updateInstallButton();
  // À chaque ouverture : une phrase différente, sans répétition immédiate
  rotateQuote();
  renderAll();
  showView('seance');
  bindEvents();
  registerServiceWorker();
  countCachedGifs();
  document.documentElement.dataset.appVersion = APP_VERSION;
  if (isStandalone()) document.documentElement.dataset.standalone = 'true';
}

// Secours visuel : GIF absent du cache et réseau indisponible
const FALLBACK_ICON = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 8v8M4 9v6M17 8v8M20 9v6M7 12h10"/></svg>`;

function exerciseFallbackNode(ex, context) {
  const box = document.createElement('div');
  if (context === 'modal') {
    box.className = 'gif-fallback-large';
    box.innerHTML = `
      <div class="fb-head">${FALLBACK_ICON}<span>Démo GIF indisponible hors-ligne</span></div>
      <p class="fb-setup"><b>Position de départ :</b> ${esc(ex.setup)}</p>
      <p><b>Exécution :</b></p>
      <ol>${ex.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  } else if (context === 'guided') {
    box.className = 'gif-fallback';
    box.innerHTML = `${FALLBACK_ICON}<span>Démo hors-ligne<br>fiche Technique</span>`;
  } else {
    box.className = 'gif-fallback';
    box.innerHTML = `${FALLBACK_ICON}<span>Hors-ligne</span>`;
  }
  return box;
}

window.ironbandGifFallback = function ironbandGifFallback(img) {
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  const ex = byId[img.dataset.ex];
  if (!ex) {
    img.classList.add('gif-failed');
    img.removeAttribute('onerror');
    img.src = FALLBACK_GIF;
    img.alt = 'Aperçu indisponible — consulte la fiche technique';
    return;
  }
  const context = img.dataset.context || 'card';
  img.replaceWith(exerciseFallbackNode(ex, context));
};

init();
