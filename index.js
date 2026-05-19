import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/gamepasses', async (req, res) => {

  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId requis'
    });
  }

  try {

    // Jeux publics
    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );

    const games = gamesRes.data.data || [];

    let passes = [];

    await Promise.all(

      games.map(async (game) => {

        try {

          const passRes = await axios.get(
            `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes?passView=Full&pageSize=100`
          );

          const gamepasses = passRes.data.gamePasses || [];

          for (const pass of gamepasses) {

            if (!pass.price || pass.price <= 0) continue;

            passes.push({
              id: pass.id,
              productId: pass.productId,
              name: pass.displayName || pass.name,
              price: pass.price,
              creator: pass.creator?.name || null,
              creatorId: pass.creator?.creatorId || null,
              gameId: game.id,
              gameName: game.name
            });

          }

        } catch (err) {

          console.log(
            `Erreur game ${game.id}:`,
            err.response?.status || err.message
          );

        }

      })

    );

    // Retire doublons
    passes = passes.filter(
      (pass, index, self) =>
        index === self.findIndex(p => p.id === pass.id)
    );

    // Tri prix
    passes.sort((a, b) => a.price - b.price);

    return res.json({
      success: true,
      count: passes.length,
      data: passes
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

app.get('/', (req, res) => {
  res.send('Roblox Donation API online');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
