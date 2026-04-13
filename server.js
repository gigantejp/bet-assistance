require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ESPN public APIs — no auth, no Cloudflare
const ESPN_ENDPOINTS = {
  // Basketball
  nba:        "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  wnba:       "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard",
  ncaam:      "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
  // Football
  nfl:        "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  ncaaf:      "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?groups=80",
  // Baseball
  mlb:        "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  // Hockey
  nhl:        "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
  // Soccer
  ucl:        "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard",
  epl:        "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
  laliga:     "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
  bundesliga: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard",
  seriea:     "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard",
  ligue1:     "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard",
  mls:        "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard",
  uel:        "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard",
  // MMA
  ufc:        "https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard",
  bellator:   "https://site.api.espn.com/apis/site/v2/sports/mma/bellator/scoreboard",
  // Tennis
  atp:        "https://site.api.espn.com/apis/site/v2/sports/tennis/atp/scoreboard",
  wta:        "https://site.api.espn.com/apis/site/v2/sports/tennis/wta/scoreboard",
  // Golf
  pga:        "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard",
  lpga:       "https://site.api.espn.com/apis/site/v2/sports/golf/lpga/scoreboard",
  liv:        "https://site.api.espn.com/apis/site/v2/sports/golf/liv/scoreboard",
  // Racing
  f1:         "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard",
  nascar:     "https://site.api.espn.com/apis/site/v2/sports/racing/nascar-premier/scoreboard",
  indycar:    "https://site.api.espn.com/apis/site/v2/sports/racing/irl/scoreboard",
  // Cricket
  ipl:        "https://site.api.espn.com/apis/site/v2/sports/cricket/ipl/scoreboard",
  icct20:     "https://site.api.espn.com/apis/site/v2/sports/cricket/icc.t20/scoreboard",
  // Lacrosse
  pll:        "https://site.api.espn.com/apis/site/v2/sports/lacrosse/pll/scoreboard",
  nll:        "https://site.api.espn.com/apis/site/v2/sports/lacrosse/nll/scoreboard",
};


async function espnFetch(key) {
  const url = ESPN_ENDPOINTS[key];
  if (!url) return null;
  try {
    const res = await fetch(url, { timeout: 8000 });
    if (!res.ok) { console.error(`espnFetch(${key}): HTTP ${res.status}`); return null; }
    return await res.json();
  } catch (err) {
    console.error(`espnFetch(${key}):`, err.message);
    return null;
  }
}

function detectIntent(q) {
  q = q.toLowerCase();
  if (/\bnba\b|lakers|celtics|warriors|knicks|bulls|heat|nets|bucks/.test(q)) return "nba";
  if (/\bwnba\b|fever|liberty|sparks|sky\b/.test(q)) return "wnba";
  if (/ncaam|march madness|college basketball/.test(q)) return "ncaam";
  if (/\bnfl\b|patriots|cowboys|eagles|chiefs|packers|49ers/.test(q)) return "nfl";
  if (/ncaaf|college football|cfb/.test(q)) return "ncaaf";
  if (/\bmlb\b|baseball|yankees|dodgers|mets|cubs|braves|red sox/.test(q)) return "mlb";
  if (/\bnhl\b|hockey|rangers|bruins|leafs|penguins|canadiens/.test(q)) return "nhl";
  if (/\bufc\b|mma|fight|octagon/.test(q)) return "ufc";
  if (/bellator/.test(q)) return "bellator";
  if (/premier league|epl|arsenal|chelsea|liverpool|man city|man utd/.test(q)) return "epl";
  if (/la liga|laliga|real madrid|barcelona|atletico/.test(q)) return "laliga";
  if (/bundesliga|bayern|dortmund/.test(q)) return "bundesliga";
  if (/serie a|juventus|inter milan|ac milan/.test(q)) return "seriea";
  if (/ligue 1|psg|paris saint/.test(q)) return "ligue1";
  if (/\bmls\b|sounders|galaxy|red bulls/.test(q)) return "mls";
  if (/champions league|ucl/.test(q)) return "ucl";
  if (/europa league|uel/.test(q)) return "uel";
  if (/\batp\b|tennis|djokovic|federer|nadal|alcaraz/.test(q)) return "atp";
  if (/\bwta\b|serena|swiatek|sabalenka/.test(q)) return "wta";
  if (/\bpga\b|golf|masters|open|tiger woods|mcilroy/.test(q)) return "pga";
  if (/\blpga\b/.test(q)) return "lpga";
  if (/\bliv\b golf/.test(q)) return "liv";
  if (/formula 1|\bf1\b|ferrari|mercedes|red bull racing|hamilton|verstappen/.test(q)) return "f1";
  if (/nascar/.test(q)) return "nascar";
  if (/indycar|indy 500/.test(q)) return "indycar";
  if (/\bipl\b|cricket/.test(q)) return "ipl";
  if (/\bpll\b|lacrosse/.test(q)) return "pll";
  if (/\bnll\b/.test(q)) return "nll";
  return "nba";
}

