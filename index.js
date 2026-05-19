import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/gamepasses', async (req, res) => {
  const userId = req.query.userId;
  try {
    const gamesRes = await axios.get(
      `https://games.roproxy.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const games = gamesRes.data.data || [];
    let passes = [];

    for (const game of games) {
      try {
        const passRes = await axios.get(
          `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes/creator`
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

    res.json({ success: true, count: passes.length, data: passes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('running'));
