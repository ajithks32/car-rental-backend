const express = require("express");
const multer = require("multer");
const path = require("path");
const CarRental = require("../models/CarRental");

const router = express.Router();

// Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Function to generate a unique booking ID
const generateBookingId = () => {
  return "CAR" + Math.floor(100000 + Math.random() * 900000); // CAR123456 format
};

// 📌 **Book a Car (POST)**
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { fullName, email, phoneNumber, model, selectedPlan, amount, pickupLocation, dropoffLocation, rentalDuration } = req.body;
    const file = req.file ? req.file.filename : null;
    const bookingId = generateBookingId(); // Generate a booking ID

    const amountValue = parseFloat(amount.replace(/[^0-9.]/g, "")); // Remove ₹ symbol and convert to number

    const newBooking = new CarRental({
      bookingId,
      fullName,
      email,
      phoneNumber,
      model,
      selectedPlan,
      amount: amountValue, // Use the cleaned number
      pickupLocation,
      dropoffLocation,
      rentalDuration,
      file,
    });

    await newBooking.save();
    res.json({ success: true, message: "Car booked successfully!", bookingId });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

// 📌 **Get All Bookings**
router.get("/all", async (req, res) => {
  try {
    const bookings = await CarRental.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// 📌 **Calculate Total Earnings**
router.get("/earnings", async (req, res) => {
  try {
    const totalEarnings = await CarRental.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }, // Sum of all amounts
        },
      },
    ]);

    res.json({ totalEarnings: totalEarnings[0]?.total || 0 });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 **Update Booking Status**
router.patch("/update/:id", async (req, res) => {
  try {
    const { status, existingMeter, currentMeter, extraCharge } = req.body;

    const rental = await CarRental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const newAmount = rental.amount + extraCharge; // Add extra charge to the original amount

    const updatedRental = await CarRental.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        existingMeter, 
        currentMeter, 
        extraCharge, 
        amount: newAmount // Ensure amount is updated
      },
      { new: true }
    );

    res.json(updatedRental);
  } catch (err) {
    console.error("Error updating booking:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
