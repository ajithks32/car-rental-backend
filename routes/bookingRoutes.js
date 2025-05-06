const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Function to generate booking ID
const generateBookingId = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `CARBOOK${randomNumber}`;
};

// Create Booking
router.post("/", async (req, res) => {
  try {
    const { model, startDestination, endDestination, name, email, phone, type } = req.body;

    if (!model || !startDestination || !endDestination || !name || !email || !phone || !type) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newBooking = new Booking({
      bookingId: generateBookingId(),
      model,
      startDestination,
      endDestination,
      name,
      email,
      phone,
      type,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking successful!", bookingId: newBooking.bookingId });
  } catch (error) {
    console.error("Error booking taxi:", error);
    res.status(500).json({ message: "Error booking taxi", error });
  }
});

// Get All Bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

module.exports = router;
