const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  images: [{ type: String, required: true }], // Store multiple image paths as an array
});

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
