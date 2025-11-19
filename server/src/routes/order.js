const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");
const Addon = require("../models/Addon");
const Order = require("../models/Order");

const router = express.Router();

const EDITABLE_STATUS = "building";
const LEGACY_ACTIVE_STATUS = "active";
const SUBMITTED_STATUS = "submitted";
const VIEWABLE_STATUSES = [
  EDITABLE_STATUS,
  SUBMITTED_STATUS,
  LEGACY_ACTIVE_STATUS,
];
const EDITABLE_QUERY_STATUSES = [EDITABLE_STATUS, LEGACY_ACTIVE_STATUS];
const NON_EDITABLE_VIEWABLE_STATUSES = VIEWABLE_STATUSES.filter(
  (status) => !EDITABLE_QUERY_STATUSES.includes(status),
);
const TAX_RATE = 0.1;

const allowedPaymentStatuses = ["unpaid", "pending", "paid", "failed"];
const allowedPaymentMethods = ["cash", "card", "lahza"];

function calculateTotals(order) {
  const subtotal = order.items.reduce((sum, item) => {
    const itemPrice = item.price * item.quantity;
    const addonsPrice = (item.addons || []).reduce(
      (addonSum, addon) => addonSum + addon.price * item.quantity,
      0,
    );
    return sum + itemPrice + addonsPrice;
  }, 0);
  order.subtotal = subtotal;
  order.tax = subtotal * TAX_RATE;
  order.total = order.subtotal + order.tax;
}

function formatOrderResponse(order, restaurant, table) {
  return {
    id: order._id.toString(),
    restaurant: {
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      themePalette: restaurant.themePalette,
      themeMode: restaurant.themeMode,
      paymentConfig: buildPaymentConfig(restaurant),
    },
    table: {
      id: table._id.toString(),
      number: table.number,
      capacity: table.capacity,
    },
    items: order.items.map((item) => {
      const addonsPrice = (item.addons || []).reduce(
        (sum, addon) => sum + addon.price,
        0,
      );
      const itemSubtotal = (item.price + addonsPrice) * item.quantity;
      return {
        id: item._id.toString(),
        menuItemId: item.menuItem.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        addons: (item.addons || []).map((addon) => ({
          id: addon.addon?.toString() || addon._id?.toString(),
          name: addon.name,
          price: addon.price,
        })),
        subtotal: itemSubtotal,
      };
    }),
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    status: order.status,
    paid: order.paid || false,
    paidAt: order.paidAt,
    payment: {
      method: order.paymentMethod ?? null,
      status: order.paymentStatus ?? "unpaid",
      reference: order.paymentReference ?? null,
    },
    createdAt: order.createdAt,
    submittedAt: order.submittedAt,
    sessionKey: order.sessionKey,
    updatedAt: order.updatedAt,
  };
}

function buildPaymentConfig(restaurant) {
  return {
    lahza: {
      publicKey: restaurant.paymentConfig?.lahza?.publicKey ?? null,
      currency: restaurant.paymentConfig?.lahza?.currency ?? "ILS",
    },
  };
}

function normalizeEditableStatus(order) {
  if (order && order.status === LEGACY_ACTIVE_STATUS) {
    order.status = EDITABLE_STATUS;
  }
}

function ensureSessionKey(order, defaultKey) {
  if (!order.sessionKey) {
    order.sessionKey = defaultKey ?? new Date().toISOString();
  }
}

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

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

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
      payment: {
        method: order.paymentMethod ?? null,
        status: order.paymentStatus ?? "unpaid",
        reference: order.paymentReference ?? null,
      },
    }));

    return res.json({ orders: data });
  } catch (error) {
    console.error("[ORDER_ADMIN_LIST_ERROR]", error);
    return res.status(500).json({ message: "Failed to load orders." });
  }
});

