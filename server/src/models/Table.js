const { Schema, model, models } = require("mongoose");

const TableSchema = new Schema(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "out_of_order"],
      default: "available",
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique table numbers per restaurant
TableSchema.index({ restaurant: 1, number: 1 }, { unique: true });

const Table = models.Table ?? model("Table", TableSchema);

module.exports = Table;

