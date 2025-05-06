const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Taxi = require("../models/Taxi");

const router = express.Router();

// Ensure "uploads" directory exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// 📌 **1. Fetch all taxis**
router.get("/", async (req, res) => {
  try {
    const taxis = await Taxi.find();
    res.json(taxis);
  } catch (error) {
    res.status(500).json({ message: "Error fetching taxis", error });
  }
});

// 📌 **2. Add a New Taxi with Image Upload**
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { model, gear, capacity, fuel, price8hr, price24hr, priceInfinity } = req.body;
      const image = req.files["image"] ? `/uploads/${req.files["image"][0].filename}` : null;
      const icon = req.files["icon"] ? `/uploads/${req.files["icon"][0].filename}` : null;

      if (!image || !icon) {
        return res.status(400).json({ message: "Both image and icon are required" });
      }

      const newTaxi = new Taxi({
        image,
        icon,
        model,
        gear,
        capacity,
        fuel,
        price8hr,
        price24hr,
        priceInfinity,
      });

      await newTaxi.save();
      res.status(201).json({ message: "🚗 Taxi added successfully", taxi: newTaxi });
    } catch (error) {
      res.status(500).json({ message: "Error adding taxi", error });
    }
  }
);


// 📌 **3. Delete a Taxi**
router.delete("/:id", async (req, res) => {
  try {
    const taxi = await Taxi.findById(req.params.id);
    if (!taxi) {
      return res.status(404).json({ message: "Taxi not found" });
    }

    // Remove image file
    if (taxi.image) {
      const imagePath = path.join(__dirname, "..", taxi.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Taxi.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Taxi deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting taxi", error });
  }
});

module.exports = router;
