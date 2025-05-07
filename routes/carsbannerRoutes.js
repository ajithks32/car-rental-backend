const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CarBanner = require("../models/CarBanner");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 🟢 Upload multiple images and store in a single array
router.post("/", upload.array("images", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const imageUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

  try {
    let carBanner = await CarBanner.findOne();
    if (carBanner) {
      carBanner.images.push(...imageUrls);
      await carBanner.save();
    } else {
      carBanner = new CarBanner({ images: imageUrls });
      await carBanner.save();
    }

    res.json(carBanner);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

// 🟢 Fetch banners (single document with images array)
router.get("/", async (req, res) => {
  try {
    const carBanner = await CarBanner.findOne();
    res.json(carBanner ? carBanner.images : []);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

// 🟢 Delete a single image from the array
router.delete("/:imageUrl", async (req, res) => {
  try {
    let carBanner = await CarBanner.findOne();
    if (!carBanner) {
      return res.status(404).json({ error: "No banners found" });
    }

    const imageToDelete = `http://localhost:5000/uploads/${req.params.imageUrl}`;
    carBanner.images = carBanner.images.filter(img => img !== imageToDelete);

    await carBanner.save();

    // Delete file from server
    const filename = path.basename(imageToDelete);
    const filePath = path.join(__dirname, "../uploads", filename);

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

module.exports = router;
