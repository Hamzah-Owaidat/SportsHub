const Stadium = require("../../models/stadiumModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const Notification = require("../../models/notificationModel");

const generateSlots = require("../../utils/generateSlots"); // Adjust path if needed

const fillCalendarWithSlots = async (stadium, startDate = new Date(), endDate = null) => {
  if (!endDate) {
    endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // 6 months ahead by default
  }

  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  const finalDate = new Date(endDate);
  finalDate.setHours(0, 0, 0, 0);

  const newCalendarEntries = [];

  while (currentDate <= finalDate) {
    const dateExists = stadium.calendar.some((entry) => entry.date.toDateString() === currentDate.toDateString());

    if (!dateExists) {
      const slots = generateSlots(stadium.workingHours.start, stadium.workingHours.end);
      newCalendarEntries.push({
        date: new Date(currentDate),
        slots,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (newCalendarEntries.length > 0) {
    stadium.calendar.push(...newCalendarEntries);
    await stadium.save();
  }
};
// Get all stadiums
const getAllStadiums = async (req, res) => {
  try {
    const stadiums = await Stadium.find()
      .populate("ownerId", "username email") // Populate owner info, adjust fields as needed
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stadiums.length,
      data: stadiums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stadiums",
      error: error.message,
    });
  }
};

// Get stadium by ID
const getStadiumById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    const stadium = await Stadium.findById(id).populate("ownerId", "username email");

    if (!stadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    res.status(200).json({
      success: true,
      data: stadium,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stadium",
      error: error.message,
    });
  }
};

// Add new stadium
const addStadium = async (req, res) => {
  try {
    const { ownerId, name, location, pricePerMatch, maxPlayers } = req.body;

    let penaltyPolicy, workingHours;

    try {
      penaltyPolicy = JSON.parse(req.body.penaltyPolicy);
      workingHours = JSON.parse(req.body.workingHours);
    } catch (parseError) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON structure in penaltyPolicy or workingHours" });
    }
    const loggedInUser = req.user;
    const userRole = loggedInUser.role;
    const userId = loggedInUser.userId || loggedInUser.id;

    let finalOwnerId;

    if (userRole === "admin") {
      if (ownerId) {
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
          return res.status(400).json({ success: false, message: "Invalid owner ID" });
        }

        const targetOwner = await User.findById(ownerId);
        if (!targetOwner || (targetOwner.role !== "stadiumOwner" && targetOwner.role !== "admin")) {
          return res.status(400).json({ success: false, message: "Invalid stadium owner" });
        }

        finalOwnerId = ownerId;
      } else {
        finalOwnerId = userId;
      }
    } else if (userRole === "stadiumOwner") {
      if (ownerId && ownerId !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Cannot assign to another user" });
      }
      finalOwnerId = userId;
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!name || !location || !pricePerMatch || !penaltyPolicy || !workingHours || !maxPlayers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, location, pricePerMatch, penaltyPolicy, workingHours, maxPlayers",
      });
    }

    if (!penaltyPolicy.hoursBefore || !penaltyPolicy.penaltyAmount) {
      return res.status(400).json({ success: false, message: "Invalid penalty policy" });
    }

    if (!workingHours.start || !workingHours.end) {
      return res.status(400).json({ success: false, message: "Invalid working hours" });
    }

    const existingStadium = await Stadium.findOne({
      ownerId: finalOwnerId,
      name: name.trim(),
      location: location.trim(),
    });

    if (existingStadium) {
      return res.status(400).json({ success: false, message: "Stadium already exists" });
    }

    const photos = req.files?.map((file) => `/images/stadiumsImages/${file.filename}`) || [];

    const newStadium = new Stadium({
      ownerId: finalOwnerId,
      name,
      location,
      photos: photos || [],
      pricePerMatch,
      penaltyPolicy,
      workingHours,
      maxPlayers,
      calendar: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedStadium = await newStadium.save();

    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 14);

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          user: user._id,
          message: `A new stadium "${savedStadium.name}" was added.`,
          type: "stadium-added",
          metadata: {
            stadiumId: savedStadium._id,
          },
        })
      )
    );

    await Promise.all(
      notifications.map((notification) =>
        User.findByIdAndUpdate(notification.user, {
          $push: { notifications: notification._id },
        })
      )
    );

    await fillCalendarWithSlots(savedStadium, today, endDate);
    await savedStadium.populate("ownerId", "username email");

    res.status(201).json({
      success: true,
      message: "Stadium created successfully",
      data: savedStadium,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }

    res.status(500).json({ success: false, message: "Error creating stadium", error: error.message });
  }
};

// Update stadium
const updateStadium = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid stadium ID" });
    }

    updateData.updatedAt = new Date(); // Always update timestamp

    const updatedStadium = await Stadium.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("ownerId", "username email");

    if (!updatedStadium) {
      return res.status(404).json({ success: false, message: "Stadium not found" });
    }

    if (updateData.workingHours?.start && updateData.workingHours?.end) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      updatedStadium.calendar = updatedStadium.calendar.filter(
        (entry) => entry.date < today || entry.date > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );

      await updatedStadium.save();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 14);

      await fillCalendarWithSlots(updatedStadium, today, endDate);
    }

    res.status(200).json({
      success: true,
      message: "Stadium updated successfully",
      data: updatedStadium,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }

    res.status(500).json({ success: false, message: "Error updating stadium", error: error.message });
  }
};

// Delete stadium
const deleteStadium = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    const deletedStadium = await Stadium.findByIdAndDelete(id);

    if (!deletedStadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          user: user._id,
          message: `The stadium "${deletedStadium.name}" was deleted.`,
          type: "info",
          metadata: {
            stadiumId: deletedStadium._id,
          },
        })
      )
    );

    await Promise.all(
      notifications.map((notification) =>
        User.findByIdAndUpdate(notification.user, {
          $push: { notifications: notification._id },
        })
      )
    );

    res.status(200).json({
      success: true,
      message: "Stadium deleted successfully",
      data: deletedStadium,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting stadium",
      error: error.message,
    });
  }
};

// Get stadiums by owner
const getStadiumsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner ID",
      });
    }

    const stadiums = await Stadium.find({ ownerId }).populate("ownerId", "username email").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stadiums.length,
      data: stadiums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stadiums by owner",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStadiums,
  getStadiumById,
  addStadium,
  updateStadium,
  deleteStadium,
  getStadiumsByOwner,
};
