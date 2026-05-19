export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };
  const universeId = "118800055955158";

  try {
    const urls = [
      `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`,
      `https://gamepasses.roproxy.com/v1/games/${universeId}/game-passes?limit=100`,
      `https://api.roproxy.com/v1/games/${universeId}/game-passes?limit=100`,
      `https://games.rbxapi.com/v1/games/${universeId}/game-passes?limit=100`,
    ];

    let results = [];
    for (const url of urls) {
      try {
        const r = await fetch(url, { headers });
        const text = await r.text();
        results.push({ url, status: r.status, body: text.slice(0, 300) });
      } catch (e) {
        results.push({ url, error: e.message });
      }
    }

    return res.status(200).json({ results });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
