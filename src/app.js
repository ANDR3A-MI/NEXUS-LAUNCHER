// LOGICA DELLA UI in stile console.
// Modifica qui le sezioni, il comportamento della tastiera e i testi.
const shelfEl = document.getElementById("shelf");
const heroEl = document.getElementById("hero");
const statsEl = document.getElementById("stats");
const backdropEl = document.getElementById("backdrop");
const toastEl = document.getElementById("toast");
const shelfLabelEl = document.getElementById("shelfLabel");

const state = {
  section: "games",
  games: [],
  index: 0, // indice del gioco selezionato
};

// Dati per le sezioni. Ogni sezione mostra la sua lista di tile.
function itemsForSection() {
  if (state.section === "games") return state.games;
  if (state.section === "library") return state.games.filter(g => g.exe);
  return [];
}

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

// Tile vuota "Aggiungi" in fondo alla fila (per aggiungere giochi dal PC)
function renderShelf() {
  const items = itemsForSection();
  shelfEl.innerHTML = items.map((g, i) => `
    <div class="tile ${i === state.index ? "sel" : ""} ${i !== state.index ? "dim" : ""}"
         data-i="${i}"
         style="--c1:${g.color[0]};--c2:${g.color[1]}">
      ${g.cloud ? '<span class="badge">Cloud</span>' : ""}
      <span>${g.title}</span>
    </div>`).join("") + `
    <div class="tile add ${items.length === state.index ? "sel" : ""}" data-i="${items.length}">
      + Aggiungi gioco
    </div>`;

  shelfLabelEl.textContent = {
    games: "Giochi",
    library: "Libreria",
    media: "Media",
    store: "Store",
  }[state.section] || "";

  const sel = shelfEl.querySelector(".tile.sel");
  if (sel) sel.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

// Blocco centrale con il gioco selezionato
function renderHero() {
  const items = itemsForSection();
  const g = items[state.index];

  if (!g) {
    heroEl.innerHTML = `
      <div class="kicker">Nessun gioco</div>
      <h1>Aggiungi il tuo primo gioco</h1>
      <p class="sub">Seleziona "+ Aggiungi gioco" per cercare un file .exe sul PC.</p>`;
    statsEl.innerHTML = "";
    backdropEl.style.setProperty("--c1", "#1d2a44");
    backdropEl.style.setProperty("--c2", "#0a0f1a");
    return;
  }

  const last = g.playtime > 0 ? "Continua dove hai lasciato" : "Nuovo";
  heroEl.innerHTML = `
    <div class="kicker">${last}</div>
    <h1>${g.title}</h1>
    <p class="sub">${g.description}</p>
    <div class="buttons">
      ${g.exe
        ? `<button class="btn primary" data-act="play">${g.playtime > 0 ? "Continua" : "Gioca"}</button>`
        : `<button class="btn primary" disabled style="opacity:.5">Non installato</button>`}
      <button class="btn more" data-act="info">···</button>
    </div>`;

  statsEl.innerHTML = `
    <span class="chip">${g.genre}</span>
    <span class="chip">${g.playtime} h giocate</span>
    ${g.cloud ? '<span class="chip">☁ Streaming</span>' : ""}`;

  backdropEl.style.setProperty("--c1", g.color[0]);
  backdropEl.style.setProperty("--c2", g.color[1]);
}

function render() {
  document.querySelectorAll(".section").forEach(b =>
    b.classList.toggle("on", b.dataset.section === state.section));
  renderShelf();
  renderHero();
}

function setIndex(i) {
  const max = itemsForSection().length; // ultima posizione = tile "Aggiungi"
  state.index = Math.max(0, Math.min(i, max));
  render();
}

async function play() {
  const g = itemsForSection()[state.index];
  if (!g || !g.exe) return;
  const res = await window.launcher.launchGame(g.exe);
  toast(res.ok ? `Avvio di ${g.title}…` : res.error);
}

function addGame() {
  toast("Aggiunta giochi dal PC: in arrivo nella prossima versione");
}

// ===== EVENTI MOUSE =====
document.getElementById("sections").addEventListener("click", e => {
  const s = e.target.dataset.section;
  if (!s) return;
  state.section = s;
  state.index = 0;
  render();
});

shelfEl.addEventListener("click", e => {
  const t = e.target.closest(".tile");
  if (!t) return;
  const i = +t.dataset.i;
  if (i === itemsForSection().length) return addGame();
  if (i === state.index) return play();
  setIndex(i);
});

heroEl.addEventListener("click", e => {
  const act = e.target.dataset.act;
  if (act === "play") play();
  if (act === "info") toast("Dettagli: in arrivo");
});

// ===== TASTIERA E CONTROLLER =====
document.addEventListener("keydown", e => {
  if (e.key === "ArrowRight") { setIndex(state.index + 1); e.preventDefault(); }
  if (e.key === "ArrowLeft")  { setIndex(state.index - 1); e.preventDefault(); }
  if (e.key === "Enter") {
    const items = itemsForSection();
    if (state.index === items.length) addGame(); else play();
  }
  if (e.key === "Escape") { state.section = "games"; state.index = 0; render(); }
});

// Controller (gamepad): frecce sinistra/destra e tasto A
let lastPad = { left: false, right: false, a: false };
function pollGamepad() {
  const pad = (navigator.getGamepads && navigator.getGamepads()[0]);
  if (pad) {
    const now = {
      left: pad.buttons[14]?.pressed,
      right: pad.buttons[15]?.pressed,
      a: pad.buttons[0]?.pressed,
    };
    if (now.right && !lastPad.right) setIndex(state.index + 1);
    if (now.left && !lastPad.left) setIndex(state.index - 1);
    if (now.a && !lastPad.a) {
      const items = itemsForSection();
      if (state.index === items.length) addGame(); else play();
    }
    lastPad = now;
  }
  requestAnimationFrame(pollGamepad);
}

// ===== OROLOGIO =====
function tickClock() {
  const d = new Date();
  document.getElementById("clock").textContent =
    d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}
setInterval(tickClock, 1000);
tickClock();

// ===== AVVIO =====
(async function init() {
  state.games = await window.launcher.listGames();
  render();
  pollGamepad();
})();
