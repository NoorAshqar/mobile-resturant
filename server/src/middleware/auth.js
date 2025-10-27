const { verifyToken } = require("../utils/auth");

function authMiddleware(req, res, next) {
  const token = req.cookies?.["admin-token"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.admin = payload;
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authMiddleware;
