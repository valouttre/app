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

    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );

    const games = gamesRes.data.data || [];

    let passes = [];

    await Promise.all(
      games.map(async (game) => {

        try {

          const passRes = await axios.get(
            `https://games.roblox.com/v1/games/${game.id}/game-passes`
          );

          const gamepasses = passRes.data.data || [];

          for (const pass of gamepasses) {

            if (!pass.price || pass.price <= 0) continue;

            passes.push({
              id: pass.id,
              name: pass.name,
              price: pass.price,
              icon: pass.iconImageAssetId || null,
              gameId: game.id,
              gameName: game.name
            });

          }

        } catch (err) {
          console.log(`Erreur ${game.id}:`, err.message);
        }

      })
    );

    passes.sort((a, b) => a.price - b.price);

    res.json({
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

});

app.get('/', (req, res) => {
  res.send('Roblox Donation API online');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
