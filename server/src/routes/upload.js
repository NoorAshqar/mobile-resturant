const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/auth");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

const router = express.Router();

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for product images: /upload/[restaurant_id]/[product_id]/img_name.png
const productStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const adminId = req.admin?.sub;
      if (!adminId) {
        return cb(new Error("Unauthorized"));
      }

      const restaurant = await Restaurant.findOne({ admin: adminId });
      if (!restaurant) {
        return cb(new Error("Restaurant not found"));
      }

      const restaurantId = restaurant._id.toString();
      const productId = req.body.productId || req.params.productId || "temp";

      const productDir = path.join(uploadsDir, restaurantId, productId);
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }

      cb(null, productDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, "").replace(/[^a-z0-9]/gi, "-").toLowerCase();
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// Configure storage for restaurant logos: /upload/[restaurant_id]/logo.png
const restaurantStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const adminId = req.admin?.sub;
      if (!adminId) {
        return cb(new Error("Unauthorized"));
      }

      const restaurant = await Restaurant.findOne({ admin: adminId });
      if (!restaurant) {
        return cb(new Error("Restaurant not found"));
      }

      const restaurantId = restaurant._id.toString();
      const restaurantDir = path.join(uploadsDir, restaurantId);
      if (!fs.existsSync(restaurantDir)) {
        fs.mkdirSync(restaurantDir, { recursive: true });
      }

      cb(null, restaurantDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, "").replace(/[^a-z0-9]/gi, "-").toLowerCase();
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."), false);
  }
};

// Create multer instances
const uploadProduct = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const uploadRestaurant = multer({
  storage: restaurantStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Upload product image (single - for backward compatibility)
router.post("/product", authMiddleware, uploadProduct.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });
    if (!restaurant) {
      // Clean up uploaded file if restaurant not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurantId = restaurant._id.toString();
    const productId = req.body.productId;

    // If productId is provided and it's not "temp", move file to correct location
    if (productId && productId !== "temp") {
      const oldPath = req.file.path;
      const newDir = path.join(uploadsDir, restaurantId, productId);
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      const newPath = path.join(newDir, req.file.filename);
      fs.renameSync(oldPath, newPath);
    }

    // Return the URL path
    const restaurantIdPath = restaurantId;
    const productIdPath = productId && productId !== "temp" ? productId : "temp";
    const imageUrl = `/uploads/${restaurantIdPath}/${productIdPath}/${req.file.filename}`;

    return res.json({ imageUrl });
  } catch (error) {
    console.error("[UPLOAD_PRODUCT_ERROR]", error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Failed to upload image." });
  }
});

// Upload multiple product images
router.post("/product/multiple", authMiddleware, uploadProduct.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });
    if (!restaurant) {
      // Clean up uploaded files if restaurant not found
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const restaurantId = restaurant._id.toString();
    const productId = req.body.productId;
    const imageUrls = [];

    for (const file of req.files) {
      // If productId is provided and it's not "temp", move file to correct location
      if (productId && productId !== "temp") {
        const oldPath = file.path;
        const newDir = path.join(uploadsDir, restaurantId, productId);
        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir, { recursive: true });
        }
        const newPath = path.join(newDir, file.filename);
        fs.renameSync(oldPath, newPath);
      }

      const restaurantIdPath = restaurantId;
      const productIdPath = productId && productId !== "temp" ? productId : "temp";
      const imageUrl = `/uploads/${restaurantIdPath}/${productIdPath}/${file.filename}`;
      imageUrls.push(imageUrl);
    }

    return res.json({ imageUrls });
  } catch (error) {
    console.error("[UPLOAD_PRODUCT_MULTIPLE_ERROR]", error);
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    return res.status(500).json({ message: "Failed to upload images." });
  }
});

// Upload restaurant logo
router.post("/restaurant/logo", authMiddleware, uploadRestaurant.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const adminId = req.admin.sub;
    const restaurant = await Restaurant.findOne({ admin: adminId });
    if (!restaurant) {
      // Clean up uploaded file if restaurant not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "Restaurant not found." });
    }

    // Delete old logo if exists
    if (restaurant.logoUrl && restaurant.logoUrl.startsWith("/uploads/")) {
      const oldLogoPath = path.join(__dirname, "../..", restaurant.logoUrl);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    const restaurantId = restaurant._id.toString();
    const imageUrl = `/uploads/${restaurantId}/${req.file.filename}`;

    return res.json({ imageUrl });
  } catch (error) {
    console.error("[UPLOAD_LOGO_ERROR]", error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: "Failed to upload logo." });
  }
});

module.exports = router;

