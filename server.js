require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Proxy Endpoint ───────────────────────────────────────────────────────────
// Frontend calls /proxy?endpoint=nba (or boost, menu, lottery...)
// Server fetches SportsBetting.ag and returns data — no CORS for users

const SB_ENDPOINTS = {
  menu:     "https://www.sportsbetting.ag/api/sportsbetting/get-menu",
  nba:      "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=Basketball&league=NBA",
  boost:    "https://www.sportsbetting.ag/api/sportsbetting/get-contests-by-contest-type2?contestType2=Daily%20Booster",
  mlb:      "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=Baseball&league=MLB",
  nhl:      "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=Hockey&league=NHL",
  soccer:   "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=Soccer&league=UEFA+Champions+League",
  tennis:   "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=Tennis&league=ATP+Monte+Carlo",
  ufc:      "https://www.sportsbetting.ag/api/sportsbetting/offering-by-league?sport=MMA&league=UFC",
};

const BROWSER_HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Referer": "https://www.sportsbetting.ag/sportsbook",
  "Origin": "https://www.sportsbetting.ag",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
};

app.get("/proxy", async (req, res) => {
  const key = req.query.endpoint;
  const url = SB_ENDPOINTS[key];
  if (!url) return res.status(400).json({ error: `Unknown endpoint: ${key}` });

  try {
    const response = await fetch(url, { headers: BROWSER_HEADERS, timeout: 8000 });
    const data = await response.json();
    res.json({ ok: true, data });
  } catch (err) {
    console.error(`Proxy error (${key}):`, err.message);
    res.json({ ok: false, error: err.message, data: null });
  }
});

// ─── Intent Detection ─────────────────────────────────────────────────────────

function detectIntent(q) {
  q = q.toLowerCase();
  if (/nba|basketball|lakers|celtics|warriors|knicks/.test(q)) return "nba";
  if (/mlb|baseball/.test(q)) return "mlb";
  if (/nhl|hockey/.test(q)) return "nhl";
  if (/soccer|football|uefa|champions|mls/.test(q)) return "soccer";
  if (/tennis|atp|wtf/.test(q)) return "tennis";
  if (/ufc|mma|fight/.test(q)) return "ufc";
  if (/boost|promo|booster|daily/.test(q)) return "boost";
  return "menu";
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildPrompt(intent, liveData, menuData, userQuery) {
  const catalogLines = menuData && Array.isArray(menuData)
    ? menuData.slice(0, 20).map(i => `- ${i.sport || i.name || i.label || JSON.stringify(i)}`).join("\n")
    : "- NBA, MLB, NHL, UFC, Tennis, Soccer, NFL, Golf, Boxing, Lottery";

  const specificData = liveData
    ? `SPECIFIC LIVE DATA (${intent}):\n${JSON.stringify(liveData, null, 2).slice(0, 3000)}`
    : `SPECIFIC DATA: Not available for ${intent}.`;

  return `You are a helpful sports betting assistant for SportsBetting.ag.
You respond in the same language the user writes in (Spanish or English).

LIVE SPORTSBOOK CATALOG:
${catalogLines}

${specificData}

RULES:
- Only use data from above. Never invent games or odds.
- Always include the direct betting URL at end as "Bet here: [URL]"
- Explain American odds simply: +150 = win $150 on $100 bet
- If sport unavailable, say so and suggest 2 alternatives with URLs
- Keep responses to 3-4 sentences max
- End with one follow-up question

User question: "${userQuery}"`;
}

// ─── Claude Caller ────────────────────────────────────────────────────────────

async function callClaude(prompt, history = []) {
  return await client.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [...history, { role: "user", content: prompt }],
  });
}

// ─── Chat Route ───────────────────────────────────────────────────────────────

app.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const intent = detectIntent(message);

    // Fetch both menu and specific data server-side
    const [menuRes, specificRes] = await Promise.all([
      fetch(`${SB_ENDPOINTS.menu}`, { headers: BROWSER_HEADERS, timeout: 8000 }).then(r => r.json()).catch(() => null),
      SB_ENDPOINTS[intent]
        ? fetch(SB_ENDPOINTS[intent], { headers: BROWSER_HEADERS, timeout: 8000 }).then(r => r.json()).catch(() => null)
        : Promise.resolve(null),
    ]);

        console.log("Menu:", menuRes ? "OK" : "FAILED");      // ← aquí
    console.log("Specific:", specificRes ? "OK" : "FAILED"); // ← aquí

    const prompt = buildPrompt(intent, specificRes, menuRes, message);
    const stream = await callClaude(prompt, history);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    await stream.finalMessage();
    res.write(`data: ${JSON.stringify({ done: true, intent, live: !!specificRes })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Betting assistant running at http://localhost:${PORT}`);
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING");

});
