const mongoose = require("mongoose");

const bikeSchema = new mongoose.Schema({
  name: String,
  type: String,
  pricePerDay: Number,
  available: Boolean,
});

module.exports = mongoose.model("Bike", bikeSchema);
