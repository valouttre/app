export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    const gamesRes = await fetch(
      `https://games.roproxy.com/v1/users/${userId}/games?accessFilter=Public&limit=50`,
      { headers }
    );
    const gamesData = await gamesRes.json();
    const games = gamesData.data || [];

    if (games.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Aucun jeu trouvé.",
        debug: gamesData
      });
    }

    let debugPasses = [];

    for (const game of games) {
      const passRes = await fetch(
        `https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=100`,
        { headers }
      );
      const passData = await passRes.json();

      debugPasses.push({
        gameName: game.name,
        gameId: game.id,
        passStatus: passRes.status,
        passRaw: passData
      });
    }

    return res.status(200).json({
      success: true,
      games_found: games.length,
      debug_passes: debugPasses
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
