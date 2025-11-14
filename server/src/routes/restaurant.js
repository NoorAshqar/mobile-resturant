const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

const allowedPalettes = ["sunset", "lagoon", "velvet"];
const allowedModes = ["light", "dark"];

function applyThemeSettings(restaurant, themePalette, themeMode) {
  let changed = false;
  if (themePalette && allowedPalettes.includes(themePalette)) {
    restaurant.themePalette = themePalette;
    changed = true;
  }
  if (themeMode && allowedModes.includes(themeMode)) {
    restaurant.themeMode = themeMode;
    changed = true;
  }

  return changed;
}

// Update restaurant details
router.put("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { name, cuisine, status, themePalette, themeMode } = req.body ?? {};

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    if (name) restaurant.name = name.trim();
    if (cuisine) restaurant.cuisine = cuisine.trim();
    if (status && ["active", "inactive"].includes(status)) {
      restaurant.status = status;
    }

    applyThemeSettings(restaurant, themePalette, themeMode);

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
      themePalette: restaurant.themePalette,
      themeMode: restaurant.themeMode,
    };

    return res.json({ restaurant: data });
  } catch (error) {
    console.error("[RESTAURANT_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update restaurant." });
  }
});

router.put("/theme", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { themePalette, themeMode } = req.body ?? {};

    if (!themePalette && !themeMode) {
      return res.status(400).json({ message: "No theme updates provided." });
    }

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const changed = applyThemeSettings(restaurant, themePalette, themeMode);

    if (!changed) {
      return res
        .status(400)
        .json({ message: "Invalid theme options provided." });
    }

    await restaurant.save();

    return res.json({
      themePalette: restaurant.themePalette,
      themeMode: restaurant.themeMode,
    });
  } catch (error) {
    console.error("[RESTAURANT_THEME_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update theme." });
  }
});

module.exports = router;