function parseESPNGames(data, intent) {
  if (!data || !data.events) return null;
  return data.events.slice(0, 10).map(e => {
    const comp = e.competitions[0];
    const teams = comp.competitors.map(c => `${c.team.displayName} (${c.score || "TBD"})`);
    const status = comp.status?.type?.description || "Scheduled";
    const date = e.date ? new Date(e.date).toLocaleString("en-US", { timeZone: "America/New_York" }) : "";
    return `${teams[0]} vs ${teams[1]} — ${status}${date ? " @ " + date : ""}`;
  }).join("\n");
}

function buildLegacyPrompt(intent, espnData, userQuery) {
  const sbUrl = SB_URLS[intent] || SB_URLS.default;
  const gamesText = parseESPNGames(espnData, intent);
  const dataSection = gamesText
    ? `UPCOMING/LIVE GAMES (${intent.toUpperCase()}) from ESPN:\n${gamesText}`
    : `No live game data available for ${intent} right now.`;

  return `You are a helpful sports betting assistant.

${dataSection}

RULES:
- Use the game data above to discuss matchups, trends, and betting angles
- You do NOT have live odds — tell the user to check the sportsbook for current lines
- Explain American odds when relevant: +150 means you win $150 on a $100 bet
- If no games are available, say so clearly
- Keep responses concise (3-5 sentences)
- End with one follow-up question

User question: "${userQuery}"`;
}



app.get("/api/scoreboard/:sport", async (req, res) => {
  const sport = (req.params.sport || "").toLowerCase();
  if (!ESPN_ENDPOINTS[sport]) {
    return res.status(400).json({ error: `Unsupported sport: ${sport}` });
  }

  const data = await espnFetch(sport);
  if (!data) {
    return res.status(502).json({ error: "Failed to fetch ESPN data" });
  }

  return res.json({
    sport,
    leagues: data.leagues || [],
    events: data.events || [],
    fetchedAt: new Date().toISOString(),
  });
});
async function callClaude(prompt, history = []) {
  return await anthropicClient.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    messages: [...history, { role: "user", content: prompt }],
  });
}

app.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });

  try {
    const intent = detectIntent(message);
    const espnData = intent !== "tennis" && intent !== "boost"
      ? await espnFetch(intent)
      : null;

    console.log(`Intent: ${intent} | ESPN: ${espnData ? "OK" : "no data"}`);

    const prompt = buildLegacyPrompt(intent, espnData, message);
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
    res.write(`data: ${JSON.stringify({ done: true, intent, live: !!espnData })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
    else { res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`); res.end(); }
  }
});

// ════════════════════════════════════════════════════════════════
//  SPEC-COMPLIANT PROMPT ENGINEERING SYSTEM  (AI PM Demo)
//  Spec: AI Betting Assistant — Prompt Design & Generation v2
// ════════════════════════════════════════════════════════════════

// Static rules live in the system prompt so prompt caching applies on every call.
// Dynamic data (context + query) stays in the user message.
const PROMPT_SYSTEM = {
  version: "v3",
  text: `You are a sports betting analyst. Analyze only the data provided — never invent odds, stats, or events.

CONTEXT PRIORITY
* Selected event active → use ONLY that event
* No selected event → use all provided events
* User explicitly mentions a different league → override scope to that league

ANALYSIS RULES
* Game status: live (score present) vs upcoming (scheduled only)
* Odds math: fav = |odds|/(|odds|+100)  |  dog = 100/(odds+100)
* Near -110/-110 = coin flip = no edge → decision = "pass"
* State explicitly when available data is limited

BETTING DISCIPLINE
* BET    → clear favorite (-200+) OR strong live momentum
* LEAN   → moderate edge (-120 to -190)
* PASS   → near-even, no signal, data insufficient, or event completed
* EXPLORE → user needs more information before deciding
* Never guarantee outcomes or suggest stake sizes

EVENT VALIDATION
* Completed event → decision = "pass", explain betting is closed
* Do NOT suggest bets for completed events

OUTPUT: return ONLY valid JSON — no text outside the JSON block.`,
};

// ─── INTENT GATE ─────────────────────────────────────────────────────────────
// Two-stage architecture: Gate classifies + authorises, Analysis LLM responds.
// The gate runs first; blocked queries never reach the analysis LLM.

