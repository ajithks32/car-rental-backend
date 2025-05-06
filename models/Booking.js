const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true, required: true },
  model: { type: String, required: true },
  startDestination: { type: String, required: true },
  endDestination: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true, enum: ["single", "family"] },
});

module.exports = mongoose.model("Booking", bookingSchema);
