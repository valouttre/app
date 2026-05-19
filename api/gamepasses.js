export default async function handler(req, res) {

  const userId = req.query.userId;

  try {

    // récupérer les univers du joueur
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`
    );

    const gamesData = await gamesResponse.json();

    let passes = [];

    for (const game of gamesData.data || []) {

      const universeId = game.id;

      try {

        const passResponse = await fetch(
          `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`
        );

        const passData = await passResponse.json();

        for (const pass of passData.data || []) {

          passes.push({
            id: pass.id,
            name: pass.name,
            price: pass.price
          });

        }

      } catch {}

    }

    res.status(200).json({
      success: true,
      count: passes.length,
      data: passes
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

}
