// Bridges to the SlotsLaunch.com demo-slots API (real, branded games in
// free-play mode — no gambling license needed since no real money moves).
// Spec: https://docs.slotslaunch.com/article/11-getting-started
const fetch = require("node-fetch");
const crypto = require("crypto");

// .trim() defends against a stray trailing newline/space from pasting into
// a dashboard textarea — that alone silently breaks every HMAC signature.
const API_KEY = (process.env.SLOTSLAUNCH_API_TOKEN || "").trim();
const API_SECRET = (process.env.SLOTSLAUNCH_API_SECRET || "").trim();
// "site_domain"/Origin per their spec: bare host, no scheme, no www., no trailing slash.
const SITE_DOMAIN = (process.env.SLOTSLAUNCH_ORIGIN || "bet-assistance.onrender.com")
  .trim()
  .replace(/^https?:\/\//, "")
  .replace(/^www\./, "")
  .replace(/\/+$/, "");
const BASE_URL = "https://slotslaunch.com";
const MAX_PAGES = 40; // ~40 * 50 = 2000 games, well above what we need

let catalogCache = null;
let catalogFetchedAt = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // SlotsLaunch asks callers to poll at most ~daily

function isConfigured() {
  return Boolean(API_KEY && API_SECRET);
}

function signApiRequest(method, path) {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload = `${timestamp}\n${method.toUpperCase()}\n${path}`;
  const signature = crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
  return { timestamp, signature };
}

function apiHeaders(method, path) {
  const { timestamp, signature } = signApiRequest(method, path);
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: SITE_DOMAIN,
    "X-SL-Timestamp": String(timestamp),
    "X-SL-Signature": signature,
  };
}

// Signed, short-lived iframe URL — generated fresh per launch, never cached
// or stored, per SlotsLaunch's spec (payload: gameId\nexp\nsite_domain).
function signedIframeUrl(gameId, ttlSeconds = 3600) {
  if (!isConfigured()) throw new Error("SlotsLaunch credentials are not configured");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${gameId}\n${exp}\n${SITE_DOMAIN}`;
  const sig = crypto.createHmac("sha256", API_SECRET).update(payload).digest("hex");
  return `${BASE_URL}/iframe/${gameId}?token=${encodeURIComponent(API_KEY)}&exp=${exp}&sig=${sig}`;
}

function pick(obj, keys, fallback = null) {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return obj[k];
  }
  return fallback;
}

function normalize(raw) {
  const providerRaw = pick(raw, ["provider", "provider_name", "vendor"]);
  const provider = typeof providerRaw === "object" && providerRaw ? providerRaw.name : providerRaw;
  const gameId = pick(raw, ["id"]);
  return {
    id: `sl-${gameId}`,
    gameId,
    name: pick(raw, ["name", "title"], "Untitled"),
    provider: provider || "Unknown",
    slug: pick(raw, ["slug"]),
    thumb: pick(raw, ["thumb", "thumbnail", "image", "cover"]),
    rtp: pick(raw, ["rtp"]),
    volatility: pick(raw, ["volatility"]),
    reels: pick(raw, ["reels"]),
    paylines: pick(raw, ["paylines", "lines"]),
    themes: pick(raw, ["themes"], []),
    source: "slotslaunch",
  };
}

async function fetchGamesPage(page) {
  const path = "/api/games";
  const url =
    `${BASE_URL}${path}?page=${page}&per_page=50&order_by=updated_at&order=desc&published=1` +
    `&token=${encodeURIComponent(API_KEY)}`;
  const reqHeaders = apiHeaders("GET", path);
  if (page === 1) {
    console.log(
      `[slotslaunch] signing request: origin="${reqHeaders.Origin}", ts=${reqHeaders["X-SL-Timestamp"]}, ` +
        `keyLen=${API_KEY.length}, secretLen=${API_SECRET.length}, sig=${reqHeaders["X-SL-Signature"].slice(0, 12)}…`
    );
  }
  const res = await fetch(url, { headers: reqHeaders });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`SlotsLaunch returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok || data.error) {
    throw new Error(`SlotsLaunch API error ${res.status}: ${data.error || data.message || text.slice(0, 200)}`);
  }
  return data;
}

async function buildCatalog() {
  if (!isConfigured()) {
    throw new Error("SLOTSLAUNCH_API_TOKEN / SLOTSLAUNCH_API_SECRET are not set");
  }
  const games = [];
  let page = 1;
  let lastPage = 1;
  do {
    const data = await fetchGamesPage(page);
    const items = data.data || data.games || [];
    if (page === 1) {
      console.log(
        `[slotslaunch] page 1 response: top-level keys=${Object.keys(data).join(",")}, items=${items.length}`
      );
      if (items[0]) console.log("[slotslaunch] sample raw game object:", JSON.stringify(items[0]).slice(0, 500));
    }
    games.push(...items.map(normalize));
    lastPage = (data.meta && (data.meta.last_page || data.meta.lastPage)) || data.last_page || 1;
    page++;
  } while (page <= lastPage && page <= MAX_PAGES);

  return games;
}

async function getCatalog({ force = false } = {}) {
  const stale = Date.now() - catalogFetchedAt > CACHE_TTL_MS;
  if (!catalogCache || stale || force) {
    catalogCache = await buildCatalog();
    catalogFetchedAt = Date.now();
    console.log(`[slotslaunch] catalog ready (${catalogCache.length} games)`);
  }
  return catalogCache;
}

// Raw first-page response for diagnostics (no credentials in the output).
async function debugSample() {
  if (!isConfigured()) throw new Error("SLOTSLAUNCH_API_TOKEN / SLOTSLAUNCH_API_SECRET are not set");
  const data = await fetchGamesPage(1);
  return { origin: SITE_DOMAIN, topLevelKeys: Object.keys(data), raw: data };
}

function getEmbedUrl(gameId) {
  return signedIframeUrl(gameId);
}

module.exports = { getCatalog, debugSample, getEmbedUrl, isConfigured };
