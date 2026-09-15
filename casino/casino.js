// "Engine" source: the self-hosted slotopol/server catalog + gameplay.
// Exposes a small interface the shared lobby (lobby.js) drives.
(function () {
  let catalogPromise = null;

  async function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch("/api/casino/catalog")
        .then((r) => r.json())
        .then((d) => {
          if (d.error) throw new Error(d.error);
          return d.games.map((g) => ({
            id: `eng-${g.id}`,
            name: g.name,
            provider: g.provider,
            category: g.category,
            rtpTarget: g.rtpTarget,
            theme: g.theme,
            meta: g,
            source: "engine",
          }));
        });
    }
    return catalogPromise;
  }

  async function api(path, body) {
    const res = await fetch(`/api/casino/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId: window.CasinoLobby.deviceId(), ...body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `${path} failed`);
    return data;
  }

  async function openGame(game) {
    const meta = game.meta;
    const modalBody = document.getElementById("cs-modal-body");
    modalBody.innerHTML = `<div class="cs-state">Conectando con el motor real…</div>`;
    try {
      const { gid, game: state, wallet } = await api("new-game", { alias: meta.alias });
      window.CasinoLobby.renderBalance(wallet);
      window.CasinoEngine.mount(modalBody, meta, gid, state, wallet, { api, renderBalance: window.CasinoLobby.renderBalance });
    } catch (err) {
      modalBody.innerHTML = `<div class="cs-state">No se pudo iniciar el juego: ${err.message}</div>`;
    }
  }

  window.EngineSource = { getCatalog, openGame };
})();
