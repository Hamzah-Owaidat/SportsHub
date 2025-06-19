const express = require('express');
const router = express.Router();

const tournamentController = require('../controllers/tournamentController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.get('/', authMiddleware.role(['user', 'teamLeader']), tournamentController.getAllTournaments);
router.post("/join", authMiddleware.teamLeader, tournamentController.joinTournament);


module.exports = router;