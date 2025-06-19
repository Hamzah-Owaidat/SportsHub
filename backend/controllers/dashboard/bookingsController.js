const Booking = require("../../models/bookingModel");
const Stadium = require("../../models/stadiumModel");
const mongoose = require("mongoose");

// 🟡 GET all bookings for a stadium owner
exports.getBookingsForOwner = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find all stadiums owned by the current user
    const stadiums = await Stadium.find({ ownerId }, "_id");
    const stadiumIds = stadiums.map((s) => s._id);

    // Get all bookings for those stadiums
    const bookings = await Booking.find({ stadiumId: { $in: stadiumIds } })
      .populate("userId", "username email")
      .populate("stadiumId", "name location")
      .populate("refereeId", "username email")
      .sort({ matchDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// 🔴 StadiumOwner cancels a booking (dashboard action)
exports.ownerCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params; // bookingId
    const ownerId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Check if the booking belongs to a stadium the owner owns
    const stadium = await Stadium.findById(booking.stadiumId);
    if (!stadium || stadium.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    const matchDateTime = new Date(booking.matchDate);
    const [hour, minute] = booking.timeSlot.split(":").map(Number);
    matchDateTime.setHours(hour, minute, 0, 0);

    const now = new Date();

    // Check penalty
    const penaltyWindow = stadium.penaltyPolicy.hoursBefore;
    const hoursBeforeMatch = (matchDateTime - now) / (1000 * 60 * 60);
    const applyPenalty = hoursBeforeMatch < penaltyWindow;

    // Cancel booking
    booking.status = "cancelled";
    booking.penaltyApplied = applyPenalty;
    await booking.save();

    // Free the slot
    const dateOnly = new Date(booking.matchDate);
    dateOnly.setHours(0, 0, 0, 0);

    const calendarEntry = stadium.calendar.find((entry) => new Date(entry.date).getTime() === dateOnly.getTime());

    if (calendarEntry) {
      const slot = calendarEntry.slots.find(
        (s) => s.startTime === booking.timeSlot && s.bookingId?.toString() === booking._id.toString()
      );
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;

        // ✅ Use updateOne instead of stadium.save()
        await Stadium.updateOne(
          { _id: stadium._id, "calendar.date": dateOnly },
          {
            $set: {
              "calendar.$.slots": calendarEntry.slots,
            },
          }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking cancelled by owner${
        applyPenalty ? ` (penalty applies) ${stadium.penaltyPolicy.penaltyAmount}` : ""
      }`,
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
