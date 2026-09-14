// Bridges to the SlotsLaunch.com demo-slots API (real, branded games in
// free-play mode — no gambling license needed since no real money moves).
// docs: https://docs.slotslaunch.com/article/12-api-endpoints
const fetch = require("node-fetch");

const TOKEN = process.env.SLOTSLAUNCH_API_TOKEN;
const ORIGIN = process.env.SLOTSLAUNCH_ORIGIN || "bet-assistance.onrender.com";
const BASE_URL = "https://slotslaunch.com/api";
const MAX_PAGES = 40; // ~40 * 50 = 2000 games, well above what we need

let catalogCache = null;
let catalogFetchedAt = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // SlotsLaunch asks callers to poll at most ~daily

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: `https://${ORIGIN}`,
    Authorization: `Bearer ${TOKEN}`,
  };
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
  return {
    id: `sl-${pick(raw, ["id", "slug"])}`,
    name: pick(raw, ["name", "title"], "Untitled"),
    provider: provider || "Unknown",
    slug: pick(raw, ["slug"]),
    thumb: pick(raw, ["thumb", "thumbnail", "image", "cover"]),
    embedUrl: pick(raw, ["url", "game_url", "embed_url", "iframe_url", "demo_url"]),
    rtp: pick(raw, ["rtp"]),
    volatility: pick(raw, ["volatility"]),
    reels: pick(raw, ["reels"]),
    paylines: pick(raw, ["paylines", "lines"]),
    themes: pick(raw, ["themes"], []),
    source: "slotslaunch",
  };
}

async function fetchPage(page) {
  const url = `${BASE_URL}/games?page=${page}&per_page=50&order_by=updated_at&order=desc&published=1&token=${encodeURIComponent(TOKEN)}`;
  const res = await fetch(url, { headers: headers() });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`SlotsLaunch returned non-JSON (status ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`SlotsLaunch API error ${res.status}: ${data.message || text.slice(0, 200)}`);
  }
  return data;
}

async function buildCatalog() {
  if (!TOKEN) {
    throw new Error("SLOTSLAUNCH_API_TOKEN is not set");
  }
  const games = [];
  let page = 1;
  let lastPage = 1;
  do {
    const data = await fetchPage(page);
    const items = data.data || data.games || [];
    if (page === 1 && items[0]) {
      console.log("[slotslaunch] sample raw game object:", JSON.stringify(items[0]).slice(0, 500));
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

module.exports = { getCatalog, isConfigured: () => Boolean(TOKEN) };
