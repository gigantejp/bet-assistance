require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(__dirname));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

// ════════════════════════════════════════════════════════════════
//  SPEC-COMPLIANT PROMPT ENGINEERING SYSTEM  (AI PM Demo)
//  Spec: AI Betting Assistant — Prompt Design & Generation v2
// ════════════════════════════════════════════════════════════════

// 3.2 System Prompt — v2
// Key upgrades over v1:
//  - Explicit analysis framework (4 steps)
//  - Confidence criteria with numeric thresholds
//  - Mandatory data citation (anti-hallucination)
//  - Odds → implied probability instruction
const SYSTEM_PROMPT = {
  version: "v2",
  text: `You are an expert sports betting analyst. Your recommendations must be grounded in the data provided.

ANALYSIS FRAMEWORK — reason through these steps before recommending:
1. GAME STATUS: Is the game live (with a score) or upcoming? Live games carry momentum signals; upcoming games offer only the scheduled matchup.
2. COMPETITIVE BALANCE: Read the odds. Convert American odds to implied probability:
   - Favorite:  |odds| / (|odds| + 100)  → e.g., -150 = 60% implied win probability
   - Underdog:  100 / (odds + 100)       → e.g., +120 = 45.5% implied win probability
3. VALUE ASSESSMENT: Does the implied probability seem fair given the available data? If odds are near -110/-110, it is a near coin-flip — only recommend if there is a specific signal.
4. DATA SUFFICIENCY: Do you have enough context to justify a recommendation? If only team names and status are available, state the limited basis explicitly.

CONFIDENCE LEVELS — apply these criteria strictly:
- HIGH: Clear favorite at -200 or shorter, OR strong live momentum visible in score
- MEDIUM: Moderate favorite (-120 to -190), or a meaningful edge visible in the data
- LOW: Near-even odds (-115 to +115), or only scheduled game info with no other signal
- NONE: Return empty bets array and explain why in the summary

RULES:
- Every bet MUST cite specific data from the context (team name, score, exact odds)
- Do not invent statistics, streaks, or historical data not present in the context
- Do not recommend LOW-confidence bets unless the user explicitly asks for them
- Always include the implied probability when discussing odds
- Use uncertainty language — never guarantee outcomes
- Always respond in English`,
};

// Demo odds table (ESPN doesn't expose real odds)
const DEMO_MARKETS = [
  { away: "+120", draw: "+280", home: "-150" },
  { away: "-110", draw: "+300", home: "+100" },
  { away: "+200", draw: "+250", home: "-230" },
];

// Allowed models — validated to prevent arbitrary model injection
const ALLOWED_MODELS = new Set([
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
]);
const DEFAULT_MODEL = "claude-opus-4-6";

// 3.3 Context Formatter — ESPN events → human-readable text
// Sends the full event list (up to 15) so the AI can compare all matchups
function formatContext(events = []) {
  if (!events.length) return "No events available.";

  const top = events.slice(0, 15); // full board context
  const lines = ["Live/Upcoming Events:"];

  top.forEach((ev, i) => {
    const comp = ev.competitions?.[0];
    const competitors = comp?.competitors || [];
    const away = competitors.find((c) => c.homeAway === "away");
    const home = competitors.find((c) => c.homeAway === "home");
    const awayName = away?.team?.displayName || "Away Team";
    const homeName = home?.team?.displayName || "Home Team";
    const status = comp?.status?.type?.description || "Scheduled";
    const detail = comp?.status?.type?.shortDetail || "";
    const awayScore = away?.score ?? null;
    const homeScore = home?.score ?? null;

    let line = `- ${awayName} vs ${homeName} (${status}`;
    if (detail) line += `, ${detail}`;
    if (awayScore !== null && homeScore !== null)
      line += `, Score: ${awayScore}-${homeScore}`;
    line += ")";
    lines.push(line);

    const odds = DEMO_MARKETS[i % DEMO_MARKETS.length];
    lines.push(`  Markets:`);
    lines.push(
      `  - Match Winner: ${awayName} ${odds.away} | Draw ${odds.draw} | ${homeName} ${odds.home}`
    );
  });

  return lines.join("\n");
}

