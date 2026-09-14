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

  async function api(path, body) {
    const res = await fetch(`/api/casino/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: deviceId(), ...body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${path} failed`);
    return data;
  }

  function renderBalance(wallet) {
    const el = document.getElementById("cs-balance");
    if (el && typeof wallet === "number") el.textContent = Math.round(wallet).toLocaleString("es-ES");
  }

  const lobbyEl = document.getElementById("cs-lobby");
  const searchEl = document.getElementById("cs-search");
  const providerEl = document.getElementById("cs-provider");
  const catsEl = document.getElementById("cs-cats");
  const countEl = document.getElementById("cs-count");
  const modal = document.getElementById("cs-modal");
  const modalBody = document.getElementById("cs-modal-body");
  const modalIcon = document.getElementById("cs-modal-icon");
  const modalName = document.getElementById("cs-modal-name");
  const modalProvider = document.getElementById("cs-modal-provider");

  const TAG_LABELS = {
    jackpot: "Jackpot",
    bonus_mode: "Bonus",
    bonus_game: "Bonus",
    cascade: "Cascada",
    free_spins: "Free Spins",
    scatter: "Scatter",
    wild: "Wild",
  };

  let allGames = [];
  let activeCat = "all";

  function cardHTML(g) {
    const dims = g.category === "keno" ? "80 números" : `${g.reels}x${g.rows}`;
    const betUnit = g.category === "keno" ? null : g.ways ? `${g.ways} formas` : g.lines ? `${g.lines} líneas` : null;
    const tags = (g.tags || []).slice(0, 2).map((t) => TAG_LABELS[t] || t);
    return `
      <div class="cs-card" data-id="${g.id}">
        <div class="cs-thumb">
          <span class="cs-thumb-cat">${g.category === "keno" ? "Keno" : "Slot"}</span>
          <span>${g.category === "keno" ? "🎱" : "🎰"}</span>
          ${g.rtpTarget ? `<span class="cs-thumb-rtp">${g.rtpTarget.toFixed(1)}% RTP</span>` : ""}
        </div>
        <div class="cs-body">
          <div class="cs-name">${g.name}</div>
          <div class="cs-provider">${g.provider}</div>
          <div class="cs-meta">
            <span class="cs-tag">${dims}</span>
            ${betUnit ? `<span class="cs-tag">${betUnit}</span>` : ""}
            ${tags.map((t) => `<span class="cs-tag">${t}</span>`).join("")}
          </div>
          <button class="cs-play" data-id="${g.id}">Jugar</button>
        </div>
      </div>
    `;
  }

  function applyFilters() {
    const q = searchEl.value.trim().toLowerCase();
    const provider = providerEl.value;
    const filtered = allGames.filter((g) => {
      if (activeCat !== "all" && g.category !== activeCat) return false;
      if (provider !== "all" && g.provider !== provider) return false;
      if (q && !g.name.toLowerCase().includes(q) && !g.provider.toLowerCase().includes(q)) return false;
      return true;
    });
    countEl.textContent = `${filtered.length} juego${filtered.length === 1 ? "" : "s"}`;
    lobbyEl.innerHTML = filtered.length
      ? filtered.map(cardHTML).join("")
      : `<div class="cs-state">No se encontraron juegos con esos filtros.</div>`;
  }

  async function openGame(id) {
    const game = allGames.find((g) => g.id === id);
    if (!game) return;
    modalIcon.textContent = game.category === "keno" ? "🎱" : "🎰";
    modalName.textContent = game.name;
    modalProvider.textContent = `${game.provider} · ${game.category === "keno" ? "Keno" : "Tragamonedas"}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalBody.innerHTML = `<div class="cs-state">Conectando con el motor real…</div>`;

    try {
      const { gid, game: state, wallet } = await api("new-game", { alias: game.alias });
      renderBalance(wallet);
      window.CasinoEngine.mount(modalBody, game, gid, state, wallet, { api, renderBalance });
    } catch (err) {
      modalBody.innerHTML = `<div class="cs-state">No se pudo iniciar el juego: ${err.message}</div>`;
    }
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

  lobbyEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (btn) openGame(btn.dataset.id);
  });

  searchEl.addEventListener("input", applyFilters);
  providerEl.addEventListener("change", applyFilters);
  catsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".cs-cat");
    if (!btn) return;
    catsEl.querySelectorAll(".cs-cat").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    applyFilters();
  });

  async function init() {
    try {
      const res = await fetch("/api/casino/catalog");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "catalog failed");
      allGames = data.games;
      const providers = [...new Set(allGames.map((g) => g.provider))].sort();
      providerEl.innerHTML =
        `<option value="all">Todos los proveedores</option>` +
        providers.map((p) => `<option value="${p}">${p}</option>`).join("");
      applyFilters();
    } catch (err) {
      lobbyEl.innerHTML = `<div class="cs-state">No se pudo cargar el catálogo (¿el motor slotopol sigue iniciando?). ${err.message}</div>`;
      console.error("Error cargando catálogo", err);
      setTimeout(init, 3000);
    }
  }

  init();
})();
