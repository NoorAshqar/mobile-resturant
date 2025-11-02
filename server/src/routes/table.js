const express = require("express");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");

const router = express.Router();

// Get all tables for admin's restaurant
router.get("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const tables = await Table.find({ restaurant: restaurant._id })
      .sort({ number: 1 })
      .lean();

    const data = tables.map((table) => ({
      id: table._id.toString(),
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
    }));

    return res.json({ tables: data });
  } catch (error) {
    console.error("[TABLE_LIST_ERROR]", error);
    return res.status(500).json({ message: "Failed to load tables." });
  }
});

// Create a new table
router.post("/", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { number, capacity, status, location } = req.body ?? {};

    if (!number || !capacity) {
      return res.status(400).json({
        message: "Table number and capacity are required.",
      });
    }

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Check if table number already exists for this restaurant
    const existingTable = await Table.findOne({
      restaurant: restaurant._id,
      number: parseInt(number),
    });

    if (existingTable) {
      return res.status(400).json({
        message: "Table number already exists for this restaurant.",
      });
    }

    const table = await Table.create({
      restaurant: restaurant._id,
      number: parseInt(number),
      capacity: parseInt(capacity),
      status: status && ["available", "occupied", "reserved", "out_of_order"].includes(status)
        ? status
        : "available",
      location: location ? location.trim() : "",
    });

    const data = {
      id: table._id.toString(),
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
    };

    return res.status(201).json({ table: data });
  } catch (error) {
    console.error("[TABLE_CREATE_ERROR]", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Table number already exists for this restaurant.",
      });
    }
    return res.status(500).json({ message: "Failed to create table." });
  }
});

// Update a table
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;
    const { number, capacity, status, location } = req.body ?? {};

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const table = await Table.findOne({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    if (number !== undefined) {
      const numValue = parseInt(number);
      // Check if new number conflicts with existing table
      if (numValue !== table.number) {
        const existingTable = await Table.findOne({
          restaurant: restaurant._id,
          number: numValue,
        });
        if (existingTable) {
          return res.status(400).json({
            message: "Table number already exists for this restaurant.",
          });
        }
      }
      table.number = numValue;
    }
    if (capacity !== undefined) table.capacity = parseInt(capacity);
    if (status && ["available", "occupied", "reserved", "out_of_order"].includes(status)) {
      table.status = status;
    }
    if (location !== undefined) table.location = location.trim();

    await table.save();

    const data = {
      id: table._id.toString(),
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      location: table.location,
    };

    return res.json({ table: data });
  } catch (error) {
    console.error("[TABLE_UPDATE_ERROR]", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Table number already exists for this restaurant.",
      });
    }
    return res.status(500).json({ message: "Failed to update table." });
  }
});

// Delete a table
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const adminId = req.admin.sub;
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({ admin: adminId });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const table = await Table.findOneAndDelete({
      _id: id,
      restaurant: restaurant._id,
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found." });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[TABLE_DELETE_ERROR]", error);
    return res.status(500).json({ message: "Failed to delete table." });
  }
});

module.exports = router;

