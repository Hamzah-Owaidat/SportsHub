const express = require("express");
const router = express.Router();
const usersController = require("../controllers/dashboard/usersController");
const rolesController = require("../controllers/dashboard/rolesController");
const stadiumController = require("../controllers/dashboard/stadiumsController");
const academyController = require("../controllers/dashboard/academiesController");
const tournamentsController = require("../controllers/dashboard/tournamentsController");
const bookingsController = require("../controllers/dashboard/bookingsController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const uploadStadium = require("../middlewares/uploadStadium");
const uploadAcademy = require("../middlewares/uploadAcademy");

// Dashboard users management
router.get("/users", authMiddleware.admin, usersController.getAllUsers);
router.get("/users/academy-owners", authMiddleware.role("admin"), usersController.getAcademyOwners);
router.get("/users/stadium-owners", authMiddleware.role("admin"), usersController.getStadiumOwners);
router.get("/users/:id", authMiddleware.admin, usersController.getUser);
router.post("/users", authMiddleware.admin, upload.single("profilePhoto"), usersController.addUser);
router.put("/users/:id", authMiddleware.admin, upload.single("profilePhoto"), usersController.updateUser);
router.delete("/users/:id", authMiddleware.admin, usersController.deleteUser);

// Dashboard roles management
router.get("/roles", authMiddleware.admin, rolesController.getAllRoles);
router.post("/roles", authMiddleware.admin, rolesController.addRole);
router.put("/roles/:id", authMiddleware.admin, rolesController.updateRole);
router.delete("/roles/:id", authMiddleware.admin, rolesController.deleteRole);

// Dashboard stadium management
router.get("/stadiums", authMiddleware.role(["admin"]), stadiumController.getAllStadiums);
router.get("/stadiums/:id", authMiddleware.role(["admin", "stadiumOwner"]), stadiumController.getStadiumById);
router.post(
  "/stadiums",
  authMiddleware.role(["stadiumOwner", "admin"]),
  uploadStadium.array("photos", 5),
  stadiumController.addStadium
);
router.put("/stadiums/:id", authMiddleware.owns("stadiumModel", "id", "ownerId"), uploadStadium.array("photos", 5), stadiumController.updateStadium);
router.delete("/stadiums/:id", authMiddleware.owns("stadiumModel", "id", "ownerId"), stadiumController.deleteStadium);
router.get(
  "/stadiums/owner/:ownerId",
  authMiddleware.role(["admin", "stadiumOwner"]),
  stadiumController.getStadiumsByOwner
);

router.get(
  "/stadiums/:id/bookings",
  authMiddleware.owns("stadiumModel", "id", "ownerId"),
  bookingsController.getBookingsForOwner
);
router.put(
  "/stadiums/:id/bookings/:bookingId/cancel",
  authMiddleware.owns("stadiumModel", "id", "ownerId"),
  bookingsController.ownerCancelBooking
);

// Dashboard academy management
router.get("/academies", authMiddleware.role(["admin"]), academyController.getAllAcademies);
router.post(
  "/academies",
  authMiddleware.role(["admin", "academyOwner"]),
  uploadAcademy.array("photos", 5),
  academyController.addAcademy
);
router.get("/academies/:id", authMiddleware.role(["admin", "academyOwner"]), academyController.getAcademyById);
router.put("/academies/:id", authMiddleware.owns("academyModel", "id", "ownerId"), academyController.updateAcademy);
router.delete("/academies/:id", authMiddleware.owns("academyModel", "id", "ownerId"), academyController.deleteAcademy);
router.get("/academies/owner/:ownerId", authMiddleware.role(["academyOwner"]), academyController.getAcademiesByOwner);

// Dashboard tournaments management
router.get("/tournaments", authMiddleware.role(["admin"]), tournamentsController.getAllTournaments);
router.get("/my-tournaments", authMiddleware.stadiumOwner, tournamentsController.getMyTournaments);
router.post("/tournaments", authMiddleware.stadiumOwner, tournamentsController.addTournament);
// router.get("/tournaments/:id", authMiddleware.role(["admin", "stadiumOwner"]), tournamentsController.getTournamentById);
router.put(
  "/tournaments/:id",
  authMiddleware.owns("tournamentModel", "id", "createdBy"),
  tournamentsController.updateTournament
);
router.delete(
  "/tournaments/:id",
  authMiddleware.owns("tournamentModel", "id", "createdBy"),
  tournamentsController.deleteTournament
);

module.exports = router;
