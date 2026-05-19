import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/gamepasses', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, error: "userId requis" });
  }

  try {
    // Étape 1 : Jeux publics du joueur
    const gamesRes = await axios.get(
      `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const games = gamesRes.data.data || [];

    if (games.length === 0) {
      return res.json({ success: false, error: "Aucun jeu public trouvé." });
    }

    let passes = [];

    // Étape 2 : Game passes de chaque jeu
    for (const game of games) {
      try {
        const passRes = await axios.get(
          `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes/creator`,
          {
            headers: {
              "x-api-key": process.env.ROBLOX_API_KEY
            }
          }
        );

        for (const pass of passRes.data.gamePasses || []) {
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

    return res.json({ success: true, count: passes.length, data: passes });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
