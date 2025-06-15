const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");

// @desc    Render the dashboard page
// @route   GET /dashboard
// @access  Private
exports.showDashboard = asyncHandler(async (req, res, next) => {
  const userCount = await User.countDocuments();

  res.status(200).json({
    status: "success",
    data: {
      userCount,
      message: "Welcome to the dashboard",
    },
  });
});
