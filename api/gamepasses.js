export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Toujours en premier

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // Étape 1 : Jeux publics de l'utilisateur
    const gamesRes = await fetch(
      `https://games.roblox.com/v1/users/${userId}/games?accessFilter=Public&limit=50`,
      { headers }
    );
    const gamesData = await gamesRes.json();
    const games = gamesData.data || [];

    if (games.length === 0) {
      return res.status(200).json({
        success: false,
        error: "Aucun jeu public trouvé pour cet utilisateur."
      });
    }

    // Étape 2 : Game passes de chaque jeu
    let passes = [];

    await Promise.all(
      games.map(async (game) => {
        const passRes = await fetch(
          `https://games.roblox.com/v1/games/${game.id}/game-passes?limit=100`,
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
