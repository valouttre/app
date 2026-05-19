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

    if (games.length === 0) {
      return res.json({ success: false, error: "Aucun jeu trouvé", debug: gamesRes.data });
    }

    let debug = [];

    for (const game of games) {
      try {
        const passRes = await axios.get(
          `https://apis.roblox.com/game-passes/v1/universes/${game.id}/game-passes/creator`
        );
        debug.push({
          gameName: game.name,
          gameId: game.id,
          status: passRes.status,
          raw: passRes.data
        });
      } catch (e) {
        debug.push({
          gameName: game.name,
          gameId: game.id,
          error: e.message,
          status: e.response?.status,
          raw: e.response?.data
        });
      }
    }

    res.json({ games_found: games.length, debug });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log('running'));
