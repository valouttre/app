export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    const passRes = await fetch(
      `https://games.roproxy.com/v1/games/7203997744/game-passes?limit=100`,
      { headers }
    );
    const passData = await passRes.json();

    return res.status(200).json({
      status: passRes.status,
      raw: passData
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
