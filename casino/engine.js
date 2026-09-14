// Renders the real grid/wins/wallet returned by the vendored slotopol/server
// engine (via casinoService.js on our own backend). No local RNG here —
// every spin outcome comes straight from that engine's HTTP API.
(function (global) {
  const FALLBACK_PALETTE = ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣", "👑"];

  function fmt(n) {
    return Math.round(n).toLocaleString("es-ES");
  }

  function iconFor(symId, palette) {
    if (symId === 0) return "";
    const set = palette && palette.length ? palette : FALLBACK_PALETTE;
    return set[Math.abs(symId - 1) % set.length];
  }

  function winKeySet(wins) {
    const set = new Set();
    for (const w of wins || []) {
      for (const [x, y] of w.xy || []) set.add(`${x}-${y}`);
    }
    return set;
  }

  // ── Slot machine ───────────────────────────────────────────────────────
  function mountSlot(root, meta, gid, initial, wallet, ctx) {
    let bet = initial.bet || 1;
    let spinning = false;
    const palette = (meta.theme && meta.theme.symbols) || FALLBACK_PALETTE;

    root.innerHTML = `
      <div class="game-hud">
        <div class="game-stat">Saldo<b id="sg-balance">${fmt(wallet)}</b></div>
        <div class="game-stat">RTP objetivo<b>${meta.rtpTarget ? meta.rtpTarget.toFixed(1) + "%" : "—"}</b></div>
        <div class="game-stat">Líneas<b>${initial.sel ?? meta.lines ?? "—"}</b></div>
        <div class="game-bet-row">
          <button class="game-bet-btn" id="sg-bet-dn">−</button>
          <div class="game-stat" style="min-width:74px;text-align:center">Apuesta<b id="sg-bet">${bet}</b></div>
          <button class="game-bet-btn" id="sg-bet-up">+</button>
        </div>
      </div>
      <div class="slot-reels" id="sg-reels" style="grid-template-columns:repeat(${meta.reels},1fr)"></div>
      <div class="game-result" id="sg-result"></div>
      <div class="game-actions">
        <button class="game-spin-btn" id="sg-spin">GIRAR</button>
      </div>
      <div class="game-note">
        Motor real: <a href="https://github.com/slotopol/server" target="_blank" rel="noopener">slotopol/server</a>
        (self-hosted) · símbolos genéricos, resultados y RTP 100% del motor · créditos de demo
      </div>
    `;

    const reelsEl = root.querySelector("#sg-reels");
    const balanceEl = root.querySelector("#sg-balance");
    const betEl = root.querySelector("#sg-bet");
    const resultEl = root.querySelector("#sg-result");
    const spinBtn = root.querySelector("#sg-spin");

    const grid = []; // grid[reel][row] -> cell element
    function buildGrid(values) {
      reelsEl.innerHTML = "";
      grid.length = 0;
      for (let c = 0; c < meta.reels; c++) {
        const reel = document.createElement("div");
        reel.className = "slot-reel";
        const col = [];
        for (let r = 0; r < meta.rows; r++) {
          const cell = document.createElement("div");
          cell.className = "slot-cell";
          cell.textContent = iconFor(values[c][r], palette);
          reel.appendChild(cell);
          col.push(cell);
        }
        reelsEl.appendChild(reel);
        grid.push(col);
      }
    }
    buildGrid(initial.grid);

    function setBet(delta) {
      bet = Math.max(1, bet + delta);
      betEl.textContent = bet;
    }
    root.querySelector("#sg-bet-up").onclick = () => setBet(1);
    root.querySelector("#sg-bet-dn").onclick = () => setBet(-1);

    spinBtn.onclick = async () => {
      if (spinning) return;
      spinning = true;
      spinBtn.disabled = true;
      resultEl.className = "game-result";
      resultEl.textContent = "";
      grid.flat().forEach((c) => { c.classList.add("spin"); c.classList.remove("win"); });

      try {
        const res = await ctx.api("spin", { gid, bet });
        await new Promise((r) => setTimeout(r, 450));
        buildGrid(res.game.grid);
        ctx.renderBalance(res.wallet);
        balanceEl.textContent = fmt(res.wallet);

        const gain = res.game.gain || 0;
        if (gain > 0) {
          resultEl.className = "game-result win";
          resultEl.textContent = `¡Ganaste ${fmt(gain)}!`;
          const wins = winKeySet(res.wins);
          wins.forEach((key) => {
            const [x, y] = key.split("-").map(Number);
            if (grid[x] && grid[x][y]) grid[x][y].classList.add("win");
          });
          ctx.api("collect", { gid }).catch(() => {});
        } else {
          resultEl.className = "game-result lose";
          resultEl.textContent = "Sin premio — ¡otra vez!";
        }
      } catch (err) {
        resultEl.className = "game-result lose";
        resultEl.textContent = err.message;
      } finally {
        spinning = false;
        spinBtn.disabled = false;
      }
    };
  }

  // ── Keno ────────────────────────────────────────────────────────────────
  const KS_EMPTY = 0, KS_SEL = 1, KS_HIT = 2, KS_SELHIT = 3;

  function mountKeno(root, meta, gid, initial, wallet, ctx) {
    let bet = initial.bet || 1;
    const picked = new Set();
    let drawing = false;

    root.innerHTML = `
      <div class="game-hud">
        <div class="game-stat">Saldo<b id="kn-balance">${fmt(wallet)}</b></div>
        <div class="game-stat">Elegidos<b id="kn-picked-ct">0 / 10</b></div>
        <div class="game-bet-row">
          <button class="game-bet-btn" id="kn-bet-dn">−</button>
          <div class="game-stat" style="min-width:74px;text-align:center">Apuesta<b id="kn-bet">${bet}</b></div>
          <button class="game-bet-btn" id="kn-bet-up">+</button>
        </div>
      </div>
      <div class="keno-board" id="kn-board"></div>
      <div class="game-result" id="kn-result">Elige hasta 10 números y presiona Sortear</div>
      <div class="game-actions">
        <button class="game-spin-btn" id="kn-clear" style="flex:none;background:var(--card);border:1px solid var(--line)">Limpiar</button>
        <button class="game-spin-btn" id="kn-draw">SORTEAR</button>
      </div>
      <div class="game-note">
        Motor real: <a href="https://github.com/slotopol/server" target="_blank" rel="noopener">slotopol/server</a>
        (self-hosted) · 20 números sorteados de 80 por el motor real · créditos de demo
      </div>
    `;

    const boardEl = root.querySelector("#kn-board");
    const balanceEl = root.querySelector("#kn-balance");
    const pickedCtEl = root.querySelector("#kn-picked-ct");
    const betEl = root.querySelector("#kn-bet");
    const resultEl = root.querySelector("#kn-result");
    const drawBtn = root.querySelector("#kn-draw");

    const cells = [];
    for (let n = 1; n <= 80; n++) {
      const cell = document.createElement("div");
      cell.className = "keno-num";
      cell.textContent = n;
      cell.onclick = () => {
        if (drawing) return;
        if (picked.has(n)) {
          picked.delete(n);
          cell.classList.remove("picked");
        } else if (picked.size < 10) {
          picked.add(n);
          cell.classList.add("picked");
        }
        pickedCtEl.textContent = `${picked.size} / 10`;
      };
      boardEl.appendChild(cell);
      cells.push(cell);
    }

    function setBet(delta) {
      bet = Math.max(1, bet + delta);
      betEl.textContent = bet;
    }
    root.querySelector("#kn-bet-up").onclick = () => setBet(1);
    root.querySelector("#kn-bet-dn").onclick = () => setBet(-1);
    root.querySelector("#kn-clear").onclick = () => {
      if (drawing) return;
      picked.clear();
      cells.forEach((c) => c.classList.remove("picked", "hit", "miss-picked"));
      pickedCtEl.textContent = "0 / 10";
      resultEl.className = "game-result";
      resultEl.textContent = "Elige hasta 10 números y presiona Sortear";
    };

    drawBtn.onclick = async () => {
      if (drawing) return;
      if (picked.size === 0) {
        resultEl.className = "game-result lose";
        resultEl.textContent = "Elige al menos un número";
        return;
      }
      drawing = true;
      drawBtn.disabled = true;
      cells.forEach((c) => c.classList.remove("hit", "miss-picked"));

      try {
        const res = await ctx.api("keno-spin", { gid, bet, sel: [...picked] });
        await new Promise((r) => setTimeout(r, 400));
        res.game.grid.forEach((ks, i) => {
          const cell = cells[i];
          if (ks === KS_SELHIT) cell.classList.add("hit");
          else if (ks === KS_SEL) cell.classList.add("miss-picked");
        });
        ctx.renderBalance(res.wallet);
        balanceEl.textContent = fmt(res.wallet);

        const { num, pay } = res.wins || { num: 0, pay: 0 };
        if (pay > 0) {
          resultEl.className = "game-result win";
          resultEl.textContent = `${num} aciertos — ¡Ganaste ${fmt(pay)}!`;
        } else {
          resultEl.className = "game-result lose";
          resultEl.textContent = `${num} aciertos — sin premio`;
        }
      } catch (err) {
        resultEl.className = "game-result lose";
        resultEl.textContent = err.message;
      } finally {
        drawing = false;
        drawBtn.disabled = false;
      }
    };
  }

  function mount(root, meta, gid, initial, wallet, ctx) {
    if (meta.category === "keno") mountKeno(root, meta, gid, initial, wallet, ctx);
    else mountSlot(root, meta, gid, initial, wallet, ctx);
  }

  global.CasinoEngine = { mount };
})(window);
