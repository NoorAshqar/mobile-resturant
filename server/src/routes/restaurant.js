const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

// Update restaurant details
router.put("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { name, cuisine, status } = req.body ?? {};

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    if (name) restaurant.name = name.trim();
    if (cuisine) restaurant.cuisine = cuisine.trim();
    if (status && ["active", "inactive"].includes(status)) {
      restaurant.status = status;
    }

    await restaurant.save();

    const data = {
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      status: restaurant.status,
      todayOrders: restaurant.todayOrders,
      todayRevenue: restaurant.todayRevenue,
      totalMenuItems: restaurant.totalMenuItems,
      rating: restaurant.rating,
      trend: restaurant.trend,
      trendPercentage: restaurant.trendPercentage,
    };

    return res.json({ restaurant: data });
  } catch (error) {
    console.error("[RESTAURANT_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update restaurant." });
  }
});

module.exports = router;

