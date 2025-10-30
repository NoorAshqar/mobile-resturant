const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId }).lean();

    if (!restaurant) {
      return res.json({ restaurant: null });
    }

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
    console.error("[DASHBOARD_ERROR]", error);
    return res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

router.post("/restaurant", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { name, cuisine } = req.body ?? {};

    if (!name || !cuisine) {
      return res
        .status(400)
        .json({ message: "Name and cuisine are required." });
    }

    const existingRestaurant = await Restaurant.findOne({ admin: adminId });

    if (existingRestaurant) {
      return res
        .status(409)
        .json({ message: "You already have a restaurant." });
    }

    const restaurant = await Restaurant.create({
      admin: adminId,
      name: name.trim(),
      cuisine: cuisine.trim(),
    });

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

    return res.status(201).json({ restaurant: data });
  } catch (error) {
    console.error("[RESTAURANT_CREATE_ERROR]", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "You already have a restaurant." });
    }
    return res.status(500).json({ message: "Failed to create restaurant." });
  }
});

module.exports = router;
