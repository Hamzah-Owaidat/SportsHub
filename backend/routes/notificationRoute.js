const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.get("/", authMiddleware.auth, notificationController.getAllNotifications);

module.exports = router;