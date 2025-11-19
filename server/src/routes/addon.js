const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const Addon = require("../models/Addon");

const router = express.Router();

// Get all addons for admin's restaurant
router.get("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const addons = await Addon.find({ restaurant: restaurant._id })
      .sort({ createdAt: -1 })
      .lean();

    const data = addons.map((addon) => ({
      id: addon._id.toString(),
      name: addon.name,
      description: addon.description || "",
      price: addon.price,
      category: addon.category || "",
      available: addon.available,
    }));

    return res.json({ addons: data });
  } catch (error) {
    console.error("[ADDON_LIST_ERROR]", error);
    return res.status(500).json({ message: "Failed to load addons." });
  }
});

// Create a new addon
router.post("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { name, description, price, category, available } = req.body ?? {};

    if (!name || price === undefined) {
      return res.status(400).json({
        message: "Name and price are required.",
      });
    }

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const addon = await Addon.create({
      restaurant: restaurant._id,
      name: name.trim(),
      description: description ? description.trim() : "",
      price: parseFloat(price),
      category: category ? category.trim() : "",
      available: available !== undefined ? Boolean(available) : true,
    });

    const data = {
      id: addon._id.toString(),
      name: addon.name,
      description: addon.description || "",
      price: addon.price,
      category: addon.category || "",
      available: addon.available,
    };

    return res.status(201).json({ addon: data });
  } catch (error) {
    console.error("[ADDON_CREATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to create addon." });
  }
});

// Update an addon
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;
    const { name, description, price, category, available } = req.body ?? {};

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const addon = await Addon.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!addon) {
      return res.status(404).json({ message: "Addon not found." });
    }

    if (name) addon.name = name.trim();
    if (description !== undefined) addon.description = description.trim();
    if (price !== undefined) addon.price = parseFloat(price);
    if (category !== undefined) addon.category = category.trim();
    if (available !== undefined) addon.available = Boolean(available);

    await addon.save();

    const data = {
      id: addon._id.toString(),
      name: addon.name,
      description: addon.description || "",
      price: addon.price,
      category: addon.category || "",
      available: addon.available,
    };

    return res.json({ addon: data });
  } catch (error) {
    console.error("[ADDON_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update addon." });
  }
});

// Delete an addon
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const addon = await Addon.findOneAndDelete({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!addon) {
      return res.status(404).json({ message: "Addon not found." });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[ADDON_DELETE_ERROR]", error);
    return res.status(500).json({ message: "Failed to delete addon." });
  }
});

module.exports = router;

