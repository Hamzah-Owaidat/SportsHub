const User = require("../models/userModel");
const Role = require("../models/roleModel");
const asyncHandler = require("express-async-handler");
const validator = require("validator");

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, passwordConfirm, phoneNumber, termsAccepted } = req.body;

  // Find default user role
  const userRole = await Role.findOne({ name: "user" });

  if (!userRole) {
    return res.status(400).json({
      status: "fail",
      message: "Default role 'user' not found",
    });
  }

  try {
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      phoneNumber,
      passwordConfirm,
      isActive: true,
      profilePhoto: null,
      termsAccepted,
      role: {
        id: userRole._id,
        name: userRole.name,
      },
      createdBy: req.user ? req.user._id : null,
      updatedBy: req.user ? req.user._id : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    // Handle duplicate fields (e.g. email or username)
    if (err.code === 11000) {
      const duplicatedField = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `The ${duplicatedField} "${err.keyValue[duplicatedField]}" is already in use.`,
        field: duplicatedField,
      });
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      const errors = {};
      Object.values(err.errors).forEach((el) => {
        errors[el.path] = el.message;
      });

      return res.status(400).json({
        success: false,
        message: "Invalid input data",
        errors,
      });
    }

    // Fallback for unexpected errors
    console.error(err);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.",
    });
  }
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const errors = {
    emailErrorMsg: null,
    passwordErrorMsg: null,
  };

  // Email validation
  if (!email) {
    errors.emailErrorMsg = "User must have an email";
  } else if (!validator.isEmail(email)) {
    errors.emailErrorMsg = "Please enter a valid email";
  }

  // Password validation
  if (!password) {
    errors.passwordErrorMsg = "User must have a password";
  } else if (password.length < 8) {
    errors.passwordErrorMsg = "Password must be at least 8 characters long";
  }

  // Check if any error message exists
  if (errors.emailErrorMsg || errors.passwordErrorMsg) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  const foundUser = await User.findOne({ email }).select("+password");

  if (!foundUser || !(await foundUser.correctPassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  sendTokenResponse(foundUser, 200, res);
});

// @desc      Logout user
// @route     GET /api/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
    data: {},
  });
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "roles",
    populate: {
      path: "permissions",
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    // Set cookie expiration by adding JWT_EXPIRES_IN days to current time
    expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000),
    // Prevent JavaScript access to cookie (XSS protection)
    httpOnly: true,
    // Only send cookie in first-party context (CSRF protection)
    sameSite: "strict",
    // Specifies that the cookie is accessible from all paths/routes within the domain
    // Without this, cookie would only be accessible from the specific path it was set from
    path: "/",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Set token cookie and send response
  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};
