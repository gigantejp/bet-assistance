(function () {
  const BALANCE_KEY = "casino-demo-balance";
  const START_BALANCE = 1000;

  const wallet = {
    get() {
      const v = Number(localStorage.getItem(BALANCE_KEY));
      return Number.isFinite(v) && v > 0 ? v : START_BALANCE;
    },
    add(delta) {
      const next = Math.max(0, this.get() + delta);
      localStorage.setItem(BALANCE_KEY, String(next));
      renderBalance();
      return next;
    },
    reset() {
      localStorage.setItem(BALANCE_KEY, String(START_BALANCE));
      renderBalance();
    },
  };

  function renderBalance() {
    const el = document.getElementById("cs-balance");
    if (el) el.textContent = wallet.get().toLocaleString("es-ES");
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

  let allGames = [];
  let activeCat = "all";

  function gradientStyle(g) {
    const [a, b] = g.gradient || ["#333", "#111"];
    return `background:linear-gradient(135deg, ${a}, ${b});`;
  }

  function cardHTML(g) {
    return `
      <div class="cs-card" data-id="${g.id}">
        <div class="cs-thumb" style="${gradientStyle(g)}">
          <span class="cs-thumb-cat">${g.category === "keno" ? "Keno" : "Slot"}</span>
          <span>${g.icon}</span>
          <span class="cs-thumb-rtp">${g.rtp}% RTP</span>
        </div>
        <div class="cs-body">
          <div class="cs-name">${g.name}</div>
          <div class="cs-provider">${g.provider}</div>
          <div class="cs-meta">
            ${g.lines ? `<span class="cs-tag">${g.lines} líneas</span>` : ""}
            <span class="cs-tag">${g.volatility}</span>
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

  function openGame(id) {
    const game = allGames.find((g) => g.id === id);
    if (!game) return;
    modalIcon.textContent = game.icon;
    modalIcon.parentElement.style.background = "none";
    modalName.textContent = game.name;
    modalProvider.textContent = `${game.provider} · ${game.category === "keno" ? "Keno" : "Tragamonedas"}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    window.CasinoEngine.mountGame(modalBody, game, wallet);
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
    renderBalance();
    try {
      const res = await fetch("games.json");
      const data = await res.json();
      allGames = data.games;
      providerEl.innerHTML =
        `<option value="all">Todos los proveedores</option>` +
        data.providers.map((p) => `<option value="${p}">${p}</option>`).join("");
      applyFilters();
    } catch (err) {
      lobbyEl.innerHTML = `<div class="cs-state">No se pudo cargar el catálogo de juegos.</div>`;
      console.error("Error cargando games.json", err);
    }
  }

  init();
})();
