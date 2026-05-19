const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/gamepasses', async (req, res) => {
  const userId = req.query.userId;
  try {
    const gamesRes = await axios.get(
      `https://games.roblox.com/v2/users/${userId}/games?accessFilter=Public&limit=50`
    );
    const games = gamesRes.data.data || [];
    let passes = [];

    for (const game of games) {
      try {
        const passRes = await axios.get(
          `https://games.roblox.com/v1/games/${game.rootPlace.id}/game-passes?limit=100`
        );
        for (const pass of passRes.data.data || []) {
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
      } catch (_) {}
    }

    res.json({ success: true, count: passes.length, data: passes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('running'));
