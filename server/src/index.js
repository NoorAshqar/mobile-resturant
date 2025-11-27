require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const menuRoutes = require("./routes/menu");
const addonRoutes = require("./routes/addon");
const restaurantRoutes = require("./routes/restaurant");
const tableRoutes = require("./routes/table");
const orderRoutes = require("./routes/order");
const publicRoutes = require("./routes/public");
const uploadRoutes = require("./routes/upload");
const { initWebSocketServer } = require("./utils/websocket");

const app = express();
const server = http.createServer(app);

// Normalize client URL to avoid trailing-slash CORS mismatches
const rawClientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
const allowedOrigin = rawClientUrl.endsWith("/")
  ? rawClientUrl.slice(0, -1)
  : rawClientUrl;

// Allow multiple origins for development
const allowedOrigins = [
  allowedOrigin,
  "http://localhost:3000",
  "http://localhost:3001",
].filter((origin, index, self) => self.indexOf(origin) === index); // Remove duplicates

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  initWebSocketServer(server);

  server.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
  });
});
