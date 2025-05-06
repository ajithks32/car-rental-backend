const express = require("express");
const multer = require("multer");
const path = require("path");
const Offer = require("../models/offer");

const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in 'uploads/' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.array("images", 6), async (req, res) => { 
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image file is required" });
    }

    const imagePaths = req.files.map((file) => file.filename);

    const offer = new Offer({ images: imagePaths });
    await offer.save();

    res.status(201).json({ message: "Offer images uploaded successfully", offer });
  } catch (error) {
    res.status(500).json({ message: "Error adding offer images", error });
  }
});
const fs = require("fs");

router.delete("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    // Extract filename from URL
    const filename = imageUrl.split("/").pop();

    // Find the offer that contains this image
    const offer = await Offer.findOne({ images: filename });
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Remove image from the array
    offer.images = offer.images.filter((img) => img !== filename);

    // If no images left, delete the offer record
    if (offer.images.length === 0) {
      await Offer.findByIdAndDelete(offer._id);
    } else {
      await offer.save();
    }

    // Delete the image file from the uploads folder
    const imagePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error });
  }
});
// Get all offers
router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find();
    
    const updatedOffers = offers.map((offer) => ({
      _id: offer._id,
      images: offer.images.map((img) => `http://localhost:5000/uploads/${img}`),
    }));

    res.json(updatedOffers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching offers", error });
  }
});

module.exports = router;
