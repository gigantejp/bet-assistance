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
function detect(q) {
  const match = patterns.find(([, pattern]) => pattern.test(q));
  return match ? match[0] : null;
}
console.log(detect("tell me waht is the best soccer game to bet"));
console.log(detect("what is the best soccer game?"));
console.log(detect("soccer"));