// Get orders by session key
router.get(
  "/:restaurantName/:tableNumber/session/:sessionKey",
  async (req, res) => {
    try {
      const { restaurantName, tableNumber, sessionKey } = req.params;

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

      const table = await Table.findOne({
        restaurant: restaurant._id,
        number: parseInt(tableNumber),
      });

      if (!table) {
        return res.status(404).json({ message: "Table not found." });
      }

      // Get all submitted unpaid orders for this session
      const orders = await Order.find({
        restaurant: restaurant._id,
        table: table._id,
        sessionKey: sessionKey,
        status: SUBMITTED_STATUS,
        paid: false,
      })
        .sort({ submittedAt: 1 })
        .lean();

      const formattedOrders = orders.map((order) => ({
        id: order._id.toString(),
        items: order.items.map((item) => {
          const addonsPrice = (item.addons || []).reduce(
            (sum, addon) => sum + addon.price,
            0,
          );
          const itemSubtotal = (item.price + addonsPrice) * item.quantity;
          return {
            id: item._id.toString(),
            menuItemId: item.menuItem.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            addons: (item.addons || []).map((addon) => ({
              id: addon.addon?.toString() || addon._id?.toString(),
              name: addon.name,
              price: addon.price,
            })),
            subtotal: itemSubtotal,
          };
        }),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        paid: order.paid,
        submittedAt: order.submittedAt,
        createdAt: order.createdAt,
      }));

      return res.json({ orders: formattedOrders });
    } catch (error) {
      console.error("[ORDER_SESSION_ERROR]", error);
      return res
        .status(500)
        .json({ message: "Failed to load session orders." });
    }
  },
);

// Get order history for a table (all submitted unpaid orders grouped by session)
router.get("/:restaurantName/:tableNumber/history", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;

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

    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    // Get all submitted unpaid orders for this table
    const orders = await Order.find({
      restaurant: restaurant._id,
      table: table._id,
      status: SUBMITTED_STATUS,
      paid: false,
    })
      .sort({ submittedAt: -1 })
      .lean();

    // Group orders by sessionKey
    const sessionMap = new Map();

    orders.forEach((order) => {
      const key = order.sessionKey || "unknown";
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          sessionKey: key,
          orders: [],
          totalAmount: 0,
          firstSubmittedAt: order.submittedAt,
          lastSubmittedAt: order.submittedAt,
        });
      }

      const session = sessionMap.get(key);
      session.orders.push({
        id: order._id.toString(),
        items: order.items.map((item) => {
          const addonsPrice = (item.addons || []).reduce(
            (sum, addon) => sum + addon.price,
            0,
          );
          const itemSubtotal = (item.price + addonsPrice) * item.quantity;
          return {
            id: item._id.toString(),
            menuItemId: item.menuItem.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            addons: (item.addons || []).map((addon) => ({
              id: addon.addon?.toString() || addon._id?.toString(),
              name: addon.name,
              price: addon.price,
            })),
            subtotal: itemSubtotal,
          };
        }),
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        status: order.status,
        paid: order.paid,
        submittedAt: order.submittedAt,
        createdAt: order.createdAt,
      });

      session.totalAmount += order.total;

      if (order.submittedAt < session.firstSubmittedAt) {
        session.firstSubmittedAt = order.submittedAt;
      }
      if (order.submittedAt > session.lastSubmittedAt) {
        session.lastSubmittedAt = order.submittedAt;
      }
    });

    // Convert map to array and sort by most recent session
    const sessions = Array.from(sessionMap.values()).sort(
      (a, b) => new Date(b.lastSubmittedAt) - new Date(a.lastSubmittedAt),
    );

    // Calculate grand total
    const grandTotal = sessions.reduce(
      (sum, session) => sum + session.totalAmount,
      0,
    );

    return res.json({
      sessions,
      grandTotal,
      orderCount: orders.length,
    });
  } catch (error) {
    console.error("[ORDER_HISTORY_ERROR]", error);
    return res.status(500).json({ message: "Failed to load order history." });
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

    // Always look for or create a "building" order
    let order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: { $in: EDITABLE_QUERY_STATUSES },
    }).populate("items.menuItem");

    // If no building order exists, create a new one
    if (!order) {
      // Check if there are any recent submitted orders to use the same sessionKey
      const recentSubmittedOrder = await Order.findOne({
        restaurant: restaurant._id,
        table: table._id,
        status: SUBMITTED_STATUS,
        paid: false,
      })
        .sort({ submittedAt: -1 })
        .lean();

      const sessionKey =
        recentSubmittedOrder?.sessionKey || new Date().toISOString();

      order = await Order.create({
        restaurant: restaurant._id,
        table: table._id,
        tableNumber: table.number,
        items: [],
        sessionKey: sessionKey,
      });
    } else {
      normalizeEditableStatus(order);
      ensureSessionKey(order);
      calculateTotals(order);
      await order.save();
    }

    return res.json({
      order: formatOrderResponse(order, restaurant, table),
    });
  } catch (error) {
    console.error("[ORDER_GET_ERROR]", error);
    return res.status(500).json({ message: "Failed to load order." });
  }
});

