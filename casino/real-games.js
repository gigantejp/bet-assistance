// "Real" source: branded games via SlotsLaunch (free-play iframe embeds).
// Exposes the same small interface as EngineSource for lobby.js to drive.
(function () {
  let catalogPromise = null;

  async function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch("/api/casino/real/catalog")
        .then((r) => r.json())
        .then((d) => {
          if (d.error) throw new Error(d.error);
          return d.games.map((g) => ({
            id: g.id,
            name: g.name,
            provider: g.provider,
            category: "slot",
            thumb: g.thumb,
            meta: g,
            source: "real",
          }));
        });
    }
    return catalogPromise;
  }

  async function openGame(game) {
    const modalBody = document.getElementById("cs-modal-body");
    modalBody.innerHTML = `<div class="cs-state">Generando link seguro…</div>`;
    try {
      const res = await fetch(`/api/casino/real/embed/${encodeURIComponent(game.meta.gameId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "no se pudo generar el link");
      modalBody.innerHTML = `
        <iframe
          src="${data.url}"
          style="width:100%;aspect-ratio:16/10;border:0;border-radius:10px;background:#000"
          allow="autoplay; fullscreen"
          loading="lazy"
        ></iframe>
        <div class="game-note">Juego real en modo demo (sin dinero real), servido por SlotsLaunch.</div>
      `;
    } catch (err) {
      modalBody.innerHTML = `<div class="cs-state">No se pudo cargar el juego: ${err.message}</div>`;
    }
  }

  window.RealSource = { getCatalog, openGame };
})();
