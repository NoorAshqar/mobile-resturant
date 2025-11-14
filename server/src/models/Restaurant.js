const { Schema, model, models } = require("mongoose");

const RestaurantSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    cuisine: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    website: {
      type: String,
      default: "",
      trim: true,
    },
    openingHours: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    todayOrders: {
      type: Number,
      default: 0,
    },
    todayRevenue: {
      type: Number,
      default: 0,
    },
    totalMenuItems: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    trend: {
      type: String,
      enum: ["up", "down"],
      default: "up",
    },
    trendPercentage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Restaurant =
  models.Restaurant ?? model("Restaurant", RestaurantSchema);

module.exports = Restaurant;
