export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // Proxy au lieu de games.roblox.com
    const gamesRes = await fetch(
      `https://games.roproxy.com/v1/users/${userId}/games?accessFilter=Public&limit=50`,
      { headers }
    );
    const gamesData = await gamesRes.json();
    const games = gamesData.data || [];

    if (games.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Aucun jeu public trouvé."
      });
    }

    let passes = [];

    await Promise.all(
      games.map(async (game) => {
        const passRes = await fetch(
          `https://games.roproxy.com/v1/games/${game.id}/game-passes?limit=100`,
          { headers }
        );
        const passData = await passRes.json();

        for (const pass of passData.data || []) {
          if (pass.price) {
            passes.push({
              id: pass.id,
              name: pass.name,
              price: pass.price,
              gameId: game.id,
              gameName: game.name
            });
          }
        }
      })
    );

    return res.status(200).json({
      success: true,
      count: passes.length,
      data: passes
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