const GATE_SYSTEM = `You are an intent classifier for a sports betting assistant.
Return ONLY valid JSON — no other text.

INTENTS:
ANALYZE_EVENT   = wants analysis/recommendation for a specific game
FIND_BEST_ODDS  = wants best value odds across multiple games
FIND_BEST_MATCH = wants to know which game is best to bet
FIND_EVENTS     = wants to see a list of games or the schedule
EXPLAIN         = wants explanation of a betting concept or term
ACCOUNT         = account, balance, deposits, withdrawals
BETSLIP         = bet slip, pending bets, open wagers
RG_INFO         = responsible gambling, limits, self-exclusion
OFF_TOPIC       = not related to sports or betting
MANIPULATION    = guaranteed wins, fixed matches, fraud

CONTEXT_NEEDED: "event" | "league" | "all_events" | "none"
RESPONSE_TYPE:  "bet_analysis" | "odds_comparison" | "game_list" | "explanation" | "navigation" | "static"

Block OFF_TOPIC and MANIPULATION (allowed:false). Allow all others.

{"intent":"...","allowed":true,"block_reason":null,"context_needed":"...","response_type":"..."}`;

async function runIntentGate(userQuery, model) {
  const userMessage = `Classify: "${userQuery}"`;
  const t0 = Date.now();
  try {
    const resp = await createModelResponse({
      model,
      system: GATE_SYSTEM,
      userMessage,
      temperature: 0,
      maxTokens: 100,
    });
    const raw = resp.rawText || "";
    let result = null;
    try {
      const m = raw.match(/\{[\s\S]*\}/);
      result = JSON.parse(m ? m[0] : raw);
    } catch { /* fall through to fallback */ }

    if (!result?.intent) {
      result = { intent: classifyIntent(userQuery), allowed: true, block_reason: null, context_needed: "all_events", response_type: "bet_analysis" };
    }
    return {
      result,
      debug: { model, systemPrompt: GATE_SYSTEM, userMessage, rawResponse: raw, latency_ms: Date.now() - t0, tokens: resp.usage },
    };
  } catch (err) {
    // Gate failure → fallback to regex, allow through
    return {
      result: { intent: classifyIntent(userQuery), allowed: true, block_reason: null, context_needed: "all_events", response_type: "bet_analysis" },
      debug: { model, systemPrompt: GATE_SYSTEM, userMessage, rawResponse: `[Gate error: ${err.message}]`, latency_ms: Date.now() - t0, fallback: true },
    };
  }
}

// Demo odds bank — 8 entries, mirrors sportsbook.js OB table so AI sees what users see.
// [away_ml, home_ml, spread, away_spread_juice, home_spread_juice, draw]
const OB_BANK = [
  [+130, -150, 1.5, -115, +100, +290],
  [-105, -115, 3.5, -110, -110, +310],
  [+175, -210, 1.5, +120, -140, +265],
  [+110, -130, 4.5, -110, -110, +295],
  [-120, +100, 1.5, -130, +110, +280],
  [+155, -185, 6.5, +130, -150, +320],
  [-115, -105, 2.5, -110, -110, +285],
  [+200, -240, 1.5, +145, -165, +260],
];
const SPORT_TOTALS = {
  nba:    [224.5, 228, 218.5, 231, 235, 221, 226.5, 220],
  nfl:    [44.5, 47.5, 42, 51.5, 49, 45, 48.5, 43],
  mlb:    [8.5, 9, 9.5, 7.5, 10, 8, 8.5, 9],
  nhl:    [5.5, 6, 6.5, 5, 5.5, 6, 5.5, 6],
  ncaaf:  [47.5, 54, 44, 51.5, 57, 42, 49.5, 55],
  ncaam:  [147.5, 144, 151, 139.5, 148, 152, 145, 149],
  soccer: [2.5, 3, 2.5, 3.5, 2, 2.5, 3, 2.5],
  default:[2.5, 3, 3.5, 2, 2.5, 3, 2.5, 3],
};
const SOCCER_SPORTS_SERVER = new Set(["epl","laliga","bundesliga","seriea","ligue1","ucl","uel","mls"]);

// DEMO_MARKETS — 8-entry format used by formatContext (index maps to OB_BANK row)
const DEMO_MARKETS = OB_BANK.map(o => ({
  away: o[0] > 0 ? `+${o[0]}` : `${o[0]}`,
  draw: o[5] > 0 ? `+${o[5]}` : `${o[5]}`,
  home: o[1] > 0 ? `+${o[1]}` : `${o[1]}`,
}));

