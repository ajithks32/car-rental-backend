const mongoose = require("mongoose");

const taxiSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    model: { type: String, required: true },
    gear: { type: String, required: true },
    capacity: { type: String, required: true },
    fuel: { type: String, required: true },
    price8hr: { type: Number, required: true },
    price24hr: { type: Number, required: true },
    priceInfinity: { type: Number, required: true },
    icon: { type: String, required: true }, // Add this field
  },
  { timestamps: true }
);

module.exports = mongoose.model("Taxi", taxiSchema);