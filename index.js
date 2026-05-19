export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // Étape 1 : Jeux via roproxy v2
    const gamesRes = await fetch(
      `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=Public&limit=50`,
      { headers }
    );
    const gamesData = await gamesRes.json();
    const games = gamesData.data || [];

    if (games.length === 0) {
      return res.status(200).json({ success: false, error: "Aucun jeu public trouvé." });
    }

    let passes = [];

    for (const game of games) {
      try {
        // Étape 2 : Game passes via apis.roblox.com (fonctionne !)
        const passRes = await fetch(
          `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes/creator`,
          { headers }
        );
        const passData = await passRes.json();

        for (const pass of passData.gamePasses || []) {
          if (pass.isForSale) {
            passes.push({
              id: pass.gamePassId,
              name: pass.name,
              price: pass.priceInformation?.defaultPriceInRobux ?? null,
              icon: pass.iconAssetId,
              gameId: game.id,
              gameName: game.name
            });
          }
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
