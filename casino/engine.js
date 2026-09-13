// Generic demo game engine — not affiliated with slotopol/server.
// Renders and drives a playable (fake-money) slot or keno round for any
// game entry from games.json, themed by that entry's icon/gradient.
(function (global) {
  const SLOT_SYMBOLS_BASE = ["🍒", "🍋", "🔔", "⭐", "💎", "7️⃣", "🍀", "👑"];
  const SPIN_MS = 650;

  function fmt(n) {
    return Math.round(n).toLocaleString("es-ES");
  }

  function rand(n) {
    return Math.floor(Math.random() * n);
  }

  function symbolSetFor(game) {
    const set = SLOT_SYMBOLS_BASE.slice();
    if (game.icon && !set.includes(game.icon)) set[0] = game.icon;
    return set;
  }

  // ── Slot machine (5x3 reels, 5 fixed lines) ───────────────────────────
  function mountSlot(root, game, wallet) {
    const symbols = symbolSetFor(game);
    const rows = 3, cols = 5;
    let bet = Math.min(50, wallet.get());
    let spinning = false;

    root.innerHTML = `
      <div class="game-hud">
        <div class="game-stat">Saldo<b id="sg-balance">${fmt(wallet.get())}</b></div>
        <div class="game-stat">RTP demo<b>${game.rtp}%</b></div>
        <div class="game-stat">Volatilidad<b>${game.volatility}</b></div>
        <div class="game-bet-row">
          <button class="game-bet-btn" id="sg-bet-dn">−</button>
          <div class="game-stat" style="min-width:74px;text-align:center">Apuesta<b id="sg-bet">${fmt(bet)}</b></div>
          <button class="game-bet-btn" id="sg-bet-up">+</button>
        </div>
      </div>
      <div class="slot-reels" id="sg-reels"></div>
      <div class="game-result" id="sg-result"></div>
      <div class="game-actions">
        <button class="game-spin-btn" id="sg-spin">GIRAR</button>
      </div>
      <div class="game-note">
        Modo demo con créditos ficticios · líneas fijas: 5 · motor genérico propio (no slotopol/server)
      </div>
    `;

    const reelsEl = root.querySelector("#sg-reels");
    const balanceEl = root.querySelector("#sg-balance");
    const betEl = root.querySelector("#sg-bet");
    const resultEl = root.querySelector("#sg-result");
    const spinBtn = root.querySelector("#sg-spin");

    const grid = [];
    for (let c = 0; c < cols; c++) {
      const reel = document.createElement("div");
      reel.className = "slot-reel";
      const col = [];
      for (let r = 0; r < rows; r++) {
        const cell = document.createElement("div");
        cell.className = "slot-cell";
        cell.textContent = symbols[rand(symbols.length)];
        reel.appendChild(cell);
        col.push(cell);
      }
      reelsEl.appendChild(reel);
      grid.push(col);
    }

    function setBet(delta) {
      bet = Math.max(5, Math.min(500, wallet.get(), bet + delta));
      betEl.textContent = fmt(bet);
    }
    root.querySelector("#sg-bet-up").onclick = () => setBet(10);
    root.querySelector("#sg-bet-dn").onclick = () => setBet(-10);

    function evalLines(finalGrid) {
      // 5 fixed lines: top row, mid row, bottom row, V, ^
      const lines = [
        [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2],
        [0, 1, 2, 1, 0], [2, 1, 0, 1, 2],
      ];
      let totalWin = 0;
      const winCells = new Set();
      for (const line of lines) {
        const syms = line.map((r, c) => finalGrid[c][r]);
        let run = 1;
        for (let i = 1; i < syms.length; i++) {
          if (syms[i] === syms[0]) run++; else break;
        }
        if (run >= 3) {
          const mult = run === 5 ? 20 : run === 4 ? 8 : 3;
          const symBonus = syms[0] === game.icon ? 2 : 1;
          totalWin += bet * mult * symBonus * 0.2;
          for (let i = 0; i < run; i++) winCells.add(`${i}-${line[i]}`);
        }
      }
      return { totalWin: Math.round(totalWin), winCells };
    }

    spinBtn.onclick = () => {
      if (spinning) return;
      if (bet > wallet.get()) {
        resultEl.className = "game-result lose";
        resultEl.textContent = "Saldo insuficiente para esta apuesta";
        return;
      }
      spinning = true;
      spinBtn.disabled = true;
      wallet.add(-bet);
      balanceEl.textContent = fmt(wallet.get());
      resultEl.className = "game-result";
      resultEl.textContent = "";
      grid.flat().forEach((c) => { c.classList.add("spin"); c.classList.remove("win"); });

      const finalGrid = [];
      for (let c = 0; c < cols; c++) {
        finalGrid.push(Array.from({ length: rows }, () => symbols[rand(symbols.length)]));
      }

      setTimeout(() => {
        grid.forEach((col, c) => col.forEach((cell, r) => {
          cell.classList.remove("spin");
          cell.textContent = finalGrid[c][r];
        }));
        const { totalWin, winCells } = evalLines(finalGrid);
        if (totalWin > 0) {
          wallet.add(totalWin);
          balanceEl.textContent = fmt(wallet.get());
          resultEl.className = "game-result win";
          resultEl.textContent = `¡Ganaste ${fmt(totalWin)}!`;
          winCells.forEach((key) => {
            const [c, r] = key.split("-").map(Number);
            grid[c][r].classList.add("win");
          });
        } else {
          resultEl.className = "game-result lose";
          resultEl.textContent = "Sin premio — ¡otra vez!";
        }
        spinning = false;
        spinBtn.disabled = false;
      }, SPIN_MS);
    };
  }

  // ── Keno (pick up to 10 of 80, draw 20) ───────────────────────────────
  function mountKeno(root, game, wallet) {
    let bet = Math.min(50, wallet.get());
    const picked = new Set();
    let drawing = false;

    root.innerHTML = `
      <div class="game-hud">
        <div class="game-stat">Saldo<b id="kn-balance">${fmt(wallet.get())}</b></div>
        <div class="game-stat">Elegidos<b id="kn-picked-ct">0 / 10</b></div>
        <div class="game-bet-row">
          <button class="game-bet-btn" id="kn-bet-dn">−</button>
          <div class="game-stat" style="min-width:74px;text-align:center">Apuesta<b id="kn-bet">${fmt(bet)}</b></div>
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
        Modo demo con créditos ficticios · 20 números sorteados de 80 · motor genérico propio (no slotopol/server)
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
      bet = Math.max(5, Math.min(500, wallet.get(), bet + delta));
      betEl.textContent = fmt(bet);
    }
    root.querySelector("#kn-bet-up").onclick = () => setBet(10);
    root.querySelector("#kn-bet-dn").onclick = () => setBet(-10);
    root.querySelector("#kn-clear").onclick = () => {
      if (drawing) return;
      picked.clear();
      cells.forEach((c) => c.classList.remove("picked", "hit", "miss-picked"));
      pickedCtEl.textContent = "0 / 10";
      resultEl.className = "game-result";
      resultEl.textContent = "Elige hasta 10 números y presiona Sortear";
    };

    const PAYTABLE = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 5, 5: 15, 6: 40, 7: 100, 8: 500, 9: 2000, 10: 10000 };

    drawBtn.onclick = () => {
      if (drawing || picked.size === 0) {
        if (picked.size === 0) {
          resultEl.className = "game-result lose";
          resultEl.textContent = "Elige al menos un número";
        }
        return;
      }
      if (bet > wallet.get()) {
        resultEl.className = "game-result lose";
        resultEl.textContent = "Saldo insuficiente para esta apuesta";
        return;
      }
      drawing = true;
      drawBtn.disabled = true;
      wallet.add(-bet);
      balanceEl.textContent = fmt(wallet.get());
      cells.forEach((c) => c.classList.remove("hit", "miss-picked"));

      const pool = Array.from({ length: 80 }, (_, i) => i + 1);
      const drawn = new Set();
      while (drawn.size < 20) drawn.add(pool.splice(rand(pool.length), 1)[0]);

      let i = 0;
      const order = [...drawn];
      const timer = setInterval(() => {
        const n = order[i];
        const cell = cells[n - 1];
        if (picked.has(n)) cell.classList.add("hit");
        i++;
        if (i >= order.length) {
          clearInterval(timer);
          picked.forEach((n) => {
            if (!drawn.has(n)) cells[n - 1].classList.add("miss-picked");
          });
          const hits = [...picked].filter((n) => drawn.has(n)).length;
          const mult = PAYTABLE[hits] ?? 0;
          const win = Math.round(bet * mult * (0.4 + picked.size * 0.05));
          if (win > 0) {
            wallet.add(win);
            balanceEl.textContent = fmt(wallet.get());
            resultEl.className = "game-result win";
            resultEl.textContent = `${hits} aciertos — ¡Ganaste ${fmt(win)}!`;
          } else {
            resultEl.className = "game-result lose";
            resultEl.textContent = `${hits} aciertos — sin premio`;
          }
          drawing = false;
          drawBtn.disabled = false;
        }
      }, 90);
    };
  }

  function mountGame(root, game, wallet) {
    if (game.category === "keno") mountKeno(root, game, wallet);
    else mountSlot(root, game, wallet);
  }

  global.CasinoEngine = { mountGame };
})(window);
