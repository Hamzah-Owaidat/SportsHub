const express = require("express");
const passport = require("passport");
const router = express.Router();

// const { protect } = require("../middleware/authMiddleware");
const { register, login, logout, loginWithGoogle } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false }), loginWithGoogle);

module.exports = router;