// Add item to order
router.post("/:restaurantName/:tableNumber/items", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;
    const { menuItemId, quantity = 1, addonIds = [] } = req.body ?? {};

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
      return res
        .status(404)
        .json({ message: "Menu item not found or unavailable." });
    }

    // Fetch addons if provided
    let selectedAddons = [];
    if (Array.isArray(addonIds) && addonIds.length > 0) {
      selectedAddons = await Addon.find({
        _id: { $in: addonIds },
        restaurant: restaurant._id,
        available: true,
      }).lean();
    }

    // Find or create editable order
    let order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: { $in: EDITABLE_QUERY_STATUSES },
    });

    if (!order) {
      const latestSubmitted = await Order.findOne({
        restaurant: restaurant._id,
        table: table._id,
        status: SUBMITTED_STATUS,
      })
        .sort({ submittedAt: -1, updatedAt: -1 })
        .lean();

      const sessionKeyCandidate =
        latestSubmitted?.sessionKey ??
        latestSubmitted?.submittedAt?.toISOString() ??
        new Date().toISOString();

      order = await Order.create({
        restaurant: restaurant._id,
        table: table._id,
        tableNumber: table.number,
        items: [],
        sessionKey: sessionKeyCandidate,
      });
    } else {
      normalizeEditableStatus(order);
      ensureSessionKey(order);
    }

    // Check if item already exists in order with same addons
    // For simplicity, we'll add as a new item if addons differ
    const addonIdsString = selectedAddons.map((a) => a._id.toString()).sort().join(",");
    const existingItemIndex = order.items.findIndex((item) => {
      const itemAddonIds = (item.addons || [])
        .map((a) => a.addon?.toString() || a._id?.toString())
        .sort()
        .join(",");
      return (
        item.menuItem.toString() === menuItemId &&
        itemAddonIds === addonIdsString
      );
    });

    const addonsForItem = selectedAddons.map((addon) => ({
      addon: addon._id,
      name: addon.name,
      price: addon.price,
    }));

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
        addons: addonsForItem,
      });
    }

    calculateTotals(order);
    ensureSessionKey(order);
    await order.save();

    return res.json({
      order: formatOrderResponse(order, restaurant, table),
    });
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
      status: { $in: EDITABLE_QUERY_STATUSES },
    });

    if (!order) {
      const submittedExists = await Order.exists({
        restaurant: restaurant._id,
        table: table._id,
        status: SUBMITTED_STATUS,
      });
      if (submittedExists) {
        return res
          .status(409)
          .json({ message: "Order has already been submitted." });
      }
      return res.status(404).json({ message: "Order not found." });
    }

    normalizeEditableStatus(order);

    // Find item
    const itemIndex = order.items.findIndex(
      (item) => item._id.toString() === itemId,
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

    calculateTotals(order);
    await order.save();

    return res.json({
      order: formatOrderResponse(order, restaurant, table),
    });
  } catch (error) {
    console.error("[ORDER_UPDATE_ITEM_ERROR]", error);
    return res.status(500).json({ message: "Failed to update item in order." });
  }
});

