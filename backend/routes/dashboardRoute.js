const express = require("express");
const router = express.Router();
const usersController = require("../controllers/dashboard/usersController");
const rolesController = require("../controllers/dashboard/rolesController");
const stadiumController = require("../controllers/dashboard/stadiumsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
// const { cookiesMiddleware } = require("../middlewares/cookieMiddleware");

// Dashboard home page
// router.get("/", isAuthenticated, isAdmin, showDashboard);

// Dashboard users management
router.get("/users", authMiddleware.admin, usersController.getAllUsers);
router.get("/users/:id", authMiddleware.admin, usersController.getUser);
router.post("/users", authMiddleware.admin, upload.single("profilePhoto"), usersController.addUser);
router.put("/users/:id", authMiddleware.admin, usersController.updateUser);
router.delete("/users/:id", authMiddleware.admin, usersController.deleteUser);

// Dashboard roles management
router.get("/roles", authMiddleware.admin, rolesController.getAllRoles);
router.post("/roles", authMiddleware.admin, rolesController.createRole);
router.put("/roles/:id", authMiddleware.admin, rolesController.updateRole);
router.delete("/roles/:id", authMiddleware.admin, rolesController.deleteRole);

// Dashboard stadium management
router.get("/stadiums", authMiddleware.role(["admin"]), stadiumController.getAllStadiums);
router.get("/stadiums/:id", authMiddleware.role(["admin", "stadiumOwner"]), stadiumController.getStadiumById);
router.post("/stadiums", authMiddleware.stadiumOwner, stadiumController.addStadium);
router.put("/stadiums/:id", authMiddleware.owns("stadiumModel", "id", "ownerId"), stadiumController.updateStadium);
router.delete("/stadiums/:id", authMiddleware.owns("stadiumModel", "id", "ownerId"), stadiumController.deleteStadium);
router.get("/stadiums/owner/:ownerId", authMiddleware.role(["admin"]), stadiumController.getStadiumsByOwner);
router.post(
  "/stadiums/:id/calendar",
  authMiddleware.owns("stadiumModel", "id", "ownerId"),
  stadiumController.addCalendarEntry
);
router.put(
  "/stadiums/:id/calendar",
  authMiddleware.owns("stadiumModel", "id", "ownerId"),
  stadiumController.updateCalendarEntry
);

module.exports = router;
