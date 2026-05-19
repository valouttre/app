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

    // Jeux publics du joueur
    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );

    const games = gamesRes.data.data || [];

    if (games.length === 0) {
      return res.json({
        success: false,
        error: 'Aucun jeu public trouvé'
      });
    }

    let passes = [];

    // Récupération des gamepasses
    await Promise.all(
      games.map(async (game) => {
        try {

          const passRes = await axios.get(
            `https://games.roblox.com/v1/games/${game.id}/game-passes`
          );

          const gamepasses = passRes.data.data || [];

          for (const pass of gamepasses) {

            // Ignore les passes sans prix
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

          console.log(
            `Erreur game ${game.id}:`,
            err.response?.status || err.message
          );

        }
      })
    );

    // Suppression doublons
    passes = passes.filter(
      (pass, index, self) =>
        index === self.findIndex(p => p.id === pass.id)
    );

    // Tri par prix
    passes.sort((a, b) => a.price - b.price);

    return res.json({
      success: true,
      count: passes.length,
      data: passes
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });

  }
});

app.get('/', (req, res) => {
  res.send('Roblox Donation API running');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
