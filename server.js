require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();
const path = require("path");
const fs = require("fs");
app.use(express.json());

// Connect to DB
connectDB();
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Use Render's persistent disk for uploads
const uploadDir = process.env.NODE_ENV === 'production' 
  ? '/opt/render/project/src/uploads'  // Render's persistent disk path
  : path.join(__dirname, "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadDir));

// API Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/bikes", require("./routes/bikeRoutes"));
app.use("/bookings", require("./routes/bookingRoutes"));
app.use("/rental", require("./routes/rentalcarbooking"));
app.use("/offers", require("./routes/offerRoutes"));
app.use("/taxis", require("./routes/taxiRoutes"));
app.use("/analytics", require("./routes/analyticsRoutes"));
app.use("/carsbanner", require("./routes/carsbannerRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
