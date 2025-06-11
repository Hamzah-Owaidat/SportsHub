const User = require("../models/userModel");
const Role = require("../models/roleModel");
const asyncHandler = require("express-async-handler");
const validator = require("validator");
const googleAuthService = require("../services/googleAuthService");

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

  // Create user
  const     user = await User.create({
      username,
      email,
      password,
      phoneNumber,
      passwordConfirm,
      isActive: true,
      profilePhoto: null,
      termsAccepted: true,
      role: {
        id: userRole._id, // Save roleId as 'id'
        name: userRole.name, // Save roleName as 'name'
      },
      createdBy: req.user ? req.user._id : null,
      updatedBy: req.user ? req.user._id : null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

  sendTokenResponse(user, 201, res);
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
  // Clear the token cookie
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // Cookie expires in 10 seconds
    httpOnly: true,
  });

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

// @desc      Login/Register user with Google (Passport-based - for backward compatibility)
// @route     GET /api/auth/google/callback
// @access    Public
exports.loginWithGoogle = asyncHandler(async (req, res) => {
  const googleProfile = req.user;

  let user = await User.findOne({ email: googleProfile.email });

  if (!user) {
    const userRole = await Role.findOne({ name: "user" });
    if (!userRole) {
      return res.status(400).json({
        status: "fail",
        message: "Default role 'user' not found",
      });
    }

    user = await User.create({
      username: googleProfile.name,
      email: googleProfile.email,
      password: "GoogleAuth",
      passwordConfirm: "GoogleAuth",
      isActive: true,
      profilePhoto: googleProfile.picture || null,
      termsAccepted: true,
      role: {
        id: userRole._id,
        name: userRole.name,
      },
      authProvider: "google",
      createdBy: null,
      updatedBy: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  // Generate JWT token
  const token = user.getSignedJwtToken();

  // ✅ Redirect to your frontend with token in query or hash
  const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
  res.redirect(redirectUrl);
});

// @desc      Login/Register user with Google ID Token (Mobile & Web)
// @route     POST /api/auth/google/token
// @access    Public
exports.loginWithGoogleToken = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Google ID token is required",
    });
  }

  try {
    // Verify the Google ID token
    const googleProfile = await googleAuthService.verifyIdToken(idToken);

    // Find or create user
    let user = await User.findOne({ email: googleProfile.email });

    if (!user) {
      // Find default user role
      const userRole = await Role.findOne({ name: "user" });
      if (!userRole) {
        return res.status(400).json({
          success: false,
          message: "Default role 'user' not found",
        });
      }

      // Create new user
      user = await User.create({
        username: googleProfile.name.toLowerCase().replace(/\s+/g, ''),
        email: googleProfile.email,
        password: "GoogleAuth",
        passwordConfirm: "GoogleAuth",
        isActive: true,
        profilePhoto: googleProfile.picture || null,
        termsAccepted: true,
        isVerified: googleProfile.emailVerified || false,
        role: {
          id: userRole._id,
          name: userRole.name,
        },
        authProvider: "google",
        createdBy: null,
        updatedBy: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      // Update existing user's profile photo if it's from Google
      if (user.authProvider === "google" && googleProfile.picture) {
        user.profilePhoto = googleProfile.picture;
        await user.save();
      }
    }

    // Generate JWT token and send response
    sendTokenResponse(user, 200, res);

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc      Get Google OAuth URL for web authentication
// @route     GET /api/auth/google/url
// @access    Public
exports.getGoogleAuthUrl = asyncHandler(async (req, res) => {
  const redirectUri = `${process.env.API_URL}/api/auth/google/web-callback`;
  
  try {
    const authUrl = googleAuthService.generateAuthUrl(redirectUri);
    
    res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate Google auth URL",
    });
  }
});

// @desc      Handle Google OAuth callback for web (alternative to passport)
// @route     GET /api/auth/google/web-callback
// @access    Public
exports.handleGoogleWebCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`);
  }

  try {
    const redirectUri = `${process.env.API_URL}/api/auth/google/web-callback`;
    const googleProfile = await googleAuthService.exchangeCodeForTokens(code, redirectUri);

    // Find or create user (same logic as token method)
    let user = await User.findOne({ email: googleProfile.email });

    if (!user) {
      const userRole = await Role.findOne({ name: "user" });
      if (!userRole) {
        return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=role_not_found`);
      }

      user = await User.create({
        username: googleProfile.name.toLowerCase().replace(/\s+/g, ''),
        email: googleProfile.email,
        password: "GoogleAuth",
        passwordConfirm: "GoogleAuth",
        isActive: true,
        profilePhoto: googleProfile.picture || null,
        termsAccepted: true,
        isVerified: googleProfile.emailVerified || false,
        role: {
          id: userRole._id,
          name: userRole.name,
        },
        authProvider: "google",
        createdBy: null,
        updatedBy: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      if (user.authProvider === "google" && googleProfile.picture) {
        user.profilePhoto = googleProfile.picture;
        await user.save();
      }
    }

    // Generate JWT token and redirect to frontend
    const token = user.getSignedJwtToken();
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('Google web callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=authentication_failed`);
  }
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
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
