const express = require("express");
const Bike = require("../models/Bike");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// Add Bike
router.post("/add", verifyToken, async (req, res) => {
  const { name, type, pricePerDay, available } = req.body;
  const bike = new Bike({ name, type, pricePerDay, available });
  await bike.save();
  res.json({ message: "Bike added successfully" });
});

// Get All Bikes
router.get("/", async (req, res) => {
  const bikes = await Bike.find();
  res.json(bikes);
});

module.exports = router;
