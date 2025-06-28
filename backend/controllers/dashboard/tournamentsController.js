const asyncHandler = require("express-async-handler");
const Tournament = require("../../models/tournamentModel");
const Team = require("../../models/teamModel");
const User = require("../../models/userModel");
const Notification = require("../../models/notificationModel");

// Get all tournaments
exports.getAllTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find()
    .populate("createdBy", "username")
    .populate("stadiumId", "name")
    .populate("teams", "name");

  res.status(200).json({
    status: "success",
    data: tournaments,
  });
});

// Get my tournaments
exports.getMyTournaments = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const tournaments = await Tournament.find({ createdBy: ownerId })
    .populate("createdBy", "username")
    .populate("stadiumId", "name")
    .populate("teams", "name");

  res.status(200).json({
    status: "success",
    data: tournaments,
  });
});

// Create new tournament
exports.addTournament = asyncHandler(async (req, res) => {
  const { name, description, entryPricePerTeam, rewardPrize, maxTeams, startDate, endDate, stadiumId } = req.body;

  let newTournament = await Tournament.create({
    name,
    description,
    entryPricePerTeam,
    rewardPrize,
    maxTeams,
    startDate,
    endDate,
    stadiumId,
    createdBy: req.user.id,
    updatedBy: req.user.id,
  });

  newTournament = await newTournament.populate("stadiumId", "name");

  // Notify all users about new tournament
  const users = await User.find({}, "_id");
  const notifications = await Promise.all(
    users.map((user) =>
      Notification.create({
        user: user._id,
        message: `A new tournament "${newTournament.name}" has been added.`,
        type: "tournament-added",
        metadata: {
          tournamentId: newTournament._id,
        },
      })
    )
  );

  // Push notifications to users
  await Promise.all(
    notifications.map((notification) =>
      User.findByIdAndUpdate(notification.user, {
        $push: { notifications: notification._id },
      })
    )
  );

  res.status(201).json({
    status: "success",
    data: newTournament,
  });
});

// Update a tournament
exports.updateTournament = asyncHandler(async (req, res) => {
  const { name, description, entryPricePerTeam, rewardPrize, maxTeams, startDate, endDate, stadiumId } = req.body;

  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  tournament.name = name ?? tournament.name;
  tournament.description = description ?? tournament.description;
  tournament.entryPricePerTeam = entryPricePerTeam ?? tournament.entryPricePerTeam;
  tournament.rewardPrize = rewardPrize ?? tournament.rewardPrize;
  tournament.maxTeams = maxTeams ?? tournament.maxTeams;
  tournament.startDate = startDate ?? tournament.startDate;
  tournament.endDate = endDate ?? tournament.endDate;
  tournament.stadiumId = stadiumId ?? tournament.stadiumId;
  tournament.updatedBy = req.user.id;
  tournament.updatedAt = Date.now();

  const updatedTournament = await tournament.save();

  res.status(200).json({
    status: "success",
    message: "Tournament updated",
    data: updatedTournament,
  });
});

// Delete a tournament
exports.deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  await tournament.deleteOne();

  // Notify all users about deleted tournament
  const users = await User.find({}, "_id");
  const notifications = await Promise.all(
    users.map((user) =>
      Notification.create({
        user: user._id,
        message: `The tournament "${tournament.name}" has been deleted.`,
        type: "info",
        metadata: {
          tournamentId: tournament._id,
        },
      })
    )
  );

  // Push notifications to users
  await Promise.all(
    notifications.map((notification) =>
      User.findByIdAndUpdate(notification.user, {
        $push: { notifications: notification._id },
      })
    )
  );

  res.status(200).json({
    status: "success",
    message: "Tournament deleted",
  });
});
