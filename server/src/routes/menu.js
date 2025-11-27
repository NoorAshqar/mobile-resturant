const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Addon = require("../models/Addon");

const router = express.Router();

// Get all menu items for admin's restaurant
router.get("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const menuItems = await MenuItem.find({ restaurant: restaurant._id })
      .populate("addons")
      .sort({ createdAt: -1 })
      .lean();

    const data = menuItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || (item.images && item.images.length > 0 ? item.images[0] : ""),
      images: item.images || (item.image ? [item.image] : []),
      category: item.category,
      popular: item.popular,
      vegetarian: item.vegetarian,
      available: item.available,
      addons: (item.addons || []).map((addon) => ({
        id: addon._id.toString(),
        name: addon.name,
        description: addon.description || "",
        price: addon.price,
        category: addon.category || "",
        available: addon.available,
      })),
    }));

    return res.json({ menuItems: data });
  } catch (error) {
    console.error("[MENU_LIST_ERROR]", error);
    return res.status(500).json({ message: "Failed to load menu items." });
  }
});

// Create a new menu item
router.post("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { name, description, price, image, images, category, popular, vegetarian, available, addons } = req.body ?? {};

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, description, price, and category are required.",
      });
    }

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const addonIds = Array.isArray(addons) ? addons.filter(Boolean) : [];
    const imageArray = Array.isArray(images) && images.length > 0 
      ? images.filter(Boolean)
      : (image ? [image.trim()] : []);

    if (imageArray.length === 0) {
      return res.status(400).json({
        message: "At least one image is required.",
      });
    }

    const menuItem = await MenuItem.create({
      restaurant: restaurant._id,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: imageArray[0],
      images: imageArray,
      category: category.trim(),
      popular: Boolean(popular),
      vegetarian: Boolean(vegetarian),
      available: available !== undefined ? Boolean(available) : true,
      addons: addonIds,
    });

    // Update restaurant's total menu items count
    await Restaurant.findByIdAndUpdate(restaurant._id, {
      $inc: { totalMenuItems: 1 },
    });

    await menuItem.populate("addons");

    const data = {
      id: menuItem._id.toString(),
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      image: menuItem.image || (menuItem.images && menuItem.images.length > 0 ? menuItem.images[0] : ""),
      images: menuItem.images || (menuItem.image ? [menuItem.image] : []),
      category: menuItem.category,
      popular: menuItem.popular,
      vegetarian: menuItem.vegetarian,
      available: menuItem.available,
      addons: (menuItem.addons || []).map((addon) => ({
        id: addon._id.toString(),
        name: addon.name,
        description: addon.description || "",
        price: addon.price,
        category: addon.category || "",
        available: addon.available,
      })),
    };

    return res.status(201).json({ menuItem: data });
  } catch (error) {
    console.error("[MENU_CREATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to create menu item." });
  }
});

// Update a menu item
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;
    const { name, description, price, image, images, category, popular, vegetarian, available, addons } = req.body ?? {};

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const menuItem = await MenuItem.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    if (name) menuItem.name = name.trim();
    if (description) menuItem.description = description.trim();
    if (price !== undefined) menuItem.price = parseFloat(price);
    if (images !== undefined) {
      const imageArray = Array.isArray(images) && images.length > 0 
        ? images.filter(Boolean)
        : (image ? [image.trim()] : []);
      if (imageArray.length > 0) {
        menuItem.images = imageArray;
        menuItem.image = imageArray[0];
      }
    } else if (image) {
      menuItem.image = image.trim();
      if (!menuItem.images || menuItem.images.length === 0) {
        menuItem.images = [image.trim()];
      } else {
        menuItem.images[0] = image.trim();
      }
    }
    if (category) menuItem.category = category.trim();
    if (popular !== undefined) menuItem.popular = Boolean(popular);
    if (vegetarian !== undefined) menuItem.vegetarian = Boolean(vegetarian);
    if (available !== undefined) menuItem.available = Boolean(available);
    if (addons !== undefined) {
      menuItem.addons = Array.isArray(addons) ? addons.filter(Boolean) : [];
    }

    await menuItem.save();
    await menuItem.populate("addons");

    const data = {
      id: menuItem._id.toString(),
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      image: menuItem.image || (menuItem.images && menuItem.images.length > 0 ? menuItem.images[0] : ""),
      images: menuItem.images || (menuItem.image ? [menuItem.image] : []),
      category: menuItem.category,
      popular: menuItem.popular,
      vegetarian: menuItem.vegetarian,
      available: menuItem.available,
      addons: (menuItem.addons || []).map((addon) => ({
        id: addon._id.toString(),
        name: addon.name,
        description: addon.description || "",
        price: addon.price,
        category: addon.category || "",
        available: addon.available,
      })),
    };

    return res.json({ menuItem: data });
  } catch (error) {
    console.error("[MENU_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update menu item." });
  }
});

// Delete a menu item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const menuItem = await MenuItem.findOneAndDelete({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // Update restaurant's total menu items count
    await Restaurant.findByIdAndUpdate(restaurant._id, {
      $inc: { totalMenuItems: -1 },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("[MENU_DELETE_ERROR]", error);
    return res.status(500).json({ message: "Failed to delete menu item." });
  }
});

module.exports = router;

