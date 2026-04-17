const { Anthropic } = require("@anthropic-ai/sdk");
const dotenv = require("dotenv");
dotenv.config();
const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const ODDS_API_KEYS = {
  nba:        "basketball_nba",
  wnba:       "basketball_wnba",
  ncaam:      "basketball_ncaab",
  nfl:        "americanfootball_nfl",
  ncaaf:      "americanfootball_ncaaf",
  mlb:        "baseball_mlb",
  nhl:        "icehockey_nhl",
  ufc:        "mma_mixed_martial_arts",
  epl:        "soccer_england_premier_league",
  laliga:     "soccer_spain_la_liga",
  bundesliga: "soccer_germany_bundesliga",
  seriea:     "soccer_italy_serie_a",
  ligue1:     "soccer_france_ligue_one",
  mls:        "soccer_usa_mls",
  ucl:        "soccer_uefa_champs_league",
  uel:        "soccer_uefa_europa_league",
  generic_soccer: "soccer_england_premier_league",
  generic_basketball: "basketball_nba",
  generic_football: "americanfootball_nfl",
  generic_baseball: "baseball_mlb",
  generic_hockey: "icehockey_nhl",
  generic_tennis: "tennis_atp",
  generic_golf: "golf_pga_championship",
  generic_mma: "mma_mixed_martial_arts",
};
const AVAILABLE_SPORTS = Object.entries(ODDS_API_KEYS).map(([k, v]) => `- ${k} => ${v}`).join("\n");
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

AVAILABLE SPORT KEYS (for override):
${AVAILABLE_SPORTS}

RULES:
1. Block OFF_TOPIC and MANIPULATION (allowed:false). Allow all others.
2. The user will provide their query and their "Active Sport" context.
3. If the user explicitly asks for a sport or league that is fundamentally different from the Active Sport category, return the best matching Odds API key from the list above in the "explicit_sport_override" field.
4. If the user does not specify a sport, or their requested sport matches the Active Sport category (e.g. asking for "soccer" while on an Argentina soccer page), set "explicit_sport_override" to null.

{"intent":"...","allowed":true,"block_reason":null,"context_needed":"...","response_type":"...","explicit_sport_override":null}`;

async function run() {
  const userMessage = `Active Sport: americanfootball_ncaaf\nClassify: "what is the best soccer bet today?"`;
  const res = await anthropicClient.messages.create({
    model: "claude-3-haiku-20240307",
    system: GATE_SYSTEM,
    messages: [{ role: "user", content: userMessage }],
    max_tokens: 100,
    temperature: 0,
  });
  console.log(res.content[0].text);
}
run().catch(console.error);
