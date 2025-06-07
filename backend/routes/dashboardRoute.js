const express = require("express");
const router = express.Router();
const { getAllUsers, showDashboard, deleteUser, updateUser, addUser } = require("../controllers/dashboardController");
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");
const upload = require('../middlewares/upload');
// const { cookiesMiddleware } = require("../middlewares/cookieMiddleware");

// Dashboard home page
router.get("/", isAuthenticated, isAdmin, showDashboard);

// Get all users for the dashboard
router.get("/users", isAuthenticated, isAdmin, getAllUsers);

router.post("/users", isAuthenticated, isAdmin, upload.single('profilePhoto'), addUser);
router.put("/users/:id", isAuthenticated, isAdmin, updateUser);
router.delete("/users/:id", isAuthenticated, isAdmin, deleteUser);



module.exports = router;
