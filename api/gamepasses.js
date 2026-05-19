export default async function handler(req, res) {

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            error: "Missing userId"
        });
    }

    try {

        const response = await fetch(
            `https://catalog.roblox.com/v1/search/items/details?Category=3&CreatorTargetId=${userId}&CreatorType=User`
        );

        const data = await response.json();

        res.setHeader("Access-Control-Allow-Origin", "*");

        return res.status(200).json(data);

    } catch (err) {

        return res.status(500).json({
            error: err.message
        });

    }

}
