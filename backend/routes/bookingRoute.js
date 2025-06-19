const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/book', authMiddleware.user, bookingController.bookMatch);
router.put('/:id/cancel', authMiddleware.user, bookingController.cancelBooking);
router.get('/my-bookings', authMiddleware.user, bookingController.getMyBookings);

module.exports = router;