const Booking = require("../../models/bookingModel");
const Stadium = require("../../models/stadiumModel");
const mongoose = require("mongoose");

// 🟡 GET all bookings
exports.getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings with populated user and stadium
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate("stadiumId", "name location penaltyPolicy") // include penaltyPolicy
      .sort({ matchDate: -1 })
      .lean(); // use lean so we can add fields

    // Add penaltyAmount to bookings that have penaltyApplied = true
    const enhancedBookings = bookings.map((booking) => {
      if (booking.penaltyApplied && booking.stadiumId?.penaltyPolicy) {
        return {
          ...booking,
          penaltyAmount: booking.stadiumId.penaltyPolicy.penaltyAmount,
        };
      }
      return booking;
    });

    res.status(200).json({
      success: true,
      count: enhancedBookings.length,
      data: enhancedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { stadiumId, userId, matchDate, timeSlot } = req.body;

    if (!stadiumId || !userId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, userId, matchDate, and timeSlot are required",
      });
    }

    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res.status(404).json({ success: false, message: "Stadium not found" });
    }

    const now = new Date();
    const bookingDate = new Date(matchDate);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ success: false, message: "Cannot book for a past date" });
    }

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

    const [hour, minute] = slot.startTime.split(":").map(Number);
    const slotDateTime = new Date(matchDate);
    slotDateTime.setHours(hour, minute, 0, 0);

    if (slotDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book a slot that has already started or passed",
      });
    }

    const BOOKING_PRICE = stadium.pricePerMatch;

    // 🏟 Create booking for the selected user
    const newBooking = await Booking.create({
      userId,
      stadiumId,
      matchDate: new Date(matchDate),
      timeSlot,
      price: BOOKING_PRICE,
    });

    slot.isBooked = true;
    slot.bookingId = newBooking._id;
    await stadium.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("userId", "username email")
      .populate("stadiumId", "name location");

    res.status(201).json({
      success: true,
      message: "Booking created by admin successfully",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin booking failed",
      error: error.message,
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { stadiumId, userId, matchDate, timeSlot } = req.body;
    const bookingId = req.params.id;

    if (!stadiumId || !userId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, userId, matchDate, and timeSlot are required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 🟡 Step 1: Unbook old slot
    const oldStadium = await Stadium.findById(booking.stadiumId);
    if (oldStadium) {
      const oldDate = new Date(booking.matchDate);
      oldDate.setHours(0, 0, 0, 0);

      const oldEntry = oldStadium.calendar.find((entry) =>
        new Date(entry.date).getTime() === oldDate.getTime()
      );

      if (oldEntry) {
        const oldSlot = oldEntry.slots.find((s) => s.startTime === booking.timeSlot);
        if (oldSlot) {
          oldSlot.isBooked = false;
          oldSlot.bookingId = null;
          await oldStadium.save();
        }
      }
    }

    // 🟢 Step 2: Book new slot
    const newStadium = await Stadium.findById(stadiumId);
    if (!newStadium) {
      return res.status(404).json({ success: false, message: "New stadium not found" });
    }

    const bookingDate = new Date(matchDate);
    const today = new Date();
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ success: false, message: "Cannot book for a past date" });
    }

    const calendarEntry = newStadium.calendar.find((entry) =>
      new Date(entry.date).getTime() === bookingDate.getTime()
    );

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

    const [hour, minute] = timeSlot.split(":").map(Number);
    const slotDateTime = new Date(matchDate);
    slotDateTime.setHours(hour, minute, 0, 0);
    if (slotDateTime <= new Date()) {
      return res.status(400).json({ success: false, message: "Slot has already started or passed" });
    }

    const BOOKING_PRICE = newStadium.pricePerMatch;

    // Update booking document
    booking.stadiumId = stadiumId;
    booking.userId = userId;
    booking.matchDate = new Date(matchDate);
    booking.timeSlot = timeSlot;
    booking.price = BOOKING_PRICE;
    await booking.save();

    // Mark the new slot as booked
    slot.isBooked = true;
    slot.bookingId = booking._id;
    await newStadium.save();

    const populatedUpdated = await Booking.findById(booking._id)
      .populate("userId", "username email")
      .populate("stadiumId", "name location");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: populatedUpdated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking update failed",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only pending or approved bookings can be cancelled",
      });
    }

    // Set status and skip wallet updates
    booking.status = "cancelled";
    booking.penaltyApplied = false;
    await booking.save();

    // Free the slot from the stadium calendar
    const stadium = await Stadium.findById(booking.stadiumId);
    const bookingDate = new Date(booking.matchDate);
    bookingDate.setHours(0, 0, 0, 0);

    const calendarEntry = stadium.calendar.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === bookingDate.getTime();
    });

    if (calendarEntry) {
      const slot = calendarEntry.slots.find((s) => s.bookingId?.toString() === booking._id.toString());
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
      }
      await stadium.save();
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled by admin without refund or penalty",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin failed to cancel booking",
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
