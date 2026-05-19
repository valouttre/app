export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // Essai v1
    let gamesRes = await fetch(
      `https://games.roproxy.com/v1/users/${userId}/games?accessFilter=Public&limit=50`,
      { headers }
    );
    let gamesData = await gamesRes.json();
    let games = gamesData.data || [];

    // Fallback v2 si v1 vide
    if (games.length === 0) {
      gamesRes = await fetch(
        `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=Public&limit=50`,
        { headers }
      );
      gamesData = await gamesRes.json();
      games = gamesData.data || [];
    }

    // Debug — retire cette ligne une fois que ça marche
    if (games.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Aucun jeu public trouvé.",
        debug_v1: gamesData,
        debug_status: gamesRes.status
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
