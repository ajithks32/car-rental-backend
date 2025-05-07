// routes/carBannerRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CarBanner = require("../models/CarBanner");

const router = express.Router();

// 🟢 Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// 🟢 Upload Multiple Images
router.post("/", upload.array("images", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const imageUrls = req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

  try {
    let carBanner = await CarBanner.findOne();
    if (carBanner) {
      carBanner.images.push(...imageUrls);
      await carBanner.save();
    } else {
      carBanner = new CarBanner({ images: imageUrls });
      await carBanner.save();
    }
    res.status(200).json(carBanner);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

// 🟢 Fetch All Banners
router.get("/", async (req, res) => {
  try {
    const carBanner = await CarBanner.findOne();
    res.status(200).json(carBanner ? carBanner.images : []);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

// 🟢 Delete a Single Image
router.delete("/:imageUrl", async (req, res) => {
  try {
    let carBanner = await CarBanner.findOne();
    if (!carBanner) {
      return res.status(404).json({ error: "No banners found" });
    }

    const imageToDelete = `${req.protocol}://${req.get("host")}/uploads/${req.params.imageUrl}`;
    carBanner.images = carBanner.images.filter(img => img !== imageToDelete);
    await carBanner.save();

    // Delete image file from server
    const filePath = path.join(__dirname, "../uploads", req.params.imageUrl);
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

module.exports = router;
