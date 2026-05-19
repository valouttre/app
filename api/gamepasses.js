export default async function handler(req, res) {
  const userId = req.query.userId;
  try {
    const response = await fetch(
      `https://www.roblox.com/users/inventory/list-json?userId=${userId}&assetTypeId=34&itemsPerPage=100`
    );
    const data = await response.json();

    // Inventaire privé
    if (!data.isValid) {
      return res.status(403).json({
        success: false,
        error: "Inventaire privé ou utilisateur introuvable."
      });
    }

    const passes = (data.items || []).map(item => ({
      id: item.assetId,
      name: item.name
    }));

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
