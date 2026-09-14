// Lobby for real, branded games served via SlotsLaunch (free-play iframe
// embeds — no gambling license needed, no money changes hands). Separate
// from engine.js/casino.js, which drive the self-hosted slotopol engine.
(function () {
  const lobbyEl = document.getElementById("cs-lobby-real");
  const searchEl = document.getElementById("csr-search");
  const providerEl = document.getElementById("csr-provider");
  const countEl = document.getElementById("csr-count");

  const modal = document.getElementById("cs-modal");
  const modalBody = document.getElementById("cs-modal-body");
  const modalIcon = document.getElementById("cs-modal-icon");
  const modalName = document.getElementById("cs-modal-name");
  const modalProvider = document.getElementById("cs-modal-provider");

  let allGames = [];

  function cardHTML(g) {
    const thumbStyle = g.thumb
      ? `background-image:url('${g.thumb}');background-size:cover;background-position:center;`
      : `background:linear-gradient(135deg,#3a4a6b,#10182c);`;
    return `
      <div class="cs-card" data-id="${g.id}">
        <div class="cs-thumb" style="${thumbStyle}">
          <span class="cs-thumb-cat">Real</span>
          ${g.thumb ? "" : "<span>🎮</span>"}
        </div>
        <div class="cs-body">
          <div class="cs-name">${g.name}</div>
          <div class="cs-provider">${g.provider}</div>
          <div class="cs-meta">
            ${g.rtp ? `<span class="cs-tag">${g.rtp}% RTP</span>` : ""}
            ${g.volatility ? `<span class="cs-tag">${g.volatility}</span>` : ""}
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
    if (!game || !game.embedUrl) return;
    modalIcon.textContent = "🎮";
    modalIcon.style.cssText = "background:linear-gradient(135deg,#3a4a6b,#10182c);";
    modalName.textContent = game.name;
    modalProvider.textContent = `${game.provider} · Juego real (SlotsLaunch)`;
    modalBody.innerHTML = `
      <iframe
        src="${game.embedUrl}"
        style="width:100%;aspect-ratio:16/10;border:0;border-radius:10px;background:#000"
        allow="autoplay; fullscreen"
        loading="lazy"
      ></iframe>
      <div class="game-note">Juego real en modo demo (sin dinero real), servido por SlotsLaunch.</div>
    `;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  lobbyEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (btn) openGame(btn.dataset.id);
  });
  searchEl.addEventListener("input", applyFilters);
  providerEl.addEventListener("change", applyFilters);

  async function init() {
    try {
      const res = await fetch("/api/casino/real/catalog");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "catalog failed");
      allGames = data.games;
      const providers = [...new Set(allGames.map((g) => g.provider))].sort();
      providerEl.innerHTML =
        `<option value="all">Todos los proveedores</option>` +
        providers.map((p) => `<option value="${p}">${p}</option>`).join("");
      applyFilters();
    } catch (err) {
      lobbyEl.innerHTML = `<div class="cs-state">No se pudo cargar el catálogo real: ${err.message}</div>`;
      console.error("Error cargando catálogo SlotsLaunch", err);
    }
  }

  init();
})();
