export default async function handler(req, res) {

    const userId = req.query.userId;

    try {

        const response = await fetch(
            `https://catalog.roblox.com/v1/search/items/details?Category=1&Subcategory=7&CreatorTargetId=${userId}&CreatorType=User`
        );

        const data = await response.json();

        res.setHeader("Access-Control-Allow-Origin", "*");

        res.status(200).json(data);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

}