// Allowed models — validated to prevent arbitrary model injection
const MODEL_CATALOG = {
  "claude-opus-4-6": { provider: "anthropic" },
  "claude-sonnet-4-6": { provider: "anthropic" },
  "claude-haiku-4-5-20251001": { provider: "anthropic" },
  "claude-opus-4-1-20250805": { provider: "anthropic" },
  "claude-opus-4-1": { provider: "anthropic" },
  "claude-opus-4-20250514": { provider: "anthropic" },
  "claude-opus-4-0": { provider: "anthropic" },
  "claude-sonnet-4-20250514": { provider: "anthropic" },
  "claude-sonnet-4-0": { provider: "anthropic" },
  "claude-3-7-sonnet-20250219": { provider: "anthropic" },
  "claude-3-7-sonnet-latest": { provider: "anthropic" },
  "claude-3-5-sonnet-20241022": { provider: "anthropic" },
  "claude-3-5-sonnet-latest": { provider: "anthropic" },
  "claude-3-5-haiku-20241022": { provider: "anthropic" },
  "claude-3-5-haiku-latest": { provider: "anthropic" },
  "claude-3-haiku-20240307": { provider: "anthropic" },
  "gpt-5.4": { provider: "openai" },
  "gpt-5.4-mini": { provider: "openai" },
  "gpt-5.4-nano": { provider: "openai" },
  "gpt-5.2": { provider: "openai" },
  "gpt-5.2-codex": { provider: "openai" },
  "gpt-5.1": { provider: "openai" },
  "gpt-5.1-codex": { provider: "openai" },
  "gpt-5": { provider: "openai" },
  "gpt-5-mini": { provider: "openai" },
  "gpt-5-nano": { provider: "openai" },
  "gpt-4.1": { provider: "openai" },
  "gpt-4.1-mini": { provider: "openai" },
  "gpt-4.1-nano": { provider: "openai" },
  "gpt-4o": { provider: "openai" },
  "gpt-4o-mini": { provider: "openai" },
  "o4-mini": { provider: "openai" },
  "gpt-4": { provider: "openai" },
};
const ALLOWED_MODELS = new Set(Object.keys(MODEL_CATALOG));
const DEFAULT_MODEL = "claude-opus-4-6";

function getModelProvider(model) {
  return MODEL_CATALOG[model]?.provider || MODEL_CATALOG[DEFAULT_MODEL].provider;
}

async function createModelResponse({ model, system, userMessage, temperature, maxTokens }) {
  const provider = getModelProvider(model);

  if (provider === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const response = await anthropicClient.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    return {
      provider,
      model: response.model,
      rawText: response.content.find((b) => b.type === "text")?.text || "",
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens: response.usage.cache_read_input_tokens || 0,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens || 0,
      },
    };
  }

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_completion_tokens: maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      let detail = errorText;
      try {
        const parsed = JSON.parse(errorText);
        detail = parsed?.error?.message || parsed?.message || errorText;
      } catch {}
      throw new Error(`OpenAI API error (${openAIResponse.status}): ${detail}`);
    }

    const response = await openAIResponse.json();
    return {
      provider,
      model: response.model || model,
      rawText: response.choices?.[0]?.message?.content || "",
      usage: {
        input_tokens: response.usage?.prompt_tokens || 0,
        output_tokens: response.usage?.completion_tokens || 0,
        cache_read_input_tokens: 0,
        cache_creation_input_tokens: 0,
      },
    };
  }

  throw new Error(`Unsupported provider for model: ${model}`);
}

function classifyIntent(query = "") {
  const q = query.toLowerCase().trim();
  if (!q) return "ANALYZE_EVENT";

  // Static short-circuit intents — never reach the LLM
  if (/my account|my balance|deposit|withdraw|transaction history|profile settings/.test(q)) return "ACCOUNT";
  if (/responsible.?gambl|self.?exclud|set.?limit|problem.?gambl|addiction|1-800-gambler|ncpg/.test(q)) return "RG_INFO";
  if (/\bbet.?slip\b|my bets|open bets|pending bets|my wagers/.test(q)) return "BETSLIP";

  // Analytical intents — reach the LLM with intent-specific prompt
  if (/best odds|value\b|best price|best line/.test(q)) return "FIND_BEST_ODDS";
  // "odds for [league/games]" — user wants odds comparison even if they say "games"
  if (/\bodds\b/.test(q) && /\bgames\b|\bmatches\b|mlb|nba|nfl|nhl|soccer|today|tonight/.test(q)) return "FIND_BEST_ODDS";
  if (/best match|which game|best game/.test(q)) return "FIND_BEST_MATCH";
  if (/explain|what does|meaning of|how do odds work|-110|moneyline|spread|what is a total|parlay|teaser/.test(q)) {
    return "EXPLAIN";
  }
  if (/games|matches|fixtures|events|tonight|today|tomorrow|schedule|what's on|what is on/.test(q)) {
    return "FIND_EVENTS";
  }
  if (
    /safe is the favorite|favorite|underdog|analyze|analysis|should i bet|lean|pick|take on|matchup|vs\b|value here|best bet|worth it/.test(q) ||
    isEventScopedQuery(q) ||
    !!detectExplicitSportMention(q)
  ) {
    return "ANALYZE_EVENT";
  }
  return "ANALYZE_EVENT";
}

