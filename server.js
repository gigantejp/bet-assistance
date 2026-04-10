require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(express.json());
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

// SportsBetting.ag links — for directing users to bet
const SB_URLS = {
  nba:    "https://www.sportsbetting.ag/sportsbook/basketball/nba",
  mlb:    "https://www.sportsbetting.ag/sportsbook/baseball/mlb",
  nhl:    "https://www.sportsbetting.ag/sportsbook/hockey/nhl",
  ufc:    "https://www.sportsbetting.ag/sportsbook/mma",
  soccer: "https://www.sportsbetting.ag/sportsbook/soccer",
  tennis: "https://www.sportsbetting.ag/sportsbook/tennis",
  nfl:    "https://www.sportsbetting.ag/sportsbook/football/nfl",
  golf:   "https://www.sportsbetting.ag/sportsbook/golf",
  boost:  "https://www.sportsbetting.ag/sportsbook/promotions",
  default:"https://www.sportsbetting.ag/sportsbook",
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

function buildPrompt(intent, espnData, userQuery) {
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
  return await client.messages.stream({
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

    const prompt = buildPrompt(intent, espnData, message);
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

// 3.3 Context Formatter — ESPN events → human-readable text
// PM Decision: compressed + readable → fewer tokens, better output
function formatContext(events = []) {
  if (!events.length) return "No events available.";

  const top = events.slice(0, 3); // max 3 events per spec
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
// Body: { userQuery: string, events: ESPN_Event[] }
// Returns: { result, raw, log, debug }
app.post("/api/assistant/chat", async (req, res) => {
  const { userQuery, events = [] } = req.body;
  if (!userQuery?.trim())
    return res.status(400).json({ error: "userQuery is required" });

  const startTime = Date.now();
  const formattedContext = formatContext(events);
  const { system, userMessage, sections, version } = buildPrompt(
    userQuery,
    formattedContext
  );

  let lastError = null;

  // 6.3 Fallback: retry once on invalid output
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Prompt caching on the static system prompt (saves tokens on repeated calls)
      const response = await client.messages.create({
        model: "claude-opus-4-6",
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

      return res.json({
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

  return res.status(500).json({
    error: "Failed after 2 attempts",
    detail: lastError,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Betting assistant running at http://localhost:${PORT}`);
  console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "loaded" : "MISSING");
});
