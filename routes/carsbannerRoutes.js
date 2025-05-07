const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CarBanner = require("../models/CarBanner");

const router = express.Router();

// Use the same upload directory as server.js
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/uploads'  // Render's persistent disk path
  : path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// 🟢 Upload multiple images and store in a single array
router.post("/", upload.array("images", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  try {
    const imageUrls = req.files.map(file => {
      // Use the full URL including the domain
      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://car-rental-backend-zy09.onrender.com'  // Your Render domain
        : `${req.protocol}://${req.get('host')}`;
      return `${baseUrl}/uploads/${file.filename}`;
    });

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
    // If there's an error, delete any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    res.status(500).json({ error: "Upload error", details: error.message });
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

    const imageUrl = req.params.imageUrl;
    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadDir, filename);

    // Remove from database
    carBanner.images = carBanner.images.filter(img => img !== imageUrl);
    await carBanner.save();

    // Delete file from server
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        // Don't return error to client if file deletion fails
      }
    });

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
});

module.exports = router;
