require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const menuRoutes = require("./routes/menu");
const addonRoutes = require("./routes/addon");
const restaurantRoutes = require("./routes/restaurant");
const tableRoutes = require("./routes/table");
const orderRoutes = require("./routes/order");
const publicRoutes = require("./routes/public");

const app = express();

// Normalize client URL to avoid trailing-slash CORS mismatches
const rawClientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const allowedOrigin = rawClientUrl.endsWith("/")
  ? rawClientUrl.slice(0, -1)
  : rawClientUrl;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/addon", addonRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/table", tableRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/public", publicRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
});
