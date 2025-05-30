const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const Role = require("../models/roleModel");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  // Fetch all users from the database
  const users = await User.find().lean(); // No need to populate since we are storing role names

  // Transform users to match frontend expectations (if necessary)
  const transformedUsers = users.map(user => ({
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
