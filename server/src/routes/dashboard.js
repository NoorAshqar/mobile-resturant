const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().lean();

    const data = restaurants.map((restaurant) => ({
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
    }));

    return res.json({ restaurants: data });
  } catch (error) {
    console.error("[DASHBOARD_ERROR]", error);
    return res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

module.exports = router;
