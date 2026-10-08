/*
 * App del jugador de PuntoPeak.
 * - Bienestar: 5 ítems de McLean et al. (2010), de 1 (muy mal) a 5 (muy bien).
 * - RPE de sesión: escala CR-10 (0-10), ~30 min después de la sesión (Foster et al., 2001).
 * Habla con Supabase solo mediante funciones (RPC) que validan el código personal del jugador.
 */
(function () {
  "use strict";
  const CFG = window.PP_CONFIG || {};
  const app = document.getElementById("app");

  // ---------- Código personal: llega en el enlace (?t=...) y se recuerda en el móvil ----------
  const params = new URLSearchParams(location.search);
  let token = params.get("t");
  try {
    if (token) localStorage.setItem("pp_token", token);
    else token = localStorage.getItem("pp_token");
  } catch (e) { /* almacenamiento no disponible: se usa el del enlace */ }

  // ---------- API ----------
  async function rpc(fn, args) {
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
  const el = (html) => { app.innerHTML = html; window.scrollTo(0, 0); };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const firstName = (n) => String(n || "").split(" ")[0];
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function wellnessColor(v) {
    if (v == null) return null;
    if (v >= 4) return "var(--green)";
    if (v >= 3) return "var(--orange)";
    return "var(--red)";
  }

  // ---------- Cuestionario de bienestar ----------
  const QUESTIONS = [
    { key: "p_fatiga", q: "¿Cómo de fresco estás?", lo: "Agotado", hi: "Muy fresco" },
    { key: "p_sueno", q: "¿Cómo has dormido?", lo: "Fatal", hi: "Muy bien" },
    { key: "p_dolor", q: "¿Cómo están tus músculos?", lo: "Muy cargados", hi: "Perfectos" },
    { key: "p_estres", q: "¿Cómo de tranquilo estás?", lo: "Muy estresado", hi: "Muy relajado" },
    { key: "p_animo", q: "¿Cómo está tu ánimo?", lo: "Muy bajo", hi: "Muy alto" },
  ];

  // Escala CR-10 de Borg modificada por Foster et al. (2001)
  const RPE = [
    [0, "Reposo"], [1, "Muy, muy fácil"], [2, "Fácil"], [3, "Moderado"], [4, "Algo duro"],
    [5, "Duro"], [6, ""], [7, "Muy duro"], [8, ""], [9, ""], [10, "Máximo"],
  ];

  // Zonas del mapa corporal (izquierda/derecha desde el punto de vista del jugador)
  const ZONE_LABELS = {
    abdomen: "Abdomen", aductor_izq: "Aductor izq.", aductor_der: "Aductor der.",
    cuadriceps_izq: "Cuádriceps izq.", cuadriceps_der: "Cuádriceps der.",
    rodilla_izq: "Rodilla izq.", rodilla_der: "Rodilla der.",
    tibia_izq: "Tibia izq.", tibia_der: "Tibia der.", tobillo_izq: "Tobillo izq.", tobillo_der: "Tobillo der.",
    lumbar: "Lumbar", gluteo_izq: "Glúteo izq.", gluteo_der: "Glúteo der.",
    isquio_izq: "Isquio izq.", isquio_der: "Isquio der.", gemelo_izq: "Gemelo izq.", gemelo_der: "Gemelo der.",
    aquiles_izq: "Aquiles izq.", aquiles_der: "Aquiles der.",
  };

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
      <svg viewBox="0 0 120 292" width="130" height="316" aria-label="${view === "front" ? "Delante" : "Detrás"}">
        <circle class="deco" cx="60" cy="22" r="16"/>
        <rect class="deco" x="36" y="42" width="48" height="98" rx="10"/>
        <rect class="deco" x="16" y="46" width="16" height="78" rx="8"/>
        <rect class="deco" x="88" y="46" width="16" height="78" rx="8"/>
        ${zones.join("")}
      </svg>`;
  }

  // ---------- Pantallas ----------
  async function home() {
    let info, summary;
    try {
      [info, summary] = await Promise.all([rpc("pp_player", {}), rpc("pp_summary", {})]);
    } catch (e) {
      return e.status ? invalidLink() : offline();
    }
    const pendingW = !info.bienestar_hoy, pendingR = !info.rpe_hoy;
    el(`
      <h1>Hola, ${esc(firstName(info.nombre))}</h1>
      <p class="sub">${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
      ${notificationsBanner()}
      <button class="card task ${pendingW ? "pending" : "done"}" id="go-w" ${pendingW ? "" : "disabled"}>
        <div><div class="title">¿Cómo llegas hoy?</div><div class="hint">Bienestar · 20 segundos</div></div>
        <span class="badge ${pendingW ? "pending" : "done"}">${pendingW ? "Pendiente" : "Hecho"}</span>
      </button>
      <button class="card task ${pendingR ? "pending" : "done"}" id="go-r" ${pendingR ? "" : "disabled"}>
        <div><div class="title">¿Cómo de dura ha sido la sesión?</div><div class="hint">Esfuerzo percibido · después de entrenar</div></div>
        <span class="badge ${pendingR ? "pending" : "done"}">${pendingR ? "Pendiente" : "Hecho"}</span>
      </button>
      ${myData(summary)}
    `);
    document.getElementById("go-w").onclick = () => pendingW && wellness();
    document.getElementById("go-r").onclick = () => pendingR && rpeScreen();
    const nb = document.getElementById("enable-push");
    if (nb) nb.onclick = enablePush;
  }

  function myData(summary) {
    // Bienestar de los últimos 14 días: una barra por día (vacía si no respondió)
    const byDate = Object.fromEntries((summary.bienestar || []).map((d) => [d.fecha, d.media]));
    const days = [...Array(14)].map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - 13 + i);
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.toLocaleDateString("es-ES", { weekday: "narrow" }), v: byDate[key] };
    });
    const bars = days.map((d) => d.v == null
      ? `<div class="bar empty" style="height:8%"></div>`
      : `<div class="bar" style="height:${(d.v / 5) * 100}%;background:${wellnessColor(d.v)}" title="${d.v}"></div>`).join("");
    const labels = days.map((d) => `<span>${d.label}</span>`).join("");
    const c = summary.carga;
    const tiles = c ? `
      <div class="tiles">
        <div class="tile"><div class="v">${c.km ?? "–"}</div><div class="u">km</div><div class="l">Últimos 7 días</div></div>
        <div class="tile"><div class="v">${c.partidos ?? "–"}</div><div class="u">partidos</div><div class="l">Equivale a</div></div>
        <div class="tile"><div class="v">${c.vmax ?? "–"}</div><div class="u">km/h</div><div class="l">Tu velocidad máx.</div></div>
      </div>
      <p class="note">Datos del GPS hasta el ${new Date(c.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}.</p>` : "";
    return `
      <h2>Mis datos</h2>
      <div class="card">
        <div style="font-weight:700">Tu bienestar · últimos 14 días</div>
        <div class="bars">${bars}</div>
        <div class="bar-labels">${labels}</div>
        <div class="legend"><span><i style="background:var(--green)"></i>Bien</span><span><i style="background:var(--orange)"></i>Normal</span><span><i style="background:var(--red)"></i>Bajo</span></div>
      </div>
      ${tiles}`;
  }

  function wellness() {
    const answers = {};
    const zones = new Set();
    let step = 0;

    function renderQuestion() {
      const q = QUESTIONS[step];
      el(`
        <button class="back" id="back">‹ ${step === 0 ? "Volver" : "Anterior"}</button>
        <div class="progress">${QUESTIONS.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}<span></span></div>
        <div class="question">${q.q}</div>
        <div class="scale">${[1, 2, 3, 4, 5].map((v) => `<button class="opt ${answers[q.key] === v ? "sel" : ""}" data-v="${v}">${v}</button>`).join("")}</div>
        <div class="anchors"><span>1 · ${q.lo}</span><span>${q.hi} · 5</span></div>
      `);
      document.getElementById("back").onclick = () => (step === 0 ? home() : (step--, renderQuestion()));
      app.querySelectorAll(".opt").forEach((b) => (b.onclick = () => {
        answers[q.key] = Number(b.dataset.v);
        b.classList.add("sel");
        setTimeout(() => (step < QUESTIONS.length - 1 ? (step++, renderQuestion()) : renderBody()), 180);
      }));
    }

    function renderBody() {
      el(`
        <button class="back" id="back">‹ Anterior</button>
        <div class="progress">${QUESTIONS.map(() => `<span class="on"></span>`).join("")}<span class="on"></span></div>
        <div class="question">¿Te duele algo?</div>
        <p class="sub">Toca la zona. Si no te duele nada, envía directamente.</p>
        <div class="body-views">
          <figure>${bodySvg("front")}<figcaption>Delante</figcaption></figure>
          <figure>${bodySvg("back")}<figcaption>Detrás</figcaption></figure>
        </div>
        <div class="chips" id="chips"></div>
        <button class="btn accent" id="send">${zones.size ? "Enviar" : "No me duele nada · Enviar"}</button>
      `);
      const paint = () => {
        app.querySelectorAll(".zone").forEach((z) => z.classList.toggle("sel", zones.has(z.dataset.zone)));
        document.getElementById("chips").innerHTML = [...zones].map((z) => `<span class="chip">${ZONE_LABELS[z]}</span>`).join("");
        document.getElementById("send").textContent = zones.size ? "Enviar" : "No me duele nada · Enviar";
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
          thanks("¡Gracias!", "Tu bienestar de hoy está registrado.");
        } catch (e) {
          ev.target.disabled = false;
          alertError();
        }
      };
    }
    renderQuestion();
  }

  function rpeScreen() {
    let value = null;
    el(`
      <button class="back" id="back">‹ Volver</button>
      <div class="question">¿Cómo de dura ha sido la sesión?</div>
      <p class="sub">Piensa en la sesión completa, de principio a fin.</p>
      <div class="scale rpe">${RPE.slice().reverse().map(([v, t]) => `<button class="opt" data-v="${v}"><span>${v}</span><small>${t}</small></button>`).join("")}</div>
      <button class="btn accent" id="send" disabled>Enviar</button>
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
        thanks("¡Gracias!", "El esfuerzo de hoy está registrado.");
      } catch (e) {
        ev.target.disabled = false;
        alertError();
      }
    };
  }

  function thanks(title, text) {
    el(`<div class="done-msg"><div class="big">${title}</div><p class="sub">${text}</p></div>
        <button class="btn" id="home">Volver al inicio</button>`);
    document.getElementById("home").onclick = home;
  }

  function invalidLink() {
    el(`<div class="done-msg"><div class="big">Enlace no válido</div>
        <p class="sub">Pide al cuerpo técnico tu enlace personal de PuntoPeak.</p></div>`);
  }

  function offline() {
    el(`<div class="done-msg"><div class="big">Sin conexión</div>
        <p class="sub">Comprueba tu conexión e inténtalo de nuevo.</p></div>
        <button class="btn" id="retry">Reintentar</button>`);
    document.getElementById("retry").onclick = home;
  }

  function alertError() {
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = "No se ha podido enviar. Comprueba tu conexión e inténtalo de nuevo.";
    app.appendChild(p);
  }

  // ---------- Notificaciones ----------
  function notificationsBanner() {
    if (!("serviceWorker" in navigator) || !CFG.vapidPublicKey) return "";
    if (isIOS && !standalone) {
      return `<div class="banner"><b>Instala PuntoPeak para recibir los avisos</b>
        En Safari, pulsa <b style="display:inline">Compartir</b> y después <b style="display:inline">Añadir a pantalla de inicio</b>.
        Abre la app desde el icono nuevo.</div>`;
    }
    if (!("Notification" in window) || Notification.permission === "granted") return "";
    if (Notification.permission === "denied") {
      return `<div class="banner"><b>Avisos bloqueados</b>Actívalos en los ajustes del móvil para recibir los recordatorios.</div>`;
    }
    return `<div class="banner"><b>Activa los avisos</b>Te recordaremos el cuestionario a las ${esc(CFG.horaBienestar || "8:45")} los días de entrenamiento.
      <button class="btn" id="enable-push">Activar avisos</button></div>`;
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
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
  if (!token) return invalidLink();
  const route = location.hash.replace("#", "");
  if (route === "bienestar") wellness();
  else if (route === "rpe") rpeScreen();
  else home();
})();
