const { Schema, model, models } = require("mongoose");

const OrderItemSchema = new Schema({
  menuItem: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const OrderSchema = new Schema(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    table: {
      type: Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      index: true,
    },
    tableNumber: {
      type: Number,
      required: true,
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ["building", "submitted", "completed", "cancelled"],
      default: "building",
      required: true,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    paid: {
      type: Boolean,
      default: false,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    sessionKey: {
      type: String,
      index: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one active order per table
OrderSchema.index({ restaurant: 1, table: 1, status: 1 }, { unique: false });

const Order = models.Order ?? model("Order", OrderSchema);

module.exports = Order;

