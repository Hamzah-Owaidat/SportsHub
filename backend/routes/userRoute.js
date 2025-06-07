
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path to your User model

router.patch('/users/:id/complete-profile', async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    const user = await User.findByIdAndUpdate(id, {
      phoneNumber,
    }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated",
      token: generateToken(user._id), // optional: send token
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
