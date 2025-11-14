const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");

const router = express.Router();

// Get all orders for admin's restaurant
router.get("/admin/list", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { status } = req.query;

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const query = { restaurant: restaurant._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const data = orders.map((order) => ({
      id: order._id.toString(),
      tableNumber: order.tableNumber,
      items: order.items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.json({ orders: data });
  } catch (error) {
    console.error("[ORDER_ADMIN_LIST_ERROR]", error);
    return res.status(500).json({ message: "Failed to load orders." });
  }
});

// Get order for a table (public endpoint) by restaurant slug or name
router.get("/:restaurantName/:tableNumber", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;

    // Find restaurant by slug or name (case insensitive)
    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: restaurantName.toLowerCase() },
        {
          name: { $regex: new RegExp(`^${restaurantName}$`, "i") },
        },
      ],
      status: "active",
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Find table by number for this restaurant
    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Find or create active order for this table
    let order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: "active",
    }).populate("items.menuItem");

    if (!order) {
      order = await Order.create({
        restaurant: restaurant._id,
        table: table._id,
        tableNumber: table.number,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });
    }

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    order.subtotal = subtotal;
    order.tax = tax;
    order.total = total;
    await order.save();

    const data = {
      id: order._id.toString(),
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
      },
      items: order.items.map((item) => ({
        id: item._id.toString(),
        menuItemId: item.menuItem.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.json({ order: data });
  } catch (error) {
    console.error("[ORDER_GET_ERROR]", error);
    return res.status(500).json({ message: "Failed to load order." });
  }
});

// Add item to order
router.post("/:restaurantName/:tableNumber/items", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;
    const { menuItemId, quantity = 1 } = req.body ?? {};

    if (!menuItemId) {
      return res.status(400).json({ message: "Menu item ID is required." });
    }

    // Find restaurant by slug or name
    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: restaurantName.toLowerCase() },
        {
          name: { $regex: new RegExp(`^${restaurantName}$`, "i") },
        },
      ],
      status: "active",
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Find table
    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Find menu item
    const menuItem = await MenuItem.findOne({
      _id: menuItemId,
      restaurant: restaurant._id,
      available: true,
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found or unavailable." });
    }

    // Find or create active order
    let order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: "active",
    });

    if (!order) {
      order = await Order.create({
        restaurant: restaurant._id,
        table: table._id,
        tableNumber: table.number,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      });
    }

    // Check if item already exists in order
    const existingItemIndex = order.items.findIndex(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      order.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      order.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: parseInt(quantity),
      });
    }

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    order.subtotal = subtotal;
    order.tax = tax;
    order.total = total;
    await order.save();

    const data = {
      id: order._id.toString(),
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
      },
      items: order.items.map((item) => ({
        id: item._id.toString(),
        menuItemId: item.menuItem.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.json({ order: data });
  } catch (error) {
    console.error("[ORDER_ADD_ITEM_ERROR]", error);
    return res.status(500).json({ message: "Failed to add item to order." });
  }
});

// Update item quantity in order
router.put("/:restaurantName/:tableNumber/items/:itemId", async (req, res) => {
  try {
    const { restaurantName, tableNumber, itemId } = req.params;
    const { quantity } = req.body ?? {};

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ message: "Valid quantity is required." });
    }

    // Find restaurant by slug or name
    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: restaurantName.toLowerCase() },
        {
          name: { $regex: new RegExp(`^${restaurantName}$`, "i") },
        },
      ],
      status: "active",
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Find table
    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Find order
    const order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: "active",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find item
    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in order." });
    }

    if (parseInt(quantity) === 0) {
      // Remove item
      order.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      order.items[itemIndex].quantity = parseInt(quantity);
    }

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    order.subtotal = subtotal;
    order.tax = tax;
    order.total = total;
    await order.save();

    const data = {
      id: order._id.toString(),
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
      },
      items: order.items.map((item) => ({
        id: item._id.toString(),
        menuItemId: item.menuItem.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.json({ order: data });
  } catch (error) {
    console.error("[ORDER_UPDATE_ITEM_ERROR]", error);
    return res.status(500).json({ message: "Failed to update item in order." });
  }
});

// Remove item from order
router.delete("/:restaurantName/:tableNumber/items/:itemId", async (req, res) => {
  try {
    const { restaurantName, tableNumber, itemId } = req.params;

    // Find restaurant by slug or name
    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: restaurantName.toLowerCase() },
        {
          name: { $regex: new RegExp(`^${restaurantName}$`, "i") },
        },
      ],
      status: "active",
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Find table
    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Find order
    const order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: "active",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Remove item
    order.items = order.items.filter(
      (item) => item._id.toString() !== itemId
    );

    // Calculate totals
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    order.subtotal = subtotal;
    order.tax = tax;
    order.total = total;
    await order.save();

    const data = {
      id: order._id.toString(),
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      table: {
        id: table._id.toString(),
        number: table.number,
        capacity: table.capacity,
      },
      items: order.items.map((item) => ({
        id: item._id.toString(),
        menuItemId: item.menuItem.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return res.json({ order: data });
  } catch (error) {
    console.error("[ORDER_REMOVE_ITEM_ERROR]", error);
    return res.status(500).json({ message: "Failed to remove item from order." });
  }
});

module.exports = router;

