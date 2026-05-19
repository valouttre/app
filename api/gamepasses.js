export default async function handler(req, res) {

  const userId = req.query.userId;

  try {

    // jeux publics du joueur
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`
    );

    const gamesData = await gamesResponse.json();

    let allPasses = [];

    for (const game of gamesData.data || []) {

      try {

        // ICI on utilise game.id = universeId
        const universeId = game.id;

        const passesResponse = await fetch(
          `https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`
        );

        const passesData = await passesResponse.json();

        for (const pass of passesData.data || []) {

          allPasses.push({
            id: pass.id,
            name: pass.name,
            price: pass.price
          });

        }

      } catch (e) {}

    }

    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).json({
      success: true,
      count: allPasses.length,
      data: allPasses
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

}