// Remove item from order
router.delete(
  "/:restaurantName/:tableNumber/items/:itemId",
  async (req, res) => {
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
        status: { $in: EDITABLE_QUERY_STATUSES },
      });

      if (!order) {
        const submittedExists = await Order.exists({
          restaurant: restaurant._id,
          table: table._id,
          status: SUBMITTED_STATUS,
        });
        if (submittedExists) {
          return res
            .status(409)
            .json({ message: "Order has already been submitted." });
        }
        return res.status(404).json({ message: "Order not found." });
      }

      normalizeEditableStatus(order);

      // Remove item
      order.items = order.items.filter(
        (item) => item._id.toString() !== itemId,
      );

      calculateTotals(order);
      await order.save();

      return res.json({
        order: formatOrderResponse(order, restaurant, table),
      });
    } catch (error) {
      console.error("[ORDER_REMOVE_ITEM_ERROR]", error);
      return res
        .status(500)
        .json({ message: "Failed to remove item from order." });
    }
  },
);

router.post("/:restaurantName/:tableNumber/submit", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;

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

    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    const order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: { $in: EDITABLE_QUERY_STATUSES },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "No open order found to submit." });
    }

    normalizeEditableStatus(order);

    if (order.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Add at least one item before submitting." });
    }

    calculateTotals(order);
    ensureSessionKey(order);
    order.status = SUBMITTED_STATUS;
    order.submittedAt = new Date();
    await order.save();

    return res.json({
      order: formatOrderResponse(order, restaurant, table),
    });
  } catch (error) {
    console.error("[ORDER_SUBMIT_ERROR]", error);
    return res.status(500).json({ message: "Failed to submit order." });
  }
});

router.patch("/:restaurantName/:tableNumber/payment", async (req, res) => {
  try {
    const { restaurantName, tableNumber } = req.params;
    const { status, method, reference, metadata } = req.body ?? {};

    if (
      status === undefined &&
      method === undefined &&
      reference === undefined &&
      metadata === undefined
    ) {
      return res.status(400).json({ message: "No payment updates provided." });
    }

    if (status && !allowedPaymentStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status." });
    }

    if (method && !allowedPaymentMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    const restaurant = await Restaurant.findOne({
      $or: [
        { slug: restaurantName.toLowerCase() },
        { name: { $regex: new RegExp(`^${restaurantName}$`, "i") } },
      ],
      status: "active",
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const table = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(tableNumber),
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    const order = await Order.findOne({
      restaurant: restaurant._id,
      table: table._id,
      status: { $in: VIEWABLE_STATUSES },
    }).sort({ updatedAt: -1 });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (method) {
      order.paymentMethod = method;
    }

    if (status) {
      order.paymentStatus = status;
      if (status === "paid") {
        order.paid = true;
        order.paidAt = new Date();
        if (order.status === EDITABLE_STATUS) {
          order.status = SUBMITTED_STATUS;
        }
      }
      if (status === "failed") {
        order.paid = false;
      }
    }

    if (reference) {
      order.paymentReference = reference;
    }

    if (metadata && typeof metadata === "object") {
      order.paymentMetadata = metadata;
    }

    await order.save();

    return res.json({
      order: formatOrderResponse(order, restaurant, table),
    });
  } catch (error) {
    console.error("[ORDER_PAYMENT_UPDATE_ERROR]", error);
    return res.status(500).json({ message: "Failed to update payment state." });
  }
});

module.exports = router;

// patch route will be inserted before module exports
