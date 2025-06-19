const asyncHandler = require("express-async-handler");
const Tournament = require("../models/tournamentModel");
const Team = require("../models/teamModel");


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


