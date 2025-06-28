console.log("✅ bookingCleanupJob.js loaded");
const Booking = require("../models/bookingModel");
const Stadium = require("../models/stadiumModel");

setInterval(async () => {
  try {
    const now = new Date();

    const bookings = await Booking.find({ status: "approved" });
    let updatedCount = 0;

    for (const booking of bookings) {
      const stadium = await Stadium.findById(booking.stadiumId);
      if (!stadium) continue;

      const calendarEntry = stadium.calendar.find(
        (entry) => new Date(entry.date).toDateString() === new Date(booking.matchDate).toDateString()
      );
      if (!calendarEntry) continue;

      const slot = calendarEntry.slots.find(
        (s) => s.bookingId?.toString() === booking._id.toString()
      );
      if (!slot || !slot.endTime) continue;

      // Combine booking date with slot.endTime
      const [hour, minute] = slot.endTime.split(":").map(Number);
      const endDateTime = new Date(booking.matchDate);
      endDateTime.setHours(hour, minute, 0, 0);

      if (now > endDateTime) {
        booking.status = "completed";
        await booking.save();
        updatedCount++;
      }
    }

    console.log(`${updatedCount} bookings marked as completed.`);
    console.log(bookings);
  } catch (err) {
    console.error("Error updating completed bookings:", err.message);
  }
}, 90 * 60 * 1000);

