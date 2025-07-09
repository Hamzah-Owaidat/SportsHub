const asyncHandler = require("express-async-handler");
const Tournament = require("../models/tournamentModel");
const Team = require("../models/teamModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

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

  if (!teamId) {
    throw new Error("teamId is required");
  }

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

  // Get the team leader (payer)
  const payer = await User.findById(req.user.id);
  if (!payer) {
    res.status(404);
    throw new Error("User not found");
  }

  const entryFee = tournament.entryPricePerTeam;

  if (payer.wallet < entryFee) {
    res.status(400);
    throw new Error(`Insufficient wallet balance. You need ${entryFee}, but you have ${payer.wallet}`);
  }

  // Deduct entry fee from payer
  payer.wallet -= entryFee;
  await payer.save({ validateBeforeSave: false });

  // Add entry fee to tournament creator's wallet
  const tournamentCreator = await User.findById(tournament.createdBy);
  if (tournamentCreator) {
    tournamentCreator.wallet += entryFee;
    await tournamentCreator.save({ validateBeforeSave: false });
  }

  // Add team to tournament
  tournament.teams.push(teamId);
  tournament.updatedBy = payer._id;
  tournament.updatedAt = Date.now();
  await tournament.save();

  // Notify team members
  const team = await Team.findById(teamId).populate("members", "_id username");
  if (team && team.members.length > 0) {
    const message = `Your team "${team.name}" has joined the tournament "${tournament.name}".`;

    const notifications = await Promise.all(
      team.members.map(member =>
        Notification.create({
          user: member._id,
          message,
          type: "info",
          metadata: {
            teamId: team._id,
            tournamentId: tournament._id,
          },
        })
      )
    );

    await Promise.all(
      team.members.map((member, i) =>
        User.findByIdAndUpdate(member._id, {
          $push: { notifications: notifications[i]._id },
        })
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Team added to tournament, entry fee processed, and members notified",
    data: tournament,
  });
});

