const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Role = require("../models/roleModel");
const bcrypt = require("bcryptjs");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // Fetch all users from the database
  const users = await User.find().lean(); // No need to populate since we are storing role names

  // Transform users to match frontend expectations (if necessary)
  const transformedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role, // Simply return the role names directly
  }));

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      users: transformedUsers,
    },
  });
});

// @desc    Render the dashboard page
// @route   GET /dashboard
// @access  Private
exports.showDashboard = asyncHandler(async (req, res, next) => {
  // You can fetch any dashboard-specific data here
  const userCount = await User.countDocuments();

  // SEND RESPONSE - For an API, you'd typically return JSON data
  res.status(200).json({
    status: "success",
    data: {
      userCount,
      message: "Welcome to the dashboard",
    },
  });

  // If this was a server-rendered application, you'd render a template:
  // res.render('dashboard', { userCount });
});

// @desc    Add a new user
// @route   POST /dashboard/users
// @access  Admin
exports.addUser = asyncHandler(async (req, res) => {
  // Debug - see what is received:
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);

  const {
    username,
    email,
    password,
    passwordConfirm,
    role: roleId,
    phoneNumber,
    isActive,
    termsAccepted,
  } = req.body;

  if (!username || !email || !password || !passwordConfirm || !phoneNumber || !roleId) {
    res.status(400);
    throw new Error("All required fields must be filled");
  }

  if (password !== passwordConfirm) {
    res.status(400);
    throw new Error("Passwords do not match");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const roleData = await Role.findById(roleId);
  if (!roleData) {
    res.status(400);
    throw new Error("Invalid role selected");
  }

  // Get the uploaded file path if exists
  let profilePhotoPath = null;
  if (req.file) {
    profilePhotoPath = `/images/user/${req.file.filename}`; // relative to your public folder
  }

  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    role: {
      id: roleData._id,
      name: roleData.name,
    },
    phoneNumber,
    isActive,
    termsAccepted,
    profilePhoto: profilePhotoPath,
    createdBy: req.user?._id,
  });

  res.status(201).json({
    message: "User created successfully",
    user: newUser,
  });
});

// @desc    Update a user's information
// @route   PUT /dashboard/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const { username, email, role, profilePhoto, isActive, phoneNumber } = req.body;

  // Build dynamic update object
  const updateFields = {};
  if (username !== undefined) updateFields.username = username;
  if (email !== undefined) updateFields.email = email;
  if (role !== undefined) updateFields.role = role;
  if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateFields,
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});


// @desc    Delete a user
// @route   DELETE /dashboard/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully",
  });
});

