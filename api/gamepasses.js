export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const userId = req.query.userId;
  const headers = { "Accept": "application/json", "User-Agent": "Mozilla/5.0" };

  try {
    // assetType=34 = Game Passes
    const urls = [
      `https://catalog.roproxy.com/v1/search/items/details?Category=1&assetType=34&CreatorTargetId=${userId}&CreatorType=User&limit=30`,
      `https://catalog.roproxy.com/v1/search/items/details?Category=2&CreatorTargetId=${userId}&CreatorType=User&limit=30`,
      `https://catalog.roproxy.com/v1/search/items?Category=1&assetType=34&CreatorTargetId=${userId}&CreatorType=User&limit=30`
    ];

    let results = [];
    for (const url of urls) {
      try {
        const r = await fetch(url, { headers });
        const text = await r.text();
        results.push({ url, status: r.status, body: text.slice(0, 500) });
      } catch (e) {
        results.push({ url, error: e.message });
      }
    }

    return res.status(200).json({ results });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
