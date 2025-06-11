const express = require("express");
const passport = require("passport");
const router = express.Router();

// const { protect } = require("../middleware/authMiddleware");
const { 
  register, 
  login, 
  logout, 
  loginWithGoogle, 
  loginWithGoogleToken, 
  getGoogleAuthUrl, 
  handleGoogleWebCallback 
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Passport-based Google auth (for backward compatibility)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), loginWithGoogle);

// New Google auth endpoints that work for both web and mobile
router.post("/google/token", loginWithGoogleToken);  // For mobile apps and direct token verification
router.get("/google/url", getGoogleAuthUrl);         // Get auth URL for web apps
router.get("/google/web-callback", handleGoogleWebCallback); // Handle web callback without passport

module.exports = router;
