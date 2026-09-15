// Shared lobby shell: sidebar nav, search, row/grid rendering, and the
// modal chrome — driven by whichever source module (EngineSource /
// RealSource) is currently selected. Keeps the Stake/Rainbet-style shell
// in one place instead of duplicating it per source.
(function () {
  const DEVICE_KEY = "casino-device-id";
  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/-/g, "");
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  }

  function renderBalance(wallet) {
    const el = document.getElementById("cs-balance");
    if (el && typeof wallet === "number") el.textContent = Math.round(wallet).toLocaleString("es-ES");
  }

  window.CasinoLobby = { deviceId, renderBalance };

  const rowsEl = document.getElementById("cx-rows");
  const countEl = document.getElementById("cx-count");
  const searchEl = document.getElementById("cx-search");
  const navEl = document.querySelector(".cx-nav");
  const footerReal = document.getElementById("cx-footer-real");
  const footerEngine = document.getElementById("cx-footer-engine");

  const modal = document.getElementById("cs-modal");
  const modalBody = document.getElementById("cs-modal-body");
  const modalIcon = document.getElementById("cs-modal-icon");
  const modalName = document.getElementById("cs-modal-name");
  const modalProvider = document.getElementById("cs-modal-provider");

  const sources = { real: null, engine: null }; // lazily bound to window.RealSource/EngineSource
  let currentSrc = "real";
  let currentCat = "all";

  function gradientStyle(g) {
    const [a, b] = (g.theme && g.theme.gradient) || ["#3a4a6b", "#10182c"];
    return `background:linear-gradient(160deg, ${a}, ${b});`;
  }

  function cardHTML(g) {
    const visual = g.thumb
      ? `background-image:url('${g.thumb}');background-size:cover;background-position:center;`
      : gradientStyle(g);
    const icon = g.thumb ? "" : `<span class="cx-card-icon">${(g.theme && g.theme.icon) || (g.category === "keno" ? "🎱" : "🎰")}</span>`;
    return `
      <div class="cx-card" data-id="${g.id}">
        <div class="cx-card-art" style="${visual}">
          ${icon}
          <div class="cx-card-play">▶</div>
          ${g.rtpTarget ? `<span class="cx-card-rtp">${g.rtpTarget.toFixed(1)}%</span>` : ""}
        </div>
        <div class="cx-card-name">${g.name}</div>
        <div class="cx-card-provider">${g.provider}</div>
      </div>
    `;
  }

  function rowsHTML(games) {
    const byProvider = new Map();
    for (const g of games) {
      if (!byProvider.has(g.provider)) byProvider.set(g.provider, []);
      byProvider.get(g.provider).push(g);
    }
    const providers = [...byProvider.keys()].sort((a, b) => byProvider.get(b).length - byProvider.get(a).length);
    return providers
      .map(
        (prov) => `
        <section class="cx-row">
          <h2 class="cx-row-title">${prov}</h2>
          <div class="cx-row-scroller">${byProvider.get(prov).map(cardHTML).join("")}</div>
        </section>
      `
      )
      .join("");
  }

  function gridHTML(games) {
    return `<div class="cx-grid">${games.map(cardHTML).join("")}</div>`;
  }

  async function render() {
    const mod = sources[currentSrc];
    if (!mod) return;
    rowsEl.innerHTML = `<div class="cs-state">Cargando catálogo…</div>`;
    let games;
    try {
      games = await mod.getCatalog();
    } catch (err) {
      rowsEl.innerHTML = `<div class="cs-state">No se pudo cargar el catálogo: ${err.message}</div>`;
      countEl.textContent = "";
      return;
    }

    const q = searchEl.value.trim().toLowerCase();
    let filtered = games;
    if (currentCat !== "all") filtered = filtered.filter((g) => g.category === currentCat);
    if (q) filtered = filtered.filter((g) => g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q));

    countEl.textContent = `${filtered.length} juego${filtered.length === 1 ? "" : "s"}`;

    if (!filtered.length) {
      rowsEl.innerHTML = `<div class="cs-state">No se encontraron juegos con esos filtros.</div>`;
      return;
    }
    rowsEl.innerHTML = q || currentCat !== "all" ? gridHTML(filtered) : rowsHTML(filtered);
  }

  async function openGame(id) {
    const mod = sources[currentSrc];
    const games = await mod.getCatalog();
    const game = games.find((g) => g.id === id);
    if (!game) return;
    modalIcon.textContent = game.thumb ? "🎮" : (game.theme && game.theme.icon) || (game.category === "keno" ? "🎱" : "🎰");
    modalIcon.style.cssText = game.thumb ? "background:linear-gradient(135deg,#3a4a6b,#10182c);" : gradientStyle(game);
    modalName.textContent = game.name;
    modalProvider.textContent = `${game.provider} · ${game.source === "real" ? "Juego real (SlotsLaunch)" : game.category === "keno" ? "Keno" : "Tragamonedas"}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    mod.openGame(game);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalBody.innerHTML = "";
  }
  document.getElementById("cs-modal-close").onclick = closeModal;
  document.getElementById("cs-modal-backdrop").onclick = closeModal;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  rowsEl.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (card) openGame(card.dataset.id);
  });

  searchEl.addEventListener("input", render);

  navEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cx-nav-item:not(.cx-disabled)");
    if (!btn) return;
    // Category (Lobby/Tragamonedas/Keno) and source (Juegos reales/Motor
    // propio) are independent axes — each has its own "active" item.
    if (btn.dataset.cat) {
      navEl.querySelectorAll("[data-cat]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.dataset.cat;
    }
    if (btn.dataset.src) {
      navEl.querySelectorAll("[data-src]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentSrc = btn.dataset.src;
      footerReal.hidden = currentSrc !== "real";
      footerEngine.hidden = currentSrc !== "engine";
    }
    searchEl.value = "";
    document.getElementById("cx-sidebar").classList.remove("cx-open");
    render();
  });

  function boot() {
    sources.real = window.RealSource;
    sources.engine = window.EngineSource;
    render();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
