const express = require("express");

const Admin = require("../models/Admin");
const authMiddleware = require("../middleware/auth");
const {
  comparePassword,
  signToken,
} = require("../utils/auth");

const router = express.Router();
const MIN_PASSWORD_LENGTH = 8;

router.post("/signup", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  try {
    const normalisedEmail = email.toLowerCase();
    const existingAdmin = await Admin.findOne({ email: normalisedEmail }).lean();

    if (existingAdmin) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists." });
    }

    await Admin.create({
      email: normalisedEmail,
      password,
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error("[AUTH_SIGNUP_ERROR]", error);
    return res
      .status(500)
      .json({ message: "Unable to create admin account." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isValid = await comparePassword(password, admin.password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken({
      sub: admin._id.toString(),
      email: admin.email,
    });

    res.cookie("admin-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("[AUTH_LOGIN_ERROR]", error);
    return res.status(500).json({ message: "Unable to sign in." });
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  res.clearCookie("admin-token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.json({ success: true });
});

module.exports = router;
