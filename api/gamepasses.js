export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // Test avec 3 proxys différents
    const urls = [
      `https://games.roproxy.com/v1/users/${userId}/games?accessFilter=Public&limit=50`,
      `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=Public&limit=50`,
      `https://api.roblox.com/users/${userId}/games`
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
