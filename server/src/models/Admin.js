const { Schema, model, models } = require("mongoose");
const { hashPassword } = require("../utils/auth");

const AdminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

AdminSchema.pre("save", async function preSave(next) {
  if (!this.isModified("password")) {
    return next();
  }

  const rawPassword = this.get("password");
  if (typeof rawPassword === "string" && rawPassword.startsWith("$2")) {
    return next();
  }

  this.set("password", await hashPassword(rawPassword));
  return next();
});

const Admin = models.Admin ?? model("Admin", AdminSchema);

module.exports = Admin;
