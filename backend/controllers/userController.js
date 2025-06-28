const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

// your existing updateUserProfile...
exports.updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { username, email, phoneNumber } = req.body;
    const profilePhoto = req.file ? `/images/user/${req.file.filename}` : undefined;

    // Check for duplicates
    const existingUsername = username ? await User.findOne({ username, _id: { $ne: userId } }) : null;
    const existingEmail = email ? await User.findOne({ email, _id: { $ne: userId } }) : null;
    const existingPhone = phoneNumber ? await User.findOne({ phoneNumber, _id: { $ne: userId } }) : null;

    if (existingUsername) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already registered" });
    }
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number is already used" });
    }

    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    if (profilePhoto) updatedFields.profilePhoto = profilePhoto;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new token
    const token = jwt.sign(
      {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role.name,
        isActive: updatedUser.isActive,
        termsAccepted: updatedUser.termsAccepted,
        team: updatedUser.team,
        createdBy: updatedUser.createdBy,
        updatedBy: updatedUser.updatedBy,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: "Profile updated successfully",
      token,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});
