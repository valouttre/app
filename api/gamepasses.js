export default async function handler(req, res) {

  const userId = req.query.userId;

  try {

    const response = await fetch(
      `https://inventory.roblox.com/v1/users/${userId}/items/GamePass?limit=100`
    );

    const data = await response.json();

    let passes = [];

    for (const item of data.data || []) {

      passes.push({
        id: item.id,
        name: item.name
      });

    }

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