// 4. Prompt Builder — merges all 4 sections per spec
// Constraints: ~800 token context, ~1200 token total
function buildPrompt(userQuery, formattedContext) {
  const outputInstruction = `Return your answer strictly in the following JSON format:
{
  "summary": "2-sentence analysis of the betting landscape",
  "bets": [
    {
      "market": "market name (e.g. Match Winner, Spread, Over/Under)",
      "selection": "team or option name",
      "confidence": "high | medium | low",
      "implied_probability": "e.g. 60%",
      "reason": "grounded justification citing specific odds and data from the context",
      "evidence": ["specific data point 1", "specific data point 2"]
    }
  ]
}

Rules for the JSON:
- confidence must be exactly one of: "high", "medium", or "low"
- implied_probability must be a percentage string derived from the odds
- evidence must be an array of strings, each citing a specific fact from the context
- If data is insufficient for any recommendation, return: {"summary": "Insufficient data — only team names available. Check the sportsbook for current lines.", "bets": []}`;

  return {
    system: SYSTEM_PROMPT.text,
    userMessage: `Context:\n${formattedContext}\n\nUser question: ${userQuery}\n\n${outputInstruction}`,
    sections: {
      systemPrompt: SYSTEM_PROMPT.text,
      contextData: formattedContext,
      userInput: userQuery,
      outputFormat: outputInstruction,
    },
    version: SYSTEM_PROMPT.version,
  };
}

// 6.2 Output Validator — must be valid JSON with required fields (v2)
const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
function validateOutput(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON block found in response");
    const parsed = JSON.parse(match[0]);
    if (typeof parsed.summary !== "string") throw new Error("Missing summary");
    if (!Array.isArray(parsed.bets)) throw new Error("Missing bets array");
    for (const bet of parsed.bets) {
      if (!bet.market || !bet.selection || !bet.reason)
        throw new Error("Invalid bet structure: missing market/selection/reason");
      // v2 optional fields — normalise if present, default if absent
      if (bet.confidence && !VALID_CONFIDENCE.has(bet.confidence.toLowerCase()))
        bet.confidence = "low"; // coerce rather than reject
      if (bet.confidence) bet.confidence = bet.confidence.toLowerCase();
      if (!Array.isArray(bet.evidence)) bet.evidence = [];
    }
    return { valid: true, data: parsed };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

// POST /api/assistant/chat
// Body: { userQuery: string, events: ESPN_Event[], model?: string }
// Returns: SSE stream — keepalive comments every 5s, then a single "data:" JSON event
// This prevents Render's 30-second proxy timeout from killing slow model calls.
app.post("/api/assistant/chat", async (req, res) => {
  const { userQuery, events = [], model: reqModel } = req.body;
  if (!userQuery?.trim()) {
    res.status(400).json({ error: "userQuery is required" });
    return;
  }

  const model = ALLOWED_MODELS.has(reqModel) ? reqModel : DEFAULT_MODEL;
  const startTime = Date.now();
  const formattedContext = formatContext(events);
  const { system, userMessage, sections, version } = buildPrompt(
    userQuery,
    formattedContext
  );

  // SSE setup — keeps Render's 30s proxy alive indefinitely
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Ping every 5s so the proxy doesn't close the connection
  const keepalive = setInterval(() => {
    res.write(":keepalive\n\n");
  }, 5000);

  const finish = (payload) => {
    clearInterval(keepalive);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
    res.end();
  };

  let lastError = null;

  // Fallback: retry once on invalid output
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Prompt caching on the static system prompt (saves tokens on repeated calls)
      const response = await client.messages.create({
        model,
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: system,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [{ role: "user", content: userMessage }],
      });

      const latency = Date.now() - startTime;
      const rawText =
        response.content.find((b) => b.type === "text")?.text || "";
      const validation = validateOutput(rawText);

      // 8. Logging
      const log = {
        prompt_size_tokens: response.usage.input_tokens,
        response_size_tokens: response.usage.output_tokens,
        cache_read_tokens: response.usage.cache_read_input_tokens || 0,
        cache_write_tokens: response.usage.cache_creation_input_tokens || 0,
        model: response.model,
        model_requested: model,
        latency_ms: latency,
        success: validation.valid,
        prompt_version: version,
        attempt,
      };

      console.log("[ASSISTANT]", JSON.stringify(log));

      // retry if invalid and we have attempts left
      if (!validation.valid && attempt < 2) {
        lastError = validation.error;
        continue;
      }

      return finish({
        result: validation.valid
          ? validation.data
          : {
              summary:
                "Could not generate a valid recommendation. Please try again.",
              bets: [],
            },
        raw: rawText,
        log,
        // Debug payload — exposes the 4 prompt sections for the AI PM demo UI
        debug: { sections, version },
      });
    } catch (err) {
      lastError = err.message;
      if (attempt >= 2) break;
    }
  }

  return finish({ error: "Failed after 2 attempts", detail: lastError });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Betting assistant running at http://localhost:${PORT}`);
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING");
});
