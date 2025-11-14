const express = require("express");

const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

const router = express.Router();

// Get restaurant by slug or name (public endpoint)
router.get("/restaurant/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: name.toLowerCase() },
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
      ],
      status: "active",
    }).lean();

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const menuItems = await MenuItem.find({
      restaurant: restaurant._id,
      available: true,
    })
      .sort({ category: 1, name: 1 })
      .lean();

    const data = {
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      status: restaurant.status,
      rating: restaurant.rating,
      menuItems: menuItems.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        popular: item.popular,
        vegetarian: item.vegetarian,
      })),
    };

    return res.json({ restaurant: data });
  } catch (error) {
    console.error("[PUBLIC_RESTAURANT_ERROR]", error);
    return res.status(500).json({ message: "Failed to load restaurant." });
  }
});

module.exports = router;

