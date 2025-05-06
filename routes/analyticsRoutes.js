const express = require("express");
const User = require("../models/User");
const CarRental = require("../models/CarRental");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Fetch today's users
    const newUsers = await User.countDocuments({ createdAt: { $gte: today } });
    const totalUsers = await User.countDocuments();

    // Fetch yesterday's users
    const yesterdayUsers = await User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } });

    // Fetch total earnings
    const bookings = await CarRental.find();
    const totalEarnings = bookings.reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0);

    // Fetch yesterday's earnings
    const yesterdayBookings = await CarRental.find({
      createdAt: { $gte: yesterday, $lt: today },
    });

    const yesterdayEarnings = yesterdayBookings.reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0);

    // ✅ Handle zero cases and cap at 100%
    const userGrowth =
      yesterdayUsers > 0
        ? Math.min(((newUsers - yesterdayUsers) / yesterdayUsers) * 100, 100)
        : newUsers > 0
        ? 100
        : 0;

    const amountGrowth =
      yesterdayEarnings > 0
        ? Math.min(((totalEarnings - yesterdayEarnings) / yesterdayEarnings) * 100, 100)
        : totalEarnings > 0
        ? 100
        : 0;

    res.json({ newUsers, totalUsers, totalEarnings, userGrowth, amountGrowth });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
