const dotenv = require("dotenv");
dotenv.config();

async function fetchSports() {
  const res = await fetch(`https://api.the-odds-api.com/v4/sports?apiKey=${process.env.ODDSAPI_API_KEY}`);
  const data = await res.json();
  console.log(data.slice(0, 5));
}
fetchSports().catch(console.error);
