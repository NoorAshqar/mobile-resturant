const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");

const router = express.Router();

const allowedPalettes = ["sunset", "lagoon", "velvet"];
const allowedModes = ["light", "dark"];

const slugify = (value = "") =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

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

    const {
      name,
      cuisine,
      status,
      themePalette,
      themeMode,
      paymentConfig,
      lahza,
      flowConfig,
    } = req.body ?? {};

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

    const lahzaBody = paymentConfig?.lahza ?? lahza;
    if (lahzaBody) {
      restaurant.paymentConfig ??= {};
      restaurant.paymentConfig.lahza ??= {};

      if (typeof lahzaBody.publicKey === "string") {
        restaurant.paymentConfig.lahza.publicKey = lahzaBody.publicKey.trim();
      }
      if (typeof lahzaBody.currency === "string") {
        const normalized = lahzaBody.currency.trim().toUpperCase();
        if (normalized.length > 0) {
          restaurant.paymentConfig.lahza.currency = normalized;
        }
      }
      if (typeof lahzaBody.merchantId === "string") {
        restaurant.paymentConfig.lahza.merchantId = lahzaBody.merchantId.trim();
      }
    }

    if (flowConfig) {
      restaurant.flowConfig ??= {};
      if (typeof flowConfig.orderingEnabled === "boolean") {
        restaurant.flowConfig.orderingEnabled = flowConfig.orderingEnabled;
      }
      if (typeof flowConfig.paymentEnabled === "boolean") {
        restaurant.flowConfig.paymentEnabled = flowConfig.paymentEnabled;
      }
      if (typeof flowConfig.requirePaymentBeforeOrder === "boolean") {
        restaurant.flowConfig.requirePaymentBeforeOrder =
          flowConfig.requirePaymentBeforeOrder;
      }
      if (typeof flowConfig.tipsEnabled === "boolean") {
        restaurant.flowConfig.tipsEnabled = flowConfig.tipsEnabled;
      }
      if (Array.isArray(flowConfig.tipsPercentage)) {
        restaurant.flowConfig.tipsPercentage = flowConfig.tipsPercentage;
      }
    }

    if (!restaurant.slug && restaurant.name) {
      restaurant.slug = slugify(restaurant.name);
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
      themePalette: restaurant.themePalette,
      themeMode: restaurant.themeMode,
      paymentConfig: {
        lahza: {
          publicKey: restaurant.paymentConfig?.lahza?.publicKey ?? null,
          currency: restaurant.paymentConfig?.lahza?.currency ?? "ILS",
          merchantId: restaurant.paymentConfig?.lahza?.merchantId ?? null,
        },
      },
      flowConfig: {
        orderingEnabled: restaurant.flowConfig?.orderingEnabled ?? true,
        paymentEnabled: restaurant.flowConfig?.paymentEnabled ?? true,
        requirePaymentBeforeOrder:
          restaurant.flowConfig?.requirePaymentBeforeOrder ?? false,
        tipsEnabled: restaurant.flowConfig?.tipsEnabled ?? false,
        tipsPercentage: restaurant.flowConfig?.tipsPercentage ?? [10, 15, 20],
      },
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

