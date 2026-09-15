// Bridges the Node app to a real slotopol/server instance (vendored under
// casino-server/), so the casino lobby plays the actual open-source slot/keno
// math engine instead of a fake client-side RNG.
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const fetch = require("node-fetch");

const ROOT = path.join(__dirname, "casino-server");
const BIN = path.join(ROOT, "bin", "slotserver");
const APPDATA = path.join(ROOT, "appdata");
const SECRETS_FILE = path.join(APPDATA, "device-secrets.json");
const VIRTUAL_CID = 1; // seeded "virtual" demo club (appdata/slot-clubinit.sql)

// The vendored binary reads its listen port from appdata/slot-app.yaml
// (web-server.port-http, packaged as 8080) — not overridable via flag.
const BASE_URL = process.env.SLOTOPOL_URL || "http://127.0.0.1:8080";
const SELF_MANAGED = !process.env.SLOTOPOL_URL;

let child = null;
let readyPromise = null;
let catalogCache = null;

const tokens = new Map(); // deviceId -> { access, uid, exp }

function loadSecrets() {
  try {
    return JSON.parse(fs.readFileSync(SECRETS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveSecret(deviceId, entry) {
  const all = loadSecrets();
  all[deviceId] = entry;
  fs.writeFileSync(SECRETS_FILE, JSON.stringify(all, null, 2));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForPing(retries = 40) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/ping`);
      if (res.ok || res.status === 204) return true;
    } catch {
      // not up yet
    }
    await sleep(250);
  }
  throw new Error("slotopol server did not become ready in time");
}

function start() {
  if (readyPromise) return readyPromise;

  readyPromise = (async () => {
    if (SELF_MANAGED) {
      if (!fs.existsSync(BIN)) {
        throw new Error(`slotopol binary not found at ${BIN}`);
      }
      const cfgFile = path.join(APPDATA, "slot-app.yaml");
      child = spawn(BIN, ["web", "-c", cfgFile], { cwd: APPDATA, env: { ...process.env } });
      child.on("error", (err) => console.error("[casino] slotopol spawn error:", err));
      child.stdout.on("data", (d) => process.stdout.write(`[slotopol] ${d}`));
      child.stderr.on("data", (d) => process.stderr.write(`[slotopol] ${d}`));
      process.on("exit", () => child && child.kill());
    }
    await waitForPing();
    catalogCache = await buildCatalog();
    console.log(`[casino] slotopol server ready at ${BASE_URL} (${catalogCache.length} games)`);
  })();

  return readyPromise;
}

async function apiFetch(pathname, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data && data.what) || `slotopol ${pathname} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

function randomSecret() {
  return Math.random().toString(36).slice(2, 12);
}

async function ensureAccount(deviceId) {
  const all = loadSecrets();
  if (all[deviceId]) return all[deviceId];
  const email = `guest_${deviceId}@bet-assistance.local`;
  const secret = randomSecret();
  await apiFetch("/signup", { method: "POST", body: { email, secret, name: "Guest" } });
  const entry = { email, secret };
  saveSecret(deviceId, entry);
  return entry;
}

async function getToken(deviceId) {
  const cached = tokens.get(deviceId);
  if (cached && cached.exp > Date.now() + 5000) return cached;

  const { email, secret } = await ensureAccount(deviceId);
  const signin = await apiFetch("/signin", { method: "POST", body: { email, secret } });
  const entry = { access: signin.access, uid: signin.uid, exp: Date.parse(signin.expire) };
  tokens.set(deviceId, entry);
  return entry;
}

async function withAuth(deviceId, fn) {
  let entry = await getToken(deviceId);
  try {
    return await fn(entry);
  } catch (err) {
    if (err.status === 401) {
      tokens.delete(deviceId);
      entry = await getToken(deviceId);
      return fn(entry);
    }
    throw err;
  }
}

// ── Catalog (built once from the public /game/algs endpoint) ──────────────
// Bit positions mirror game.GP in casino-server/src/game/linkdata.go.
const GP_TAGS = [
  ["jackpot", 1 << 8],
  ["bonus_mode", 1 << 12],
  ["cascade", 1 << 14],
  ["free_spins", (1 << 16) | (1 << 17) | (1 << 18)],
  ["scatter", 1 << 22],
  ["wild", (1 << 24) | (1 << 25) | (1 << 26) | (1 << 27) | (1 << 28)],
];

// Purely cosmetic, original theming (no upstream art exists to reuse) —
// picks a coherent icon set + card gradient from keywords in the game name,
// so "Fire King" reads as fire/treasure instead of a random emoji grab-bag.
const THEMES = [
  {
    key: "egypt",
    match: /pharaoh|ra deluxe|\bra\b|ramesses|ankh|egypt|cleopatra|astarta|sphinx/i,
    icon: "🏺",
    gradient: ["#caa244", "#4a2f0a"],
    symbols: ["🏺", "🐫", "👑", "☀️", "🔺", "🦂", "🐍", "💰"],
  },
  {
    key: "fruit",
    match: /fruit|cherry|cherries|banana|apple|melon|citrus|juicy|sugar/i,
    icon: "🍒",
    gradient: ["#e0455e", "#5a0f26"],
    symbols: ["🍒", "🍋", "🍇", "🍉", "🍊", "🍓", "🍎", "7️⃣"],
  },
  {
    key: "gem",
    match: /gem|jewel|diamond|sapphire|emerald|ruby|rubies|crown jewel/i,
    icon: "💎",
    gradient: ["#3fb0e0", "#0b2f52"],
    symbols: ["💎", "💍", "🔷", "🔶", "⭐", "✨", "🔹", "👑"],
  },
  {
    key: "treasure",
    match: /gold|treasure|fortune|royal|prophec|dynasty|money|lucky|crown/i,
    icon: "🪙",
    gradient: ["#f0c24b", "#5a3f04"],
    symbols: ["🪙", "💰", "👑", "🏆", "💵", "🗝️", "📦", "💎"],
  },
  {
    key: "beast",
    match: /dolphin|beetle|wolf|dragon|kraken|whale|rooster|fox|bigfoot|panda|penguin|rex|dogs|birds|snake|tiger|lion/i,
    icon: "🐉",
    gradient: ["#3fae6a", "#0a3a20"],
    symbols: ["🐉", "🐺", "🦅", "🐍", "🦂", "🐬", "🦁", "🐸"],
  },
  {
    key: "mythic",
    match: /god|asgard|valkyrie|zeus|excalibur|guardian|nymph|goblin|fairy|wizard|magic|witches|voodoo|spell/i,
    icon: "🔮",
    gradient: ["#9a5fe0", "#2a1050"],
    symbols: ["🔮", "🧙", "⚡", "🌙", "👹", "🦄", "🗡️", "⭐"],
  },
  {
    key: "fire",
    match: /fire|hot|flame|burning|inferno|chilli|dozen|storm/i,
    icon: "🔥",
    gradient: ["#ff7a3d", "#5a1200"],
    symbols: ["🔥", "🌋", "💥", "☄️", "🧨", "🌶️", "⚡", "👑"],
  },
  {
    key: "ice",
    match: /ice|cold|frost|polar|winter|christmas|santa|snow/i,
    icon: "❄️",
    gradient: ["#5fd0e0", "#08313d"],
    symbols: ["❄️", "🧊", "⛄", "🌨️", "💎", "🔵", "⭐", "🥶"],
  },
  {
    key: "space",
    match: /galaxy|space|star|astro|bitcoin|tesla|infinity/i,
    icon: "✨",
    gradient: ["#5a6bd8", "#0d1040"],
    symbols: ["✨", "🌟", "💫", "🪐", "🚀", "🌌", "⭐", "☄️"],
  },
  {
    key: "classic",
    match: /classic|7's|seven|joker|cabaret|clover|hyper|cuber|shining/i,
    icon: "🍀",
    gradient: ["#3fae6a", "#0d2a16"],
    symbols: ["🍀", "7️⃣", "🔔", "🍒", "⭐", "💎", "👑", "🎰"],
  },
];
const DEFAULT_THEME = {
  key: "default",
  icon: "🎰",
  gradient: ["#3a4a6b", "#10182c"],
  symbols: ["🍒", "🍋", "🍇", "🔔", "⭐", "💎", "7️⃣", "👑"],
};

function pickTheme(name) {
  for (const t of THEMES) if (t.match.test(name)) return t;
  return DEFAULT_THEME;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function closestRtp(list, target) {
  if (!list || !list.length) return null;
  return list.reduce((best, v) => (Math.abs(v - target) < Math.abs(best - target) ? v : best));
}

async function buildCatalog() {
  const algs = await apiFetch("/game/algs");
  const games = [];
  for (const alg of algs) {
    const tags = GP_TAGS.filter(([, mask]) => (alg.gp || 0) & mask).map(([name]) => name);
    if (alg.bn) tags.push("bonus_game");
    for (const alias of alg.aliases || []) {
      const isKeno = alg.gt === 2;
      let theme = pickTheme(alias.name);
      if (isKeno && theme === DEFAULT_THEME) {
        theme = { icon: "🎱", gradient: ["#3a3f5a", "#12141f"], symbols: DEFAULT_THEME.symbols };
      }
      games.push({
        id: slugify(`${alias.prov}-${alias.name}`),
        alias: `${alias.prov} / ${alias.name}`,
        name: alias.name,
        provider: alias.prov,
        category: isKeno ? "keno" : "slot",
        reels: alg.sx || null,
        rows: alg.sy || null,
        symbols: alg.sn || null,
        lines: alias.lnum || alg.ln || null,
        ways: alg.wn || null,
        rtpTarget: closestRtp(alg.rtp, 95),
        rtpRange: alg.rtp && alg.rtp.length ? [Math.min(...alg.rtp), Math.max(...alg.rtp)] : null,
        tags,
        theme: { icon: theme.icon, gradient: theme.gradient, symbols: theme.symbols },
      });
    }
  }
  games.sort((a, b) => a.name.localeCompare(b.name));
  return games;
}

async function getCatalog() {
  if (!catalogCache) await start();
  return catalogCache;
}

// ── Gameplay ────────────────────────────────────────────────────────────
async function newGame(deviceId, alias) {
  await start();
  return withAuth(deviceId, ({ access, uid }) =>
    apiFetch("/game/new", { method: "POST", token: access, body: { cid: VIRTUAL_CID, uid, alias } })
  );
}

async function spin(deviceId, gid, bet, sel) {
  await start();
  const body = { gid };
  if (bet) body.bet = bet;
  if (sel) body.sel = sel;
  return withAuth(deviceId, ({ access }) => apiFetch("/slot/spin", { method: "POST", token: access, body }));
}

async function kenoSpin(deviceId, gid, bet, sel) {
  await start();
  const body = { gid };
  if (bet) body.bet = bet;
  if (sel) body.sel = sel;
  return withAuth(deviceId, ({ access }) => apiFetch("/keno/spin", { method: "POST", token: access, body }));
}

async function collect(deviceId, gid) {
  await start();
  return withAuth(deviceId, ({ access }) =>
    apiFetch("/slot/collect", { method: "POST", token: access, body: { gid } }).catch(() => null)
  );
}

module.exports = { start, getCatalog, newGame, spin, kenoSpin, collect };
