const mongoose = require("mongoose");

const CarBannerSchema = new mongoose.Schema({
  images: [{
    type: String,
    required: true,
  }],
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const CarBanner = mongoose.model("CarBanner", CarBannerSchema);
module.exports = CarBanner;