function detectExplicitSportMention(query = "") {
  const q = (query || "").toLowerCase();
  const patterns = [
    ["nba", /\bnba\b|lakers|celtics|warriors|knicks|bulls|heat|nets|bucks/],
    ["wnba", /\bwnba\b|fever|liberty|sparks|sky\b/],
    ["ncaam", /ncaam|march madness|college basketball/],
    ["nfl", /\bnfl\b|patriots|cowboys|eagles|chiefs|packers|49ers/],
    ["ncaaf", /ncaaf|college football|cfb/],
    ["mlb", /\bmlb\b|baseball|yankees|dodgers|mets|cubs|braves|red sox/],
    ["nhl", /\bnhl\b|hockey|rangers|bruins|leafs|penguins|canadiens/],
    ["ufc", /\bufc\b|mma|fight|octagon/],
    ["bellator", /bellator/],
    ["epl", /premier league|epl|arsenal|chelsea|liverpool|man city|man utd/],
    ["laliga", /la liga|laliga|real madrid|barcelona|atletico/],
    ["bundesliga", /bundesliga|bayern|dortmund/],
    ["seriea", /serie a|juventus|inter milan|ac milan/],
    ["ligue1", /ligue 1|psg|paris saint/],
    ["mls", /\bmls\b|sounders|galaxy|red bulls/],
    ["ucl", /champions league|ucl/],
    ["uel", /europa league|uel/],
    ["atp", /\batp\b|tennis|djokovic|federer|nadal|alcaraz/],
    ["wta", /\bwta\b|serena|swiatek|sabalenka/],
    ["pga", /\bpga\b|golf|masters|open|tiger woods|mcilroy/],
    ["lpga", /\blpga\b/],
    ["liv", /\bliv\b golf/],
    ["f1", /formula 1|\bf1\b|ferrari|mercedes|red bull racing|hamilton|verstappen/],
    ["nascar", /nascar/],
    ["indycar", /indycar|indy 500/],
    ["ipl", /\bipl\b|cricket/],
    ["pll", /\bpll\b|lacrosse/],
    ["nll", /\bnll\b/],
  ];
  const match = patterns.find(([, pattern]) => pattern.test(q));
  return match ? match[0] : null;
}

function explainIntentDecision(query = "", intent = "ANALYZE_EVENT") {
  const q = query.toLowerCase();
  const rules = {
    FIND_EVENTS: [/games/, /matches/, /tonight/, /today/, /tomorrow/],
    FIND_BEST_ODDS: [/best odds/, /value/, /best price/, /best line/],
    FIND_BEST_MATCH: [/best match/, /which game/, /best game/],
    ANALYZE_EVENT: [/favorite/, /underdog/, /analyze/, /analysis/, /matchup/, /vs\b/],
    EXPLAIN: [/explain/, /what does .* mean/, /meaning of/, /-110/, /moneyline/, /spread/, /total/],
  };

  const matched = (rules[intent] || [])
    .map((pattern) => pattern.source.replace(/\\b/g, ""))
    .filter((pattern) => new RegExp(pattern, "i").test(q));

  if (matched.length) {
    return `Intent selected: ${intent}\nReason: matched keyword rule(s) -> ${matched.join(", ")}`;
  }

  return "Intent selected: ANALYZE_EVENT\nReason: fallback to the most reasonable event analysis interpretation.";
}

function isEventScopedQuery(query = "") {
  const q = (query || "").toLowerCase();
  return /\bthis game\b|\bthis match\b|\bthis event\b|\bthis one\b|\bfor this game\b|\bodds for this match\b|\bhere\b|\bvalue here\b/.test(q);
}

function isBroaderScopeQuery(query = "") {
  const q = (query || "").toLowerCase();
  return /\bgames\b|\bmatches\b|\bevents\b|\btonight\b|\btoday\b|\btomorrow\b|\bbest bets?\b|\bwhat'?s on\b|\bnfl games tonight\b/.test(q);
}

function getEventStatusMeta(ev = {}) {
  const comp = ev?.competitions?.[0] || {};
  const statusType = comp?.status?.type || {};
  const statusState = statusType?.state || "";
  const statusDescription = statusType?.description || "Scheduled";
  const completed = statusType?.completed === true || statusState === "post";
  return { completed, statusState, statusDescription };
}

