export default async function handler(req, res) {

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({
            success: false,
            error: "Missing userId"
        });
    }

    try {

        const response = await fetch(
            `https://catalog.roblox.com/v1/search/items/details?Category=3&CreatorTargetId=${userId}&CreatorType=User&Limit=100`
        );

        const json = await response.json();

        const gamepasses = (json.data || []).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            productId: item.productId,
            image: item.thumbnail,
            forSale: item.priceStatus === "On Sale"
        }));

        res.setHeader("Access-Control-Allow-Origin", "*");

        return res.status(200).json({
            success: true,
            count: gamepasses.length,
            data: gamepasses
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

}
