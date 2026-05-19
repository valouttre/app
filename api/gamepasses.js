export default async function handler(req, res) {

  const userId = req.query.userId;

  try {

    // récupérer les jeux publics
    const gamesResponse = await fetch(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50&sortOrder=Asc`
    );

    const gamesData = await gamesResponse.json();

    let allPasses = [];

    for (const game of gamesData.data || []) {

      try {

        // récupérer les gamepass avec le universeId
        const passesResponse = await fetch(
          `https://games.roblox.com/v1/games/${game.rootPlace.id}/game-passes?limit=100`
        );

        const passesData = await passesResponse.json();

        for (const pass of passesData.data || []) {

          allPasses.push({
            id: pass.id,
            name: pass.name,
            price: pass.price
          });

        }

      } catch (e) {
        console.log(e);
      }

    }

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