function formatContext(events = [], intent = "ANALYZE_EVENT", activeContext = {}) {
  const lines = [];
  const activeLeague = activeContext.activeLeague || activeContext.activeSport || "";
  const explicitSport = detectExplicitSportMention(activeContext.userQuery || "");
  const eventPageActive = activeContext.currentView === "event";
  const hasSelectedEvent = !!activeContext.selectedEventId || eventPageActive;
  const eventScopedQuery = isEventScopedQuery(activeContext.userQuery || "");
  const broaderScopeQuery = isBroaderScopeQuery(activeContext.userQuery || "");
  const forceEventScope =
    hasSelectedEvent &&
    !explicitSport &&
    !broaderScopeQuery &&
    (eventPageActive || eventScopedQuery);
  const effectiveEvents = forceEventScope ? events.slice(0, 1) : events.slice(0, 5);

  if (activeLeague) {
    lines.push(`Active league page: ${activeLeague}`);
  }
  lines.push("Context priority: Event Context > Page Context > Global Context.");
  if (explicitSport && activeContext.activeSport && explicitSport !== activeContext.activeSport) {
    lines.push(`User explicitly mentioned another league in the question: ${explicitSport.toUpperCase()}`);
  } else if (activeLeague) {
    lines.push("Use the active league page as the default context unless the user explicitly asks about another league.");
  }
  if (hasSelectedEvent) {
    lines.push("A current event is selected.");
  }
  if (forceEventScope) {
    lines.push("This query is tied to the current event. Use ONLY the selected event context.");
  } else if (broaderScopeQuery) {
    lines.push("This query requests broader scope. Event context should not override the requested league/global scope.");
  }

  if (!effectiveEvents.length) {
    lines.push("No events available.");
    return lines.join("\n");
  }

  lines.push(forceEventScope ? "Current Event Context:" : "Live/Upcoming Events:");

  effectiveEvents.forEach((ev, i) => {
    const comp = ev.competitions?.[0];
    const competitors = comp?.competitors || [];
    const away = competitors.find((c) => c.homeAway === "away");
    const home = competitors.find((c) => c.homeAway === "home");
    const awayName = away?.team?.displayName || "Away Team";
    const homeName = home?.team?.displayName || "Home Team";
    const { completed, statusDescription } = getEventStatusMeta(ev);
    const status = statusDescription;
    const detail = comp?.status?.type?.shortDetail || "";
    const awayScore = away?.score ?? null;
    const homeScore = home?.score ?? null;

    let line = `- Event ${i + 1}: ${awayName} vs ${homeName} (${status}`;
    if (detail) line += `, ${detail}`;
    if (awayScore !== null && homeScore !== null)
      line += `, Score: ${awayScore}-${homeScore}`;
    line += ")";
    lines.push(line);
    lines.push(`  Actionable: ${completed ? "No - event completed" : "Yes - event not completed"}`);

    const odds = DEMO_MARKETS[i % DEMO_MARKETS.length];
    lines.push(`  Odds: ${awayName} ${odds.away} | Draw ${odds.draw} | ${homeName} ${odds.home}`);
  });

  return lines.join("\n");
}

// Intent-specific output schemas and instructions for the LLM.
const INTENT_SCHEMAS = {
  ANALYZE_EVENT: {
    instruction: "",
    schema: `{"decision":"bet|lean|pass|explore","confidence":"low|medium|high","summary":"...","insight":"...","next_action":"...","bets":[{"market":"...","selection":"...","odds":"...","reason":"..."}]}`,
  },
  FIND_BEST_ODDS: {
    instruction: "Compare ALL provided events. Identify the single best-value bet available across all games today.",
    schema: `{"decision":"bet|lean|pass","confidence":"low|medium|high","summary":"...best value bet available...","insight":"...why this line has value vs the others...","next_action":"...","bets":[{"market":"...","selection":"...","odds":"...","reason":"..."}]}`,
  },
  FIND_BEST_MATCH: {
    instruction: "Compare ALL provided events. Identify which game has the clearest betting edge and explain why.",
    schema: `{"decision":"lean|bet|pass","confidence":"low|medium|high","summary":"...best game to bet today...","insight":"...matchup comparison and why this game stands out...","next_action":"...","bets":[{"market":"...","selection":"...","odds":"...","reason":"..."}]}`,
  },
  EXPLAIN: {
    instruction: "Answer the user's question in plain language. Use 'insight' for the full explanation. Do NOT recommend specific bets.",
    schema: `{"decision":"explore","confidence":"high","summary":"...one-line answer...","insight":"...full plain-language explanation...","next_action":"...follow-up suggestion...","bets":[]}`,
  },
};

// buildPrompt — dynamic section only (context + query + intent framing).
// All static analysis rules live in PROMPT_SYSTEM.text for prompt caching.
function buildPrompt(query = "", context = "", intent = "ANALYZE_EVENT") {
  const { instruction, schema } = INTENT_SCHEMAS[intent] || INTENT_SCHEMAS.ANALYZE_EVENT;
  return `CONTEXT
${context}

USER QUERY
${query}${instruction ? `\n\nINSTRUCTION\n${instruction}` : ""}

Return ONLY valid JSON:
${schema}`;
}

function buildPromptPayload(userQuery, formattedContext, intent) {
  const detectedIntent = intent || classifyIntent(userQuery);
  const { schema: outputFormat } = INTENT_SCHEMAS[detectedIntent] || INTENT_SCHEMAS.ANALYZE_EVENT;

  const userMessage = buildPrompt(userQuery, formattedContext, detectedIntent);
  return {
    system: PROMPT_SYSTEM.text,
    userMessage,
    sections: {
      systemPrompt: PROMPT_SYSTEM.text,
      detectedIntent,
      intentDecision: explainIntentDecision(userQuery, detectedIntent),
      contextData: formattedContext,
      userInput: userQuery,
      outputFormat,
      fullPromptSystem: PROMPT_SYSTEM.text,
      fullPromptUser: userMessage,
    },
    version: PROMPT_SYSTEM.version,
  };
}

