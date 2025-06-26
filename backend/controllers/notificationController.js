const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

exports.getAllNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "notifications",
    options: { sort: { createdAt: -1 } },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({ notifications: user.notifications });
});
