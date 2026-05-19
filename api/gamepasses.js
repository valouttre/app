-- ============================================================
--  PROXY NODE.JS - À héberger sur Replit, Glitch ou Vercel
--
--  Instructions:
--  1. Créez un compte sur https://replit.com (gratuit)
--  2. Créez un nouveau Repl "Node.js"
--  3. Copiez ce code dans index.js
--  4. Cliquez sur "Run"
--  5. Copiez l'URL du Repl (ex: https://votre-repl.votre-username.repl.co)
--  6. Ajoutez l'URL dans GamePassConfig.PROXY_URL
-- ============================================================

--[[
// ========== CODE NODE.JS À COPIER ==========

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Récupérer les game passes d'un utilisateur
app.get('/gamepasses', async (req, res) => {
    const userId = req.query.userId;
    
    if (!userId) {
        return res.status(400).json({ error: 'userId requis' });
    }
    
    try {
        // Étape 1: Récupérer les jeux de l'utilisateur
        const gamesResponse = await axios.get(
            `https://develop.roblox.com/v1/users/${userId}/games`
        );
        
        const games = gamesResponse.data.data || [];
        const allPasses = [];
        
        // Étape 2: Pour chaque jeu, récupérer les game passes
        for (const game of games) {
            try {
                const passesResponse = await axios.get(
                    `https://games.roblox.com/v1/games/${game.id}/game-passes`
                );
                
                const passes = passesResponse.data.data || [];
                
                for (const pass of passes) {
                    // Étape 3: Récupérer les infos détaillées de chaque pass
                    try {
                        const productResponse = await axios.get(
                            `https://apis.roblox.com/game-passes/v1/game-passes/${pass.id}/product-info`
                        );
                        
                        allPasses.push({
                            id: pass.id,
                            name: productResponse.data.name,
                            priceInRobux: productResponse.data.priceInRobux || 0,
                            iconImageAssetId: productResponse.data.iconImageAssetId,
                            isForSale: productResponse.data.isForSale || false
                        });
                    } catch (e) {
                        // Pass silencieusement si erreur sur un pass
                    }
                }
            } catch (e) {
                // Pass silencieusement si erreur sur un jeu
            }
        }
        
        res.json({ 
            success: true,
            data: allPasses,
            count: allPasses.length
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Route pour un pass individuel
app.get('/pass', async (req, res) => {
    const passId = req.query.passId;
    
    if (!passId) {
        return res.status(400).json({ error: 'passId requis' });
    }
    
    try {
        const response = await axios.get(
            `https://apis.roblox.com/game-passes/v1/game-passes/${passId}/product-info`
        );
        
        res.json({
            success: true,
            data: {
                id: passId,
                name: response.data.name,
                priceInRobux: response.data.priceInRobux || 0,
                iconImageAssetId: response.data.iconImageAssetId,
                isForSale: response.data.isForSale || false
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Route de test
app.get('/', (req, res) => {
    res.json({ 
        status: 'Proxy Roblox GamePass actif',
        usage: '/gamepasses?userId=VOTRE_USER_ID',
        routes: {
            '/gamepasses?userId=ID': 'Liste tous les game passes du joueur',
            '/pass?passId=ID': 'Infos d\'un pass spécifique'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});

// ========== FIN DU CODE NODE.JS ==========
--]]

return "Ce fichier contient le script Node.js à copier sur Replit"
