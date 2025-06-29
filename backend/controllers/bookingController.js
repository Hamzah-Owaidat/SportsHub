const Booking = require("../models/bookingModel");
const Stadium = require("../models/stadiumModel");
const mongoose = require("mongoose");

exports.bookMatch = async (req, res) => {
  try {
    const { stadiumId, matchDate, timeSlot, refereeId } = req.body;
    const userId = req.user.id;

    if (!stadiumId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, matchDate, and timeSlot are required",
      });
    }

    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res.status(404).json({ success: false, message: "Stadium not found" });
    }

    const now = new Date();

    const bookingDate = new Date(matchDate);
    bookingDate.setHours(0, 0, 0, 0); // normalize

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message: "You cannot book for a past date",
      });
    }

    // Find calendar entry for the selected date
    const calendarEntry = stadium.calendar.find((entry) => new Date(entry.date).getTime() === bookingDate.getTime());

    if (!calendarEntry) {
      return res.status(400).json({ success: false, message: "No available slots for this date" });
    }

    const slot = calendarEntry.slots.find((s) => s.startTime === timeSlot);

    if (!slot) {
      return res.status(400).json({ success: false, message: "Time slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: "Slot is already booked" });
    }

    // 🕒 Validate time — user cannot book if the current time is already past the slot's start time
    const [hour, minute] = slot.startTime.split(":").map(Number);

    const slotDateTime = new Date(matchDate);
    slotDateTime.setHours(hour, minute, 0, 0);

    if (slotDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: "You cannot book a slot that has already started or passed",
      });
    }

    // ✅ Passed all checks — create booking
    const newBooking = await Booking.create({
      userId,
      stadiumId,
      matchDate: new Date(matchDate),
      timeSlot,
      refereeId,
    });

    // Update slot
    slot.isBooked = true;
    slot.bookingId = newBooking._id;
    await stadium.save();

    res.status(201).json({
      success: true,
      message: "Booking successful",
      data: newBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only cancel your own bookings" });
    }

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be cancelled",
      });
    }

    const now = new Date();
    const matchDateTime = new Date(booking.matchDate);
    const [hour, minute] = booking.timeSlot.split(":").map(Number);
    matchDateTime.setHours(hour, minute, 0, 0);

    if (now > matchDateTime) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past bookings",
      });
    }

    // Check penalty
    const stadium = await Stadium.findById(booking.stadiumId);
    const penaltyWindow = stadium.penaltyPolicy.hoursBefore;
    const hoursBeforeMatch = (matchDateTime - now) / (1000 * 60 * 60);
    const applyPenalty = hoursBeforeMatch < penaltyWindow;

    // Cancel the booking
    booking.status = "cancelled";
    booking.penaltyApplied = applyPenalty;
    await booking.save();

    // Free up the slot
    const dateOnly = new Date(booking.matchDate);
    dateOnly.setHours(0, 0, 0, 0);

    const calendarEntry = stadium.calendar.find(
      (entry) => new Date(entry.date).getTime() === dateOnly.getTime()
    );

    if (calendarEntry) {
      const slot = calendarEntry.slots.find(
        (s) => s.bookingId && s.bookingId.toString() === booking._id.toString()
      );
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
        await stadium.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking cancelled${applyPenalty ? ` with penalty ${stadium.penaltyPolicy.penaltyAmount}` : ""}`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate({
        path: "stadiumId",
        select: "name location pricePerHour photos penaltyPolicy",
      })
      .populate("refereeId", "username email")
      .sort({ matchDate: -1 });

    // Add penaltyAmount if penaltyApplied is true
    const enrichedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      if (bookingObj.penaltyApplied && bookingObj.stadiumId?.penaltyPolicy) {
        bookingObj.penaltyAmount = bookingObj.stadiumId.penaltyPolicy.penaltyAmount;
      } else {
        bookingObj.penaltyAmount = 0;
      }
      return bookingObj;
    });

    res.status(200).json({
      success: true,
      count: enrichedBookings.length,
      data: enrichedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
