const asyncHandler = require("express-async-handler");
const Tournament = require("../../models/tournamentModel");
const Team = require("../../models/teamModel");

// Create new tournament
exports.addTournament = asyncHandler(async (req, res) => {
  const { name, description, entryPricePerTeam, rewardPrize, maxTeams, startDate, endDate, stadiumId } = req.body;

  const newTournament = await Tournament.create({
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

  res.status(201).json({
    status: "success",
    data: newTournament,
  });
});

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

// Join tournament
exports.joinTournament = asyncHandler(async (req, res) => {
  const { tournamentId, teamId } = req.body;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    res.status(404);
    throw new Error("Tournament not found");
  }

  if (tournament.teams.includes(teamId)) {
    res.status(400);
    throw new Error("Team already joined this tournament");
  }

  if (tournament.teams.length >= tournament.maxTeams) {
    res.status(400);
    throw new Error("Tournament is already full");
  }

  tournament.teams.push(teamId);
  tournament.updatedBy = req.user.id;
  tournament.updatedAt = Date.now();

  await tournament.save();

  res.status(200).json({
    status: "success",
    message: "Team added to tournament",
    data: tournament,
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

  res.status(200).json({
    status: "success",
    message: "Tournament deleted",
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
