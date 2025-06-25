// routes/userRoutes.js
const express = require("express");
const { updateUserProfile } = require("../controllers/userController");
const upload = require("../middlewares/upload");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();


// POST /api/users/update-profile
router.post("/update-profile", authMiddleware.auth, upload.single("profilePhoto"), updateUserProfile);

module.exports = router;
