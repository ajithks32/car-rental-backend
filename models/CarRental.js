const mongoose = require("mongoose");

const carRentalSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true },
    fullName: String,
    email: String,
    phoneNumber: String,
    model: String,
    selectedPlan: String,
    amount: Number,
    pickupLocation: String,
    dropoffLocation: String,
    rentalDuration: String,
    file: String,
    status: { type: String, default: "Pending" }, // Added status field
    existingMeter: { type: Number, default: 0 },
    currentMeter: { type: Number, default: 0 },
    extraCharge: { type: Number, default: 0 },
  },
  { timestamps: true } // ✅ Added timestamps
);

module.exports = mongoose.model("CarRental", carRentalSchema);
