/*
 * App del jugador de PuntoPeak (español / inglés).
 * - Bienestar: 5 ítems de McLean et al. (2010), de 1 (muy mal) a 5 (muy bien).
 * - RPE de sesión: escala CR-10 (0-10), ~30 min después de la sesión (Foster et al., 2001).
 * Habla con Supabase solo mediante funciones (RPC) que validan el código personal del jugador.
 * ?demo=1 muestra la app con datos de ejemplo, sin conectarse ni guardar nada.
 */
(function () {
  "use strict";
  const CFG = window.PP_CONFIG || {};
  const app = document.getElementById("app");
  const params = new URLSearchParams(location.search);
  // ?demo=1: jugador del primer equipo (GPS) · ?demo=filial: jugador del filial (sin GPS, 3 partidos de Veo)
  const DEMO = ["1", "filial"].includes(params.get("demo"));
  const DEMO_FILIAL = params.get("demo") === "filial";

  // ---------- Almacenamiento local (puede no estar disponible) ----------
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } },
  };

  // ---------- Código personal: llega en el enlace (?t=...) y se recuerda en el móvil ----------
  let token = params.get("t");
  if (!DEMO) {
    if (token) store.set("pp_token", token);
    else token = store.get("pp_token");
  }

  // ---------- Textos ----------
  const TEXT = {
    es: {
      hello: "Hola",
      task_w: "¿Cómo llegas hoy?", task_w_hint: "Bienestar · 20 segundos",
      task_r: "¿Cómo de dura ha sido la sesión?", task_r_hint: "Esfuerzo percibido · después de entrenar",
      pending: "Pendiente", done: "Hecho",
      my_data: "Mis datos", wellness_14: "Tu bienestar · últimos 14 días",
      good: "Bien", normal: "Normal", low: "Bajo",
      km: "km", last7: "Últimos 7 días", matches: "partidos", equals: "Equivale a", kmh: "km/h", vmax: "Tu velocidad máx.",
      gps_until: "Datos del GPS hasta el",
      back: "Volver", previous: "Anterior",
      q_fatigue: "¿Cómo de fresco estás?", a_fatigue: ["Agotado", "Muy fresco"],
      q_sleep: "¿Cómo has dormido?", a_sleep: ["Fatal", "Muy bien"],
      q_sore: "¿Cómo están tus músculos?", a_sore: ["Muy cargados", "Perfectos"],
      q_stress: "¿Cómo de tranquilo estás?", a_stress: ["Muy estresado", "Muy relajado"],
      q_mood: "¿Cómo está tu ánimo?", a_mood: ["Muy bajo", "Muy alto"],
      pain_q: "¿Te duele algo?", pain_hint: "Toca la zona. Si no te duele nada, envía directamente.",
      front: "Delante", rear: "Detrás", send: "Enviar", send_nothing: "No me duele nada · Enviar",
      rpe_hint: "Piensa en la sesión completa, de principio a fin.",
      rpe: ["Reposo", "Muy, muy fácil", "Fácil", "Moderado", "Algo duro", "Duro", "", "Muy duro", "", "", "Máximo"],
      thanks: "¡Gracias!", thanks_w: "Tu bienestar de hoy está registrado.", thanks_r: "El esfuerzo de hoy está registrado.",
      home: "Volver al inicio",
      invalid: "Enlace no válido", invalid_hint: "Pide al cuerpo técnico tu enlace personal de PuntoPeak.",
      offline: "Sin conexión", offline_hint: "Comprueba tu conexión e inténtalo de nuevo.", retry: "Reintentar",
      send_error: "No se ha podido enviar. Comprueba tu conexión e inténtalo de nuevo.",
      install_title_ios: "Instala PuntoPeak en tu iPhone", install_title: "Instala PuntoPeak en tu móvil",
      install_other_ios: "En iPhone solo se puede instalar desde <b class='inline'>Safari</b>. Copia el enlace, ábrelo en Safari y sigue los pasos.",
      copy_link: "Copiar enlace", link_copied: "Enlace copiado",
      ios_step1: "Pulsa {share} <b class='inline'>Compartir</b> en la barra de Safari.",
      ios_step2: "Elige {add} <b class='inline'>Añadir a pantalla de inicio</b>.",
      ios_step3: "Abre PuntoPeak desde el icono nuevo.",
      install_why: "Tendrás su icono y te avisará de los cuestionarios.", install: "Instalar", later: "Ahora no",
      apk: "Descargar la app para Android",
      install_menu: "Toca el menú <b class='inline'>⋮</b> del navegador y elige <b class='inline'>Instalar aplicación</b> o <b class='inline'>Añadir a pantalla de inicio</b>.",
      push_title: "Activa los avisos", push_text: "Te recordaremos el cuestionario a las {hour} los días de entrenamiento.",
      push_btn: "Activar avisos", push_blocked: "Avisos bloqueados", push_blocked_text: "Actívalos en los ajustes del móvil para recibir los recordatorios.",
      demo: "Modo demostración: datos de ejemplo. Nada de lo que respondas se guarda.",
      welcome: "Bienvenido a PuntoPeak", welcome_hint: "Para empezar, identifícate con el código personal que te ha dado el cuerpo técnico. Solo hay que hacerlo una vez.",
      scan: "Escanear mi QR", paste: "O pega aquí tu enlace", paste_ph: "https://…", enter: "Entrar",
      scan_hint: "Apunta la cámara a tu código QR.", cancel: "Cancelar", camera_error: "No se ha podido abrir la cámara. Pega tu enlace.",
      bad_code: "Ese enlace no es válido. Revísalo o pide uno nuevo.", other_code: "Usar otro código",
      nav_today: "Hoy", nav_stats: "Estadísticas", nav_matches: "Partidos",
      stats_title: "Mis estadísticas", season: "Temporada", n_matches: "{n} partidos", n_match: "1 partido",
      per_match: "Por partido", total: "Total", best: "Mejor marca", team_avg: "Media del equipo", you: "Tú",
      match_by_match: "Partido a partido", matches_title: "Mis partidos", my_matches: "Mis partidos",
      vs: "vs", at: "en", home_game: "Local", away_game: "Visitante", match: "Partido",
      best_team: "Mejor del equipo", last_match: "Último partido",
      stats_note: "Datos de la cámara Veo. La media del equipo es la de todos los que jugaron ese partido.",
      result: { W: "Victoria", D: "Empate", L: "Derrota" },
      cats: { fisico: "Físico", ataque: "Ataque", pases: "Pases", defensa: "Defensa", otras: "Otras" },
      zones: {
        abdomen: "Abdomen", aductor_izq: "Aductor izq.", aductor_der: "Aductor der.",
        cuadriceps_izq: "Cuádriceps izq.", cuadriceps_der: "Cuádriceps der.", rodilla_izq: "Rodilla izq.", rodilla_der: "Rodilla der.",
        tibia_izq: "Tibia izq.", tibia_der: "Tibia der.", tobillo_izq: "Tobillo izq.", tobillo_der: "Tobillo der.",
        lumbar: "Lumbar", gluteo_izq: "Glúteo izq.", gluteo_der: "Glúteo der.", isquio_izq: "Isquio izq.", isquio_der: "Isquio der.",
        gemelo_izq: "Gemelo izq.", gemelo_der: "Gemelo der.", aquiles_izq: "Aquiles izq.", aquiles_der: "Aquiles der.",
      },
    },
    en: {
      hello: "Hi",
      task_w: "How are you feeling today?", task_w_hint: "Wellness · 20 seconds",
      task_r: "How hard was today's session?", task_r_hint: "Perceived effort · after training",
      pending: "To do", done: "Done",
      my_data: "My data", wellness_14: "Your wellness · last 14 days",
      good: "Good", normal: "Normal", low: "Low",
      km: "km", last7: "Last 7 days", matches: "matches", equals: "Equals", kmh: "km/h", vmax: "Your top speed",
      gps_until: "GPS data up to",
      back: "Back", previous: "Previous",
      q_fatigue: "How fresh do you feel?", a_fatigue: ["Exhausted", "Very fresh"],
      q_sleep: "How did you sleep?", a_sleep: ["Very poorly", "Very well"],
      q_sore: "How do your muscles feel?", a_sore: ["Very sore", "Great"],
      q_stress: "How relaxed are you?", a_stress: ["Very stressed", "Very relaxed"],
      q_mood: "How is your mood?", a_mood: ["Very low", "Very high"],
      pain_q: "Does anything hurt?", pain_hint: "Tap the area. If nothing hurts, just send.",
      front: "Front", rear: "Back", send: "Send", send_nothing: "Nothing hurts · Send",
      rpe_hint: "Think about the whole session, from start to finish.",
      rpe: ["Rest", "Very, very easy", "Easy", "Moderate", "Somewhat hard", "Hard", "", "Very hard", "", "", "Maximal"],
      thanks: "Thank you!", thanks_w: "Today's wellness has been recorded.", thanks_r: "Today's effort has been recorded.",
      home: "Back to home",
      invalid: "Invalid link", invalid_hint: "Ask the staff for your personal PuntoPeak link.",
      offline: "No connection", offline_hint: "Check your connection and try again.", retry: "Try again",
      send_error: "Could not send. Check your connection and try again.",
      install_title_ios: "Install PuntoPeak on your iPhone", install_title: "Install PuntoPeak on your phone",
      install_other_ios: "On iPhone you can only install it from <b class='inline'>Safari</b>. Copy the link, open it in Safari and follow the steps.",
      copy_link: "Copy link", link_copied: "Link copied",
      ios_step1: "Tap {share} <b class='inline'>Share</b> in Safari's toolbar.",
      ios_step2: "Choose {add} <b class='inline'>Add to Home Screen</b>.",
      ios_step3: "Open PuntoPeak from the new icon.",
      install_why: "You'll get its icon and reminders for the questionnaires.", install: "Install", later: "Not now",
      apk: "Download the Android app",
      install_menu: "Tap the browser menu <b class='inline'>⋮</b> and choose <b class='inline'>Install app</b> or <b class='inline'>Add to Home screen</b>.",
      push_title: "Turn on reminders", push_text: "We'll remind you of the questionnaire at {hour} on training days.",
      push_btn: "Turn on reminders", push_blocked: "Reminders blocked", push_blocked_text: "Allow them in your phone settings to get the reminders.",
      demo: "Demo mode: sample data. Nothing you answer is saved.",
      welcome: "Welcome to PuntoPeak", welcome_hint: "To get started, sign in with the personal code the staff gave you. You only need to do this once.",
      scan: "Scan my QR", paste: "Or paste your link here", paste_ph: "https://…", enter: "Sign in",
      scan_hint: "Point the camera at your QR code.", cancel: "Cancel", camera_error: "Could not open the camera. Paste your link instead.",
      bad_code: "That link is not valid. Check it or ask for a new one.", other_code: "Use another code",
      nav_today: "Today", nav_stats: "Stats", nav_matches: "Matches",
      stats_title: "My stats", season: "Season", n_matches: "{n} matches", n_match: "1 match",
      per_match: "Per match", total: "Total", best: "Best", team_avg: "Team average", you: "You",
      match_by_match: "Match by match", matches_title: "My matches", my_matches: "My matches",
      vs: "vs", at: "at", home_game: "Home", away_game: "Away", match: "Match",
      best_team: "Team best", last_match: "Last match",
      stats_note: "Data from the Veo camera. Team average = everyone who played that match.",
      result: { W: "Win", D: "Draw", L: "Loss" },
      cats: { fisico: "Physical", ataque: "Attack", pases: "Passing", defensa: "Defending", otras: "Other" },
      zones: {
        abdomen: "Abdomen", aductor_izq: "L adductor", aductor_der: "R adductor",
        cuadriceps_izq: "L quadriceps", cuadriceps_der: "R quadriceps", rodilla_izq: "L knee", rodilla_der: "R knee",
        tibia_izq: "L shin", tibia_der: "R shin", tobillo_izq: "L ankle", tobillo_der: "R ankle",
        lumbar: "Lower back", gluteo_izq: "L glute", gluteo_der: "R glute", isquio_izq: "L hamstring", isquio_der: "R hamstring",
        gemelo_izq: "L calf", gemelo_der: "R calf", aquiles_izq: "L Achilles", aquiles_der: "R Achilles",
      },
    },
  };
  let lang = store.get("pp_lang") || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  const T = (k) => TEXT[lang][k];
  const LOCALE = () => (lang === "es" ? "es-ES" : "en-GB");

  // ---------- Fechas ----------
  // Fecha local del móvil (YYYY-MM-DD). La ISO en UTC daría, de 0:00 a 2:00 en España, el día anterior.
  function localKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
  const parseDay = (s) => new Date(`${s}T12:00:00`);

  // ---------- API (o datos de ejemplo en modo demostración) ----------
  const demoState = { w: false, r: false };
  function demoResponse(fn) {
    if (fn === "pp_player") return { nombre: "Álex Ejemplo", lang, bienestar_hoy: demoState.w, rpe_hoy: demoState.r };
    if (fn === "pp_summary") {
      const vals = [4.2, 3.8, 3.4, 4.0, 4.4, null, 3.0, 2.6, 3.6, 4.2, 4.6, null, 4.0];
      const bienestar = vals
        .map((v, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); return { fecha: localKey(d), media: v }; })
        .filter((d) => d.media != null);
      if (demoState.w) bienestar.push({ fecha: localKey(new Date()), media: 4.4 });
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      return { bienestar, carga: DEMO_FILIAL ? null : { fecha: localKey(yesterday), km: 24.6, partidos: 2.4, vmax: 31.8 } };
    }
    if (fn === "pp_stats") return demoStats();
    if (fn === "pp_submit_wellness") demoState.w = true;
    if (fn === "pp_submit_rpe") demoState.r = true;
    return { ok: true };
  }

  // Cinco partidos inventados para el modo demostración
  function demoStats() {
    const M = (key, es, en, unidad, categoria, agg) => ({ key, es, en, unidad, categoria, agg });
    const metricas = [
      M("distancia", "Distancia", "Distance", "km", "fisico", "sum"), M("vel_max", "Velocidad máxima", "Top speed", "km/h", "fisico", "max"),
      M("sprints", "Sprints", "Sprints", "", "fisico", "sum"), M("carreras_ai", "Carreras alta intensidad", "High-intensity runs", "", "fisico", "sum"),
      M("goles", "Goles", "Goals", "", "ataque", "sum"), M("participaciones_gol", "Participaciones en gol", "Goal involvements", "", "ataque", "sum"),
      M("ocasiones", "Ocasiones", "Chances", "", "ataque", "sum"), M("tiros", "Tiros", "Shots", "", "ataque", "sum"),
      M("regates", "Regates", "Dribbles", "", "ataque", "sum"), M("pases", "Pases", "Passes", "", "pases", "sum"),
      M("pases_ok", "Pases completados", "Completed passes", "", "pases", "sum"),
      M("precision_pase", "Acierto en el pase", "Pass accuracy", "%", "pases", "rate"),
      M("entradas", "Entradas", "Tackles", "", "defensa", "sum"), M("intercepciones", "Intercepciones", "Interceptions", "", "defensa", "sum"),
      M("recuperaciones", "Recuperaciones", "Recoveries", "", "defensa", "sum"),
    ];
    const rows = [
      ["CD Costa", "local", 3, 1, [10.8, 33.1, 12, 30, 1, 2, 3, 3, 4, 41, 33, 80, 2, 3, 2]],
      ["UD Sierra", "visitante", 1, 1, [9.6, 31.4, 9, 22, 0, 1, 1, 2, 2, 36, 27, 75, 3, 2, 1]],
      ["Atlético Puerto", "local", 2, 0, [10.2, 34.0, 14, 34, 1, 1, 2, 2, 5, 44, 37, 84, 1, 4, 3]],
      ["CF Olivar", "visitante", 0, 2, [8.9, 30.2, 7, 19, 0, 0, 1, 1, 1, 29, 21, 72, 4, 2, 2]],
      ["Real Bahía", "local", 4, 2, [11.1, 32.6, 13, 31, 2, 3, 4, 5, 3, 47, 40, 85, 2, 3, 1]],
    ];
    if (DEMO_FILIAL) rows.splice(1, 2);                 // filial: 3 partidos
    const team = [8.1, 30.4, 8, 20, 0.3, 0.5, 0.9, 1.1, 2.4, 34, 26, 76, 2.1, 2.3, 1.2];
    const best = [11.4, 34.0, 16, 38, 3, 3, 4, 5, 7, 64, 48, 92, 6, 6, 3];
    const keys = metricas.map((m) => m.key);
    const obj = (vals) => Object.fromEntries(keys.map((k, i) => [k, vals[i]]));
    const partidos = rows.map(([rival, condicion, gf, gc, vals], i) => {
      const d = new Date(); d.setDate(d.getDate() - 7 * (rows.length - i) + 2);
      return { id: i + 1, jornada: String(i + 1), fecha: localKey(d), rival, condicion, gf, gc, stats: obj(vals),
               equipo: obj(team.map((v) => +(v * (0.92 + 0.04 * i)).toFixed(2))),
               equipo_max: obj(best.map((v, j) => Math.max(v, vals[j]))) };
    });
    return { partidos, metricas, equipo_temporada: obj(team) };
  }

  async function rpc(fn, args) {
    if (DEMO) return new Promise((ok) => setTimeout(() => ok(demoResponse(fn)), 150));
    const res = await fetch(`${CFG.apiUrl}/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CFG.apiKey ? { apikey: CFG.apiKey, Authorization: `Bearer ${CFG.apiKey}` } : {}),
      },
      body: JSON.stringify({ p_token: token, ...args }),
    });
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  // ---------- Utilidades ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // tab: pestaña activa de la barra inferior ("home", "stats" o "matches"); sin tab, la pantalla va sin barra
  const el = (html, tab) => {
    const nav = tab && hasStats() ? tabBar(tab) : "";
    app.innerHTML = (DEMO ? `<div class="demo-note">${T("demo")}</div>` : "") + html + nav;
    document.body.classList.toggle("with-tabs", !!nav);
    window.scrollTo(0, 0);
    const go = { home: () => home(), stats: statsScreen, matches: matchesScreen };
    app.querySelectorAll(".tabbar button").forEach((b) => (b.onclick = () => go[b.dataset.tab]()));
  };
  const firstName = (n) => String(n || "").split(" ")[0];
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function wellnessColor(v) {
    if (v >= 4) return "var(--green)";
    if (v >= 3) return "var(--orange)";
    return "var(--red)";
  }

  // ---------- Selector de idioma ----------
  let current = () => home();   // pantalla actual, para repintarla al cambiar de idioma

  function renderLangSwitch() {
    const box = document.getElementById("lang");
    if (!box) return;
    box.innerHTML = ["es", "en"].map((l) => `<button data-l="${l}" class="${l === lang ? "on" : ""}">${l.toUpperCase()}</button>`).join("");
    box.querySelectorAll("button").forEach((b) => (b.onclick = () => setLang(b.dataset.l)));
  }

  function setLang(l) {
    if (l === lang) return;
    lang = l;
    store.set("pp_lang", l);
    document.documentElement.lang = l;
    renderLangSwitch();
    if (token && !DEMO) rpc("pp_set_language", { p_lang: l }).catch(() => {});
    current();
  }

  // ---------- Cuestionario ----------
  const QUESTIONS = [
    { key: "p_fatiga", q: "q_fatigue", a: "a_fatigue" },
    { key: "p_sueno", q: "q_sleep", a: "a_sleep" },
    { key: "p_dolor", q: "q_sore", a: "a_sore" },
    { key: "p_estres", q: "q_stress", a: "a_stress" },
    { key: "p_animo", q: "q_mood", a: "a_mood" },
  ];

  function bodySvg(view) {
    // Vista frontal: la izquierda de la pantalla es el lado DERECHO del jugador; la trasera, al revés.
    const L = view === "front" ? "der" : "izq";
    const R = view === "front" ? "izq" : "der";
    const zones = view === "front" ? [
      `<rect class="zone" data-zone="abdomen" x="38" y="96" width="44" height="40" rx="6"/>`,
      `<rect class="zone" data-zone="aductor_${L}" x="50" y="142" width="9" height="22" rx="3"/>`,
      `<rect class="zone" data-zone="aductor_${R}" x="61" y="142" width="9" height="22" rx="3"/>`,
      `<rect class="zone" data-zone="cuadriceps_${L}" x="36" y="142" width="13" height="58" rx="5"/>`,
      `<rect class="zone" data-zone="cuadriceps_${R}" x="71" y="142" width="13" height="58" rx="5"/>`,
      `<rect class="zone" data-zone="rodilla_${L}" x="37" y="203" width="20" height="16" rx="6"/>`,
      `<rect class="zone" data-zone="rodilla_${R}" x="63" y="203" width="20" height="16" rx="6"/>`,
      `<rect class="zone" data-zone="tibia_${L}" x="39" y="222" width="16" height="46" rx="5"/>`,
      `<rect class="zone" data-zone="tibia_${R}" x="65" y="222" width="16" height="46" rx="5"/>`,
      `<rect class="zone" data-zone="tobillo_${L}" x="37" y="271" width="20" height="14" rx="5"/>`,
      `<rect class="zone" data-zone="tobillo_${R}" x="63" y="271" width="20" height="14" rx="5"/>`,
    ] : [
      `<rect class="zone" data-zone="lumbar" x="38" y="106" width="44" height="30" rx="6"/>`,
      `<rect class="zone" data-zone="gluteo_${L}" x="36" y="140" width="23" height="24" rx="8"/>`,
      `<rect class="zone" data-zone="gluteo_${R}" x="61" y="140" width="23" height="24" rx="8"/>`,
      `<rect class="zone" data-zone="isquio_${L}" x="37" y="167" width="20" height="40" rx="5"/>`,
      `<rect class="zone" data-zone="isquio_${R}" x="63" y="167" width="20" height="40" rx="5"/>`,
      `<rect class="zone" data-zone="gemelo_${L}" x="38" y="214" width="18" height="38" rx="7"/>`,
      `<rect class="zone" data-zone="gemelo_${R}" x="64" y="214" width="18" height="38" rx="7"/>`,
      `<rect class="zone" data-zone="aquiles_${L}" x="42" y="255" width="10" height="28" rx="4"/>`,
      `<rect class="zone" data-zone="aquiles_${R}" x="68" y="255" width="10" height="28" rx="4"/>`,
    ];
    return `
      <svg viewBox="0 0 120 292" width="130" height="316" aria-label="${view === "front" ? T("front") : T("rear")}">
        <circle class="deco" cx="60" cy="22" r="16"/>
        <rect class="deco" x="36" y="42" width="48" height="98" rx="10"/>
        <rect class="deco" x="16" y="46" width="16" height="78" rx="8"/>
        <rect class="deco" x="88" y="46" width="16" height="78" rx="8"/>
        ${zones.join("")}
      </svg>`;
  }

  // ---------- Pantallas ----------
  async function home() {
    current = home;
    let info, summary;
    try {
      [info, summary] = await Promise.all([rpc("pp_player", {}), rpc("pp_summary", {}), loadStats()]);
    } catch (e) {
      return e.status ? invalidLink() : offline();
    }
    // Recordatorios en el idioma que usa el jugador
    if (!DEMO && info.lang && info.lang !== lang) rpc("pp_set_language", { p_lang: lang }).catch(() => {});
    if (info.hora_bienestar) reminderHour = info.hora_bienestar;   // cada equipo tiene su horario
    const pendingW = !info.bienestar_hoy, pendingR = !info.rpe_hoy;
    const install = installBanner();
    el(`
      <h1>${T("hello")}, ${esc(firstName(info.nombre))}</h1>
      <p class="sub">${new Date().toLocaleDateString(LOCALE(), { weekday: "long", day: "numeric", month: "long" })}</p>
      <div id="install-slot">${install}</div>
      ${install ? "" : notificationsBanner()}
      <button class="card task ${pendingW ? "pending" : "done"}" id="go-w" ${pendingW ? "" : "disabled"}>
        <div><div class="title">${T("task_w")}</div><div class="hint">${T("task_w_hint")}</div></div>
        <span class="badge ${pendingW ? "pending" : "done"}">${pendingW ? T("pending") : T("done")}</span>
      </button>
      <button class="card task ${pendingR ? "pending" : "done"}" id="go-r" ${pendingR ? "" : "disabled"}>
        <div><div class="title">${T("task_r")}</div><div class="hint">${T("task_r_hint")}</div></div>
        <span class="badge ${pendingR ? "pending" : "done"}">${pendingR ? T("pending") : T("done")}</span>
      </button>
      ${lastMatchCard()}
      ${myData(summary)}
    `, "home");
    const lm = document.getElementById("last-match");
    if (lm) lm.onclick = () => matchDetail(lm.dataset.id);
    document.getElementById("go-w").onclick = () => pendingW && wellness();
    document.getElementById("go-r").onclick = () => pendingR && rpeScreen();
    const nb = document.getElementById("enable-push");
    if (nb) nb.onclick = enablePush;
    bindInstall();
  }

  function myData(summary) {
    // Bienestar de los últimos 14 días: una barra por día (vacía si no respondió)
    const byDate = Object.fromEntries((summary.bienestar || []).map((d) => [d.fecha, d.media]));
    const days = [...Array(14)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 13 + i);
      return { label: d.toLocaleDateString(LOCALE(), { weekday: "narrow" }), v: byDate[localKey(d)] };
    });
    const bars = days.map((d) => d.v == null
      ? `<div class="bar empty" style="height:8%"></div>`
      : `<div class="bar" style="height:${(d.v / 5) * 100}%;background:${wellnessColor(d.v)}" title="${d.v}"></div>`).join("");
    const labels = days.map((d) => `<span>${d.label}</span>`).join("");
    const c = summary.carga;
    const tiles = c ? `
      <div class="tiles">
        <div class="tile"><div class="v">${c.km ?? "–"}</div><div class="u">${T("km")}</div><div class="l">${T("last7")}</div></div>
        <div class="tile"><div class="v">${c.partidos ?? "–"}</div><div class="u">${T("matches")}</div><div class="l">${T("equals")}</div></div>
        <div class="tile"><div class="v">${c.vmax ?? "–"}</div><div class="u">${T("kmh")}</div><div class="l">${T("vmax")}</div></div>
      </div>
      <p class="note">${T("gps_until")} ${parseDay(c.fecha).toLocaleDateString(LOCALE(), { day: "numeric", month: "long" })}.</p>` : "";
    return `
      <h2>${T("my_data")}</h2>
      <div class="card">
        <div style="font-weight:700">${T("wellness_14")}</div>
        <div class="bars">${bars}</div>
        <div class="bar-labels">${labels}</div>
        <div class="legend"><span><i style="background:var(--green)"></i>${T("good")}</span><span><i style="background:var(--orange)"></i>${T("normal")}</span><span><i style="background:var(--red)"></i>${T("low")}</span></div>
      </div>
      ${tiles}`;
  }

  function wellness() {
    const answers = {};
    const zones = new Set();
    let step = 0;

    function renderQuestion() {
      current = renderQuestion;
      const q = QUESTIONS[step];
      const [lo, hi] = T(q.a);
      el(`
        <button class="back" id="back">‹ ${step === 0 ? T("back") : T("previous")}</button>
        <div class="progress">${QUESTIONS.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}<span></span></div>
        <div class="question">${T(q.q)}</div>
        <div class="scale">${[1, 2, 3, 4, 5].map((v) => `<button class="opt ${answers[q.key] === v ? "sel" : ""}" data-v="${v}">${v}</button>`).join("")}</div>
        <div class="anchors"><span>1 · ${lo}</span><span>${hi} · 5</span></div>
      `);
      document.getElementById("back").onclick = () => (step === 0 ? home() : (step--, renderQuestion()));
      app.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        answers[q.key] = Number(b.dataset.v);
        b.classList.add("sel");
        setTimeout(() => (step < QUESTIONS.length - 1 ? (step++, renderQuestion()) : renderBody()), 180);
      }));
    }

    function renderBody() {
      current = renderBody;
      el(`
        <button class="back" id="back">‹ ${T("previous")}</button>
        <div class="progress">${QUESTIONS.map(() => `<span class="on"></span>`).join("")}<span class="on"></span></div>
        <div class="question">${T("pain_q")}</div>
        <p class="sub">${T("pain_hint")}</p>
        <div class="body-views">
          <figure>${bodySvg("front")}<figcaption>${T("front")}</figcaption></figure>
          <figure>${bodySvg("back")}<figcaption>${T("rear")}</figcaption></figure>
        </div>
        <div class="chips" id="chips"></div>
        <button class="btn accent" id="send"></button>
      `);
      const paint = () => {
        app.querySelectorAll(".zone").forEach((z) => z.classList.toggle("sel", zones.has(z.dataset.zone)));
        document.getElementById("chips").innerHTML = [...zones].map((z) => `<span class="chip">${T("zones")[z]}</span>`).join("");
        document.getElementById("send").textContent = zones.size ? T("send") : T("send_nothing");
      };
      app.querySelectorAll(".zone").forEach((z) => (z.onclick = () => {
        zones.has(z.dataset.zone) ? zones.delete(z.dataset.zone) : zones.add(z.dataset.zone);
        paint();
      }));
      paint();
      document.getElementById("back").onclick = () => { step = QUESTIONS.length - 1; renderQuestion(); };
      document.getElementById("send").onclick = async (ev) => {
        ev.target.disabled = true;
        try {
          await rpc("pp_submit_wellness", { ...answers, p_zonas: [...zones].join(",") });
          thanks("thanks_w");
        } catch (e) {
          ev.target.disabled = false;
          alertError();
        }
      };
    }
    renderQuestion();
  }

  function rpeScreen() {
    current = rpeScreen;
    let value = null;
    el(`
      <button class="back" id="back">‹ ${T("back")}</button>
      <div class="question">${T("task_r")}</div>
      <p class="sub">${T("rpe_hint")}</p>
      <div class="scale rpe">${T("rpe").map((t, v) => [v, t]).reverse().map(([v, t]) => `<button class="opt" data-v="${v}"><span>${v}</span><small>${t}</small></button>`).join("")}</div>
      <button class="btn accent" id="send" disabled>${T("send")}</button>
    `);
    document.getElementById("back").onclick = home;
    app.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
      app.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
      b.classList.add("sel");
      value = Number(b.dataset.v);
      document.getElementById("send").disabled = false;
    }));
    document.getElementById("send").onclick = async (ev) => {
      ev.target.disabled = true;
      try {
        await rpc("pp_submit_rpe", { p_rpe: value });
        thanks("thanks_r");
      } catch (e) {
        ev.target.disabled = false;
        alertError();
      }
    };
  }

  function thanks(textKey) {
    current = () => thanks(textKey);
    el(`<div class="done-msg"><div class="big">${T("thanks")}</div><p class="sub">${T(textKey)}</p></div>
        <button class="btn" id="home">${T("home")}</button>`);
    document.getElementById("home").onclick = home;
  }

  function invalidLink() {
    current = invalidLink;
    el(`<div class="done-msg"><div class="big">${T("invalid")}</div><p class="sub">${T("invalid_hint")}</p></div>
        <button class="btn secondary" id="other">${T("other_code")}</button>`);
    document.getElementById("other").onclick = () => { token = null; store.set("pp_token", ""); welcome(); };
  }

  // ---------- Bienvenida: identificarse una vez (QR o enlace) ----------
  function extractToken(text) {
    const s = String(text || "").trim();
    try { const t = new URL(s).searchParams.get("t"); if (t) return t; } catch (e) { /* no es una URL */ }
    return /^[A-Za-z0-9_-]{20,}$/.test(s) ? s : null;
  }

  async function useToken(t) {
    token = t;
    store.set("pp_token", t);
    try { await rpc("pp_player", {}); history.replaceState(null, "", location.pathname); home(); }
    catch (e) { token = null; store.set("pp_token", ""); welcome(T(e.status ? "bad_code" : "offline_hint")); }
  }

  function welcome(error) {
    current = () => welcome(error);
    const canScan = "BarcodeDetector" in window && navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
    el(`
      <h1>${T("welcome")}</h1>
      <p class="sub">${T("welcome_hint")}</p>
      ${error ? `<p class="error">${esc(error)}</p>` : ""}
      ${canScan ? `<button class="btn accent" id="scan">${T("scan")}</button>` : ""}
      <h2 style="text-transform:none;letter-spacing:0;font-size:1.1rem">${T("paste")}</h2>
      <input id="link" class="input" type="url" inputmode="url" autocomplete="off" placeholder="${T("paste_ph")}">
      <button class="btn" id="enter">${T("enter")}</button>
    `);
    document.getElementById("enter").onclick = () => {
      const t = extractToken(document.getElementById("link").value);
      t ? useToken(t) : welcome(T("bad_code"));
    };
    const scanBtn = document.getElementById("scan");
    if (scanBtn) scanBtn.onclick = scanQr;
  }

  async function scanQr() {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    } catch (e) { return welcome(T("camera_error")); }
    el(`<p class="sub">${T("scan_hint")}</p><video id="cam" class="cam" playsinline muted></video>
        <button class="btn secondary" id="cancel">${T("cancel")}</button>`);
    const video = document.getElementById("cam");
    video.srcObject = stream;
    await video.play().catch(() => {});
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    let active = true;
    const stop = () => { active = false; stream.getTracks().forEach((tr) => tr.stop()); };
    document.getElementById("cancel").onclick = () => { stop(); welcome(); };
    const loop = async () => {
      if (!active) return;
      try {
        const codes = await detector.detect(video);
        const t = codes.map((c) => extractToken(c.rawValue)).find(Boolean);
        if (t) { stop(); return useToken(t); }
      } catch (e) { /* fotograma no disponible todavía */ }
      setTimeout(loop, 300);
    };
    loop();
  }

  function offline() {
    current = offline;
    el(`<div class="done-msg"><div class="big">${T("offline")}</div><p class="sub">${T("offline_hint")}</p></div>
        <button class="btn" id="retry">${T("retry")}</button>`);
    document.getElementById("retry").onclick = home;
  }

  function alertError() {
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = T("send_error");
    app.appendChild(p);
  }

  // ---------- Instalación ----------
  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const iosOtherBrowser = isIOS && /CriOS|FxiOS|EdgiOS|FBAN|FBAV|Instagram|WhatsApp|Line\//i.test(ua);
  let installPrompt = null;      // evento del navegador para instalar con un toque (Android/Chrome)
  let installDismissed = false;

  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; refreshInstall(); });
  window.addEventListener("appinstalled", () => { installPrompt = null; installDismissed = true; refreshInstall(); });

  const ICON_SHARE = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg>`;
  const ICON_ADD = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#102048" stroke-width="2" stroke-linecap="round" style="vertical-align:-3px"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>`;

  function installBanner() {
    if (standalone || installDismissed || !(isIOS || isAndroid)) return "";
    if (iosOtherBrowser) {
      return `<div class="banner install"><b>${T("install_title_ios")}</b>${T("install_other_ios")}
        <button class="btn" id="copy-link">${T("copy_link")}</button></div>`;
    }
    if (isIOS) {
      return `<div class="banner install"><b>${T("install_title_ios")}</b>
        <ol class="steps">
          <li>${T("ios_step1").replace("{share}", ICON_SHARE)}</li>
          <li>${T("ios_step2").replace("{add}", ICON_ADD)}</li>
          <li>${T("ios_step3")}</li>
        </ol></div>`;
    }
    const apk = CFG.apkUrl ? `<a class="btn secondary" href="${esc(CFG.apkUrl)}">${T("apk")}</a>` : "";
    if (installPrompt) {
      return `<div class="banner install"><b>${T("install_title")}</b>${T("install_why")}
        <button class="btn accent" id="install-btn">${T("install")}</button>${apk}
        <button class="btn secondary" id="install-later">${T("later")}</button></div>`;
    }
    return `<div class="banner install"><b>${T("install_title")}</b>${T("install_menu")}${apk}</div>`;
  }

  function bindInstall() {
    const btn = document.getElementById("install-btn");
    if (btn) btn.onclick = async () => {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      installPrompt = null;
      if (outcome === "accepted") installDismissed = true;
      refreshInstall();
    };
    const later = document.getElementById("install-later");
    if (later) later.onclick = () => { installDismissed = true; refreshInstall(); };
    const copy = document.getElementById("copy-link");
    if (copy) copy.onclick = async () => {
      try { await navigator.clipboard.writeText(location.href); copy.textContent = T("link_copied"); }
      catch (e) { copy.outerHTML = `<p class="note" style="word-break:break-all">${esc(location.href)}</p>`; }
    };
  }

  function refreshInstall() {
    const slot = document.getElementById("install-slot");
    if (!slot) return;
    slot.innerHTML = installBanner();
    bindInstall();
  }


  // ---------- Estadísticas de partido (Veo) ----------
  let statsData = null;
  async function loadStats() {
    try { statsData = await rpc("pp_stats", {}); } catch (e) { /* sin estadísticas (p. ej. primer equipo) */ }
    return statsData;
  }
  const hasStats = () => !!(statsData && statsData.partidos && statsData.partidos.length);
  const RATES = { conversion: ["goles", "ocasiones"], precision_pase: ["pases_ok", "pases"] };
  const CAT_ORDER = ["fisico", "ataque", "pases", "defensa", "otras"];
  const HIGHLIGHTS = ["goles", "participaciones_gol", "distancia", "precision_pase", "vel_max", "pases"];
  const metricMap = () => Object.fromEntries((statsData.metricas || []).map((m) => [m.key, m]));
  const mLabel = (m) => (m && (m[lang] || m.es)) || "";
  const fmt = (v, digits) => (v == null || isNaN(v) ? "–" : (+v).toLocaleString(LOCALE(), { maximumFractionDigits: digits ?? 1 }));
  const outcome = (p) => (p.gf == null || p.gc == null ? null : p.gf > p.gc ? "W" : p.gf === p.gc ? "D" : "L");
  const unitHtml = (m) => (m.unidad === "%" ? "%" : m.unidad ? ` <small>${esc(m.unidad)}</small>` : "");
  const digitsOf = () => 1;

  function tabBar(active) {
    const icon = {
      home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
      stats: '<path d="M5 20V11M12 20V4M19 20v-7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
      matches: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.6l3.7 2.7-1.4 4.3H9.7L8.3 10.3z"/>',
    };
    const btn = (tab, label) => `<button data-tab="${tab}" class="${tab === active ? "on" : ""}">
        <svg viewBox="0 0 24 24" aria-hidden="true">${icon[tab]}</svg><span>${T(label)}</span></button>`;
    return `<nav class="tabbar">${btn("home", "nav_today")}${btn("stats", "nav_stats")}${btn("matches", "nav_matches")}</nav>`;
  }

  // Temporada: media por partido (sumas), mejor marca (máximo) o porcentaje recalculado con los totales
  function seasonValue(key, agg, partidos) {
    const vals = partidos.map((p) => p.stats && p.stats[key]).filter((v) => v != null);
    if (!vals.length) return null;
    if (agg === "max") return { value: Math.max(...vals) };
    if (agg === "rate") {
      const [num, den] = RATES[key] || [];
      const n = partidos.reduce((a, p) => a + ((p.stats && p.stats[num]) || 0), 0);
      const d = partidos.reduce((a, p) => a + ((p.stats && p.stats[den]) || 0), 0);
      return { value: num && d > 0 ? (100 * n) / d : vals.reduce((a, b) => a + b, 0) / vals.length };
    }
    const total = vals.reduce((a, b) => a + b, 0);
    return { value: total / vals.length, total };
  }
  function teamSeason(key, agg) {
    const t = statsData.equipo_temporada || {};
    if (agg === "rate" && RATES[key] && t[RATES[key][1]] > 0) return (100 * t[RATES[key][0]]) / t[RATES[key][1]];
    return t[key];
  }

  // Fila: estadística, valor del jugador y barra frente a la media del equipo (marca naranja)
  function compareRow(m, value, team, extra, best) {
    const scale = Math.max(value || 0, team || 0) * 1.15 || 1;
    return `<div class="stat-row">
      <div class="stat-head"><span class="stat-name">${esc(mLabel(m))}${best ? ` <em class="best">★ ${T("best_team")}</em>` : ""}</span>
        <span class="stat-val">${fmt(value, digitsOf(m))}${unitHtml(m)}</span></div>
      <div class="cmp"><div class="cmp-fill" style="width:${Math.min(100, ((value || 0) / scale) * 100)}%"></div>
        ${team != null ? `<div class="cmp-team" style="left:${Math.min(100, (team / scale) * 100)}%"></div>` : ""}</div>
      <div class="stat-foot"><span>${team != null ? `${T("team_avg")}: ${fmt(team, digitsOf(m))}` : ""}</span><span>${extra || ""}</span></div>
    </div>`;
  }

  function categoryCards(rowFor) {
    const meta = metricMap();
    return CAT_ORDER.map((cat) => {
      const rows = (statsData.metricas || []).filter((m) => (CAT_ORDER.includes(m.categoria) ? m.categoria : "otras") === cat)
        .map((m) => rowFor(meta[m.key])).filter(Boolean);
      return rows.length ? `<h2>${T("cats")[cat]}</h2><div class="card stats-card">${rows.join("")}</div>` : "";
    }).join("");
  }

  function matchTitle(p) {
    const where = p.condicion === "visitante" ? T("at") : T("vs");
    return p.rival ? `${where} ${esc(p.rival)}` : `${T("match")} ${esc(p.jornada || "")}`;
  }
  const matchDate = (p) => (p.fecha ? parseDay(p.fecha).toLocaleDateString(LOCALE(), { day: "numeric", month: "short" }) : "");
  const venue = (p) => (p.condicion === "visitante" ? T("away_game") : T("home_game"));

  function resultChip(p) {
    const o = outcome(p);
    return o ? `<span class="result ${o}" title="${T("result")[o]}">${p.gf}-${p.gc}</span>` : "";
  }

  function miniStats(p) {
    const meta = metricMap();
    const picks = HIGHLIGHTS.filter((k) => meta[k] && p.stats && p.stats[k] != null && !(k === "goles" && !p.stats[k])).slice(0, 3);
    return `<div class="mini">${picks.map((k) => `<span><b>${fmt(p.stats[k], digitsOf(meta[k]))}${meta[k].unidad === "%" ? "%" : ""}</b>${esc(mLabel(meta[k]))}</span>`).join("")}</div>`;
  }

  function matchCard(p, id) {
    return `<button class="card match-card" ${id ? `id="${id}"` : ""} data-id="${p.id}">
      <div class="match-top"><span class="jornada">J${esc(p.jornada || "")}</span>
        <span class="match-name">${matchTitle(p)}<small>${matchDate(p)} · ${venue(p)}</small></span>${resultChip(p)}</div>
      ${miniStats(p)}
    </button>`;
  }

  function lastMatchCard() {
    if (!hasStats()) return "";
    const p = statsData.partidos[statsData.partidos.length - 1];
    return `<h2>${T("last_match")}</h2>${matchCard(p, "last-match")}`;
  }

  let chartKey = null;
  function statsScreen() {
    current = statsScreen;
    if (!hasStats()) return home();
    const partidos = statsData.partidos, meta = metricMap(), n = partidos.length;
    const tiles = HIGHLIGHTS.filter((k) => meta[k]).slice(0, 4).map((k) => {
      const m = meta[k], s = seasonValue(k, m.agg, partidos);
      const showTotal = m.agg === "sum" && m.unidad !== "km";
      const v = s ? (showTotal ? s.total : s.value) : null;
      const sub = showTotal ? T("total") : m.agg === "max" ? T("best") : m.agg === "rate" ? T("season") : T("per_match");
      return `<div class="tile"><div class="v">${fmt(v, m.unidad === "km" ? 1 : 0)}${m.unidad === "%" ? "%" : ""}</div>
        <div class="u">${esc(m.unidad && m.unidad !== "%" ? m.unidad : "")}</div><div class="l">${esc(mLabel(m))}<br>${sub}</div></div>`;
    });
    const chartable = (statsData.metricas || []).filter((m) => m.agg !== "rate" && partidos.some((p) => p.stats && p.stats[m.key] != null));
    if (!chartKey || !meta[chartKey]) chartKey = (chartable.find((m) => m.key === "distancia") || chartable[0] || {}).key;
    el(`
      <h1>${T("stats_title")}</h1>
      <p class="sub">${T("season")} · ${n === 1 ? T("n_match") : T("n_matches").replace("{n}", n)}</p>
      <div class="tiles four">${tiles.join("")}</div>
      <h2>${T("match_by_match")}</h2>
      <div class="card">
        <div class="metric-chips">${chartable.slice(0, 8).map((m) => `<button data-k="${m.key}" class="${m.key === chartKey ? "on" : ""}">${esc(mLabel(m))}</button>`).join("")}</div>
        <div id="match-chart">${matchChart(chartKey)}</div>
      </div>
      ${categoryCards((m) => {
        const s = seasonValue(m.key, m.agg, partidos);
        if (!s) return "";
        const extra = m.agg === "sum" ? `${T("per_match")} · ${T("total")}: ${fmt(s.total, m.unidad === "km" ? 1 : 0)}` : m.agg === "max" ? T("best") : "";
        return compareRow(m, s.value, teamSeason(m.key, m.agg), extra);
      })}
      <p class="note">${T("stats_note")}</p>
    `, "stats");
    bindChart();
  }

  // Barras por partido (valor del jugador) con una marca naranja en la media del equipo de ese partido
  function matchChart(key) {
    const m = metricMap()[key];
    if (!m) return "";
    const ps = statsData.partidos;
    const vals = ps.map((p) => (p.stats && p.stats[key] != null ? p.stats[key] : null));
    const teams = ps.map((p) => (p.equipo && p.equipo[key] != null ? p.equipo[key] : null));
    const max = Math.max(0, ...vals.filter((v) => v != null), ...teams.filter((v) => v != null)) * 1.12 || 1;
    const present = vals.filter((v) => v != null);
    const bestIdx = present.length ? vals.indexOf(Math.max(...present)) : -1;
    const digits = m.unidad === "km" ? 1 : 0;
    const cols = ps.map((p, i) => `
      <button class="mc-col" data-id="${p.id}" aria-label="J${esc(p.jornada || "")}: ${fmt(vals[i], 2)}">
        <span class="mc-val">${i === bestIdx || i === ps.length - 1 ? fmt(vals[i], digits) : ""}</span>
        <span class="mc-track">
          <span class="mc-bar" style="height:${vals[i] == null ? 0 : Math.max(2, (vals[i] / max) * 100)}%"></span>
          ${teams[i] != null ? `<i class="mc-team" style="bottom:${(teams[i] / max) * 100}%"></i>` : ""}
        </span>
        <span class="mc-lbl">J${esc(p.jornada || i + 1)}</span>
      </button>`).join("");
    return `<div class="mc">${cols}</div>
      <div class="legend"><span><i style="background:var(--navy)"></i>${T("you")}</span><span><i class="dash"></i>${T("team_avg")}</span>
      ${m.unidad ? `<span>${esc(m.unidad)}</span>` : ""}</div>`;
  }

  function bindChart() {
    app.querySelectorAll(".metric-chips button").forEach((b) => (b.onclick = () => {
      chartKey = b.dataset.k;
      app.querySelectorAll(".metric-chips button").forEach((x) => x.classList.toggle("on", x === b));
      document.getElementById("match-chart").innerHTML = matchChart(chartKey);
      bindChart();
    }));
    app.querySelectorAll(".mc-col").forEach((b) => (b.onclick = () => matchDetail(b.dataset.id)));
  }

  function matchesScreen() {
    current = matchesScreen;
    if (!hasStats()) return home();
    const cards = [...statsData.partidos].reverse().map((p) => matchCard(p));
    el(`<h1>${T("matches_title")}</h1><p class="sub">${T("season")}</p>${cards.join("")}`, "matches");
    app.querySelectorAll(".match-card").forEach((b) => (b.onclick = () => matchDetail(b.dataset.id)));
  }

  function matchDetail(id) {
    const p = ((statsData && statsData.partidos) || []).find((x) => String(x.id) === String(id));
    if (!p) return matchesScreen();
    current = () => matchDetail(id);
    const meta = metricMap(), o = outcome(p);
    const tiles = HIGHLIGHTS.filter((k) => meta[k] && p.stats && p.stats[k] != null).slice(0, 3).map((k) =>
      `<div class="tile"><div class="v">${fmt(p.stats[k], meta[k].unidad === "km" ? 1 : 0)}${meta[k].unidad === "%" ? "%" : ""}</div>
        <div class="u">${esc(meta[k].unidad && meta[k].unidad !== "%" ? meta[k].unidad : "")}</div><div class="l">${esc(mLabel(meta[k]))}</div></div>`);
    el(`
      <button class="back" id="back">‹ ${T("my_matches")}</button>
      <div class="match-hero">
        <div class="mh-top">J${esc(p.jornada || "")} · ${matchDate(p)} · ${venue(p)}</div>
        <div class="mh-rival">${matchTitle(p)}</div>
        ${o ? `<div class="mh-score">${p.gf}<span>–</span>${p.gc}</div><div class="mh-res ${o}">${T("result")[o]}</div>` : ""}
      </div>
      <div class="tiles">${tiles.join("")}</div>
      ${categoryCards((m) => {
        const v = p.stats && p.stats[m.key];
        if (v == null) return "";
        const best = p.equipo_max && v > 0 && v >= p.equipo_max[m.key];
        return compareRow(m, v, p.equipo ? p.equipo[m.key] : null, "", best);
      })}
      <p class="note">${T("stats_note")}</p>
    `, "matches");
    document.getElementById("back").onclick = matchesScreen;
  }

  // ---------- Notificaciones ----------
  let reminderHour = CFG.horaBienestar || "8:45";
  function notificationsBanner() {
    if (DEMO || !("serviceWorker" in navigator) || !CFG.vapidPublicKey) return "";
    if (isIOS && !standalone) return "";   // en iPhone los avisos solo funcionan con la app instalada
    if (!("Notification" in window) || Notification.permission === "granted") return "";
    if (Notification.permission === "denied") {
      return `<div class="banner"><b>${T("push_blocked")}</b>${T("push_blocked_text")}</div>`;
    }
    return `<div class="banner"><b>${T("push_title")}</b>${T("push_text").replace("{hour}", esc(reminderHour))}
      <button class="btn" id="enable-push">${T("push_btn")}</button></div>`;
  }

  function b64ToBytes(b64) {
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
  }

  async function enablePush() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return home();
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(CFG.vapidPublicKey) });
      const json = sub.toJSON();
      await rpc("pp_subscribe", { p_endpoint: json.endpoint, p_p256dh: json.keys.p256dh, p_auth: json.keys.auth });
    } catch (e) { /* el banner volverá a aparecer y se podrá reintentar */ }
    home();
  }

  // ---------- Arranque ----------
  document.documentElement.lang = lang;
  renderLangSwitch();
  if ("serviceWorker" in navigator && !DEMO) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (!token && !DEMO) return welcome();
  const route = location.hash.replace("#", "");
  if (route === "bienestar") wellness();
  else if (route === "rpe") rpeScreen();
  else if (route === "estadisticas") loadStats().then(() => (hasStats() ? statsScreen() : home()));
  else if (route === "partidos") loadStats().then(() => (hasStats() ? matchesScreen() : home()));
  else if (route.startsWith("partido-")) loadStats().then(() => (hasStats() ? matchDetail(route.slice(8)) : home()));
  else home();
})();