const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
const VALID_DECISIONS  = new Set(["bet", "lean", "pass", "explore"]);

function normalizeBet(bet = {}) {
  return {
    market: typeof bet.market === "string" ? bet.market : "General",
    selection: typeof bet.selection === "string" ? bet.selection : "",
    odds: typeof bet.odds === "string" ? bet.odds : "",
    reason: typeof bet.reason === "string" ? bet.reason : "",
  };
}

function safeFallbackResponse() {
  return {
    decision: "pass",
    confidence: "low",
    summary: "No clear betting edge from the available context.",
    insight: "The available event data does not justify a stronger recommendation.",
    next_action: "Check the current market prices or ask about a specific side, total, or moneyline.",
    bets: [],
  };
}

function parseResponse(text = "") {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON block found in response");
    const parsed = JSON.parse(match[0]);
    if (!VALID_DECISIONS.has(parsed.decision)) parsed.decision = "pass";
    parsed.confidence = VALID_CONFIDENCE.has((parsed.confidence || "").toLowerCase())
      ? parsed.confidence.toLowerCase()
      : "low";
    for (const key of ["summary", "insight", "next_action"]) {
      if (typeof parsed[key] !== "string") throw new Error(`Missing ${key}`);
    }
    const rawBets = Array.isArray(parsed.bets)
      ? parsed.bets
      : Array.isArray(parsed.data?.bets)
        ? parsed.data.bets
        : [];
    parsed.bets = rawBets
      ? rawBets.map(normalizeBet).slice(0, 5)
      : [];
    return { valid: true, data: parsed };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

async function generateAIResponse(query, context, model, intent) {
  const promptPayload = buildPromptPayload(query, context, intent);
  return createModelResponse({
    model,
    system: promptPayload.system,
    userMessage: promptPayload.userMessage,
    temperature: 0.5,
    maxTokens: 300,
  });
}

// POST /api/assistant/chat
// Body: { userQuery, events, model, intentModel, activeSport, activeLeague, selectedEventId, currentView }
// Returns: SSE stream — keepalive comments every 5s, then a single "data:" JSON event.
// Two-stage architecture: intentModel runs the Gate first, then model runs Analysis.
app.post("/api/assistant/chat", async (req, res) => {
  const {
    userQuery,
    events = [],
    model: reqModel,
    intentModel: reqIntentModel,
    activeSport = "",
    activeLeague = "",
    selectedEventId = null,
    currentView = "league",
  } = req.body;
  if (!userQuery?.trim()) {
    res.status(400).json({ error: "userQuery is required" });
    return;
  }

  const model       = ALLOWED_MODELS.has(reqModel)       ? reqModel       : DEFAULT_MODEL;
  const intentModel = ALLOWED_MODELS.has(reqIntentModel) ? reqIntentModel : "claude-haiku-4-5-20251001";
  const provider    = getModelProvider(model);
  const startTime   = Date.now();

  // Open SSE immediately — prevents Render's 30s proxy timeout during gate + analysis
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const keepalive = setInterval(() => res.write(":keepalive\n\n"), 5000);
  const finish = (payload) => {
    clearInterval(keepalive);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    res.end();
  };

  // ── STAGE 1: Intent Gate ─────────────────────────────────────────────────
  const gate = await runIntentGate(userQuery, intentModel);
  const intent = gate.result.intent;

  if (!gate.result.allowed) {
    return finish({
      result: {
        decision: "pass", confidence: "high",
        summary: "Request not supported",
        insight: gate.result.block_reason || "This type of query is not supported.",
        next_action: "Ask about upcoming games, odds, or betting concepts.",
        bets: [],
      },
      raw: "", log: { intent, latency_ms: Date.now() - startTime, blocked: true },
      debug: { gate: gate.debug, analysis: null },
    });
  }

  // ── LEAGUE_CONTEXT: server-fetch when user mentions a different sport ────
  const explicitSport = detectExplicitSportMention(userQuery);
  let resolvedEvents = events;
  let resolvedSport  = activeSport;

  if (explicitSport && explicitSport !== activeSport) {
    const espnData = await espnFetch(explicitSport);
    if (espnData?.events?.length) {
      resolvedEvents = espnData.events.slice(0, 10).map(ev => {
        const comp = ev.competitions?.[0];
        return {
          id: ev.id, uid: ev.uid, date: ev.date,
          competitions: [{
            competitors: (comp?.competitors || []).map(c => ({
              homeAway: c.homeAway, score: c.score,
              team: { displayName: c.team?.displayName },
            })),
            status: { type: {
              state: comp?.status?.type?.state, completed: comp?.status?.type?.completed,
              description: comp?.status?.type?.description, shortDetail: comp?.status?.type?.shortDetail,
            }},
          }],
        };
      });
      resolvedSport = explicitSport;
    }
  }

  const formattedContext = formatContext(resolvedEvents, intent, {
    activeSport: resolvedSport, activeLeague, selectedEventId, currentView, userQuery,
  });
  const { sections, version } = buildPromptPayload(userQuery, formattedContext, intent);
  const analysisDebug = { sections, version };

  // ── STAGE 1b: Static short-circuits (no analysis LLM needed) ────────────
  const STATIC_RESPONSES = {
    ACCOUNT: { decision: "explore", confidence: "high", summary: "Account management",
      insight: "Deposits, withdrawals, bet history, and profile settings are available in My Account (top right).",
      next_action: "Click 'My Account' to manage your account", bets: [] },
    BETSLIP: { decision: "explore", confidence: "high", summary: "Your bet slip",
      insight: "Open bets and pending wagers appear in the Bet Slip panel. Review selections, adjust stakes, and confirm bets there.",
      next_action: "Open the Bet Slip panel to view your current selections", bets: [] },
    RG_INFO: { decision: "explore", confidence: "high", summary: "Responsible gambling resources",
      insight: "Set deposit limits, cooling-off periods, or self-exclusion in Responsible Gambling settings. Support: 1-800-522-4700 (NCPG).",
      next_action: "Visit Responsible Gambling in account settings", bets: [] },
  };

  if (STATIC_RESPONSES[intent]) {
    return finish({
      result: STATIC_RESPONSES[intent], raw: "",
      log: { intent, latency_ms: Date.now() - startTime, short_circuit: true },
      debug: { gate: gate.debug, analysis: analysisDebug },
    });
  }

  if (intent === "FIND_EVENTS") {
    const sportLabel = (resolvedSport || activeSport || activeLeague || "").toUpperCase() || "Today's";
    const gameLines = resolvedEvents.slice(0, 8).map((ev, i) => {
      const comp = ev.competitions?.[0];
      const competitors = comp?.competitors || [];
      const away = competitors.find(c => c.homeAway === "away") || competitors[0];
      const home = competitors.find(c => c.homeAway === "home") || competitors[1];
      const detail = comp?.status?.type?.shortDetail || "Scheduled";
      return `${i + 1}. ${(away?.team?.displayName || "Away")} vs ${(home?.team?.displayName || "Home")} (${detail})`;
    });
    return finish({
      result: { decision: "explore", confidence: "high",
        summary: `${sportLabel} games today — ${gameLines.length} found`,
        insight: gameLines.join("\n"),
        next_action: "Select a game to analyze odds or ask about a specific matchup",
        bets: [] },
      raw: "",
      log: { intent, sport_resolved: resolvedSport, latency_ms: Date.now() - startTime, short_circuit: true },
      debug: { gate: gate.debug, analysis: analysisDebug },
    });
  }

  // ── STAGE 2: Analysis LLM ────────────────────────────────────────────────
  let lastError = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await generateAIResponse(userQuery, formattedContext, model, intent);

      const latency = Date.now() - startTime;
      const rawText = response.rawText || "";
      const validation = parseResponse(rawText);

      const log = {
        prompt_size_tokens: response.usage.input_tokens,
        response_size_tokens: response.usage.output_tokens,
        cache_read_tokens: response.usage.cache_read_input_tokens || 0,
        cache_write_tokens: response.usage.cache_creation_input_tokens || 0,
        model: response.model,
        model_requested: model,
        intent_model: intentModel,
        provider, latency_ms: latency, success: validation.valid,
        prompt_version: version, intent,
        sport_requested: explicitSport || activeSport,
        sport_resolved: resolvedSport,
        context_fetched: explicitSport !== null && explicitSport !== activeSport,
        gate_latency_ms: gate.debug.latency_ms,
        attempt,
      };

      console.log("[ASSISTANT]", JSON.stringify(log));

      if (!validation.valid && attempt < 2) { lastError = validation.error; continue; }

      return finish({
        result: validation.valid ? validation.data : safeFallbackResponse(),
        raw: rawText, log,
        debug: { gate: gate.debug, analysis: analysisDebug },
      });
    } catch (err) {
      lastError = err.message;
      if (attempt >= 2) break;
    }
  }

  return finish({
    result: safeFallbackResponse(),
    error: lastError || "Failed after 2 attempts",
    detail: lastError,
    log: {
      model_requested: model,
      provider,
      latency_ms: Date.now() - startTime,
      success: false,
      prompt_version: version,
      intent,
      attempt: 2,
    },
    debug: { sections, version },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Betting assistant running at http://localhost:${PORT}`);
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING");
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "loaded" : "MISSING");
});
