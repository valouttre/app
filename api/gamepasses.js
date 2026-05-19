export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    const gamesRes = await fetch(
      `https://develop.roproxy.com/v1/users/${userId}/games`,
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

    let passes = [];

    for (const game of games) {
      try {
        const passRes = await fetch(
          `https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=100`,
          { headers }
        );
        const passData = await passRes.json();

        for (const pass of passData.data || []) {
          try {
            const infoRes = await fetch(
              `https://apis.roproxy.com/game-passes/v1/game-passes/${pass.id}/product-info`,
              { headers }
            );
            const info = await infoRes.json();

            if (info.isForSale) {
              passes.push({
                id: pass.id,
                name: info.name,
                price: info.priceInRobux || 0,
                icon: info.iconImageAssetId,
                gameId: game.id,
                gameName: game.name
              });
            }
          } catch (_) {}
        }
      } catch (_) {}
    }

    return res.status(200).json({
      success: true,
      count: passes.length,
      data: passes
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
