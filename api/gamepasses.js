export default async function handler(req, res) {
  const userId = req.query.userId;

  try {
    let passes = [];
    let cursor = "";

    do {
      const url = `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100${cursor ? `&cursor=${cursor}` : ""}`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          // Roblox bloque les bots sans User-Agent
          "User-Agent": "Mozilla/5.0"
        }
      });

      // Si Roblox renvoie du HTML = inventaire privé ou bloqué
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return res.status(403).json({
          success: false,
          error: "Inventaire privé ou accès bloqué par Roblox."
        });
      }

      const data = await response.json();

      for (const item of data.data || []) {
        passes.push({ id: item.id, name: item.name });
      }

      cursor = data.nextPageCursor || "";
    } while (cursor);

    return res.status(200).json({
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
}
