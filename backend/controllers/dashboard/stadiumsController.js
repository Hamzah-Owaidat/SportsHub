const Stadium = require("../../models/stadiumModel"); // Adjust path as needed
const mongoose = require("mongoose");

const generateSlots = require("../../utils/generateSlots"); // Adjust path if needed

const fillCalendarWithSlots = async (stadium, days = 7) => {
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateExists = stadium.calendar.some((entry) => entry.date.toDateString() === date.toDateString());
    if (!dateExists) {
      const slots = generateSlots(stadium.workingHours.start, stadium.workingHours.end);
      stadium.calendar.push({
        date,
        slots,
      });
    }
  }
  await stadium.save();
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
    const {
      ownerId, // Only used by admin
      name,
      location,
      photos,
      pricePerMatch,
      penaltyPolicy,
      workingHours,
      calendar,
    } = req.body;

    // Get user info from the authenticated request
    const loggedInUser = req.user; // Assuming auth middleware adds user to req
    const userRole = loggedInUser.role;
    const userId = loggedInUser.userId || loggedInUser.id;

    let finalOwnerId;

    // Determine owner based on user role
    if (userRole === "admin") {
      // Admin can specify ownerId or use their own ID
      if (ownerId) {
        // Validate the provided ownerId
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid owner ID",
          });
        }

        // Optional: Verify the ownerId belongs to a user with stadiumOwner role
        const User = require("../../models/userModel"); // Adjust path as needed
        const targetOwner = await User.findById(ownerId);
        if (!targetOwner) {
          return res.status(400).json({
            success: false,
            message: "Owner not found",
          });
        }
        if (targetOwner.role !== "stadiumOwner" && targetOwner.role !== "admin") {
          return res.status(400).json({
            success: false,
            message: "Specified user is not a stadium owner",
          });
        }

        finalOwnerId = ownerId;
      } else {
        // If admin doesn't specify ownerId, use their own ID
        finalOwnerId = userId;
      }
    } else if (userRole === "stadiumOwner") {
      // Stadium owner can only create stadiums for themselves
      if (ownerId && ownerId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Stadium owners can only create stadiums for themselves",
        });
      }
      finalOwnerId = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to create stadium",
      });
    }

    // Validate required fields
    if (!name || !location || !pricePerMatch || !penaltyPolicy || !workingHours) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, location, pricePerMatch, penaltyPolicy, workingHours",
      });
    }

    // Validate penaltyPolicy structure
    if (!penaltyPolicy.hoursBefore || !penaltyPolicy.penaltyAmount) {
      return res.status(400).json({
        success: false,
        message: "penaltyPolicy must include hoursBefore and penaltyAmount",
      });
    }

    // Validate workingHours structure
    if (!workingHours.start || !workingHours.end) {
      return res.status(400).json({
        success: false,
        message: "workingHours must include start and end times",
      });
    }

    const existingStadium = await Stadium.findOne({
      ownerId: finalOwnerId,
      name: name.trim(),
      location: location.trim(),
    });

    if (existingStadium) {
      return res.status(400).json({
        success: false,
        message: "A stadium with this name and location already exists for this owner.",
      });
    }

    // Create new stadium
    const newStadium = new Stadium({
      ownerId: finalOwnerId,
      name,
      location,
      photos: photos || [],
      pricePerMatch,
      penaltyPolicy: {
        hoursBefore: penaltyPolicy.hoursBefore,
        penaltyAmount: penaltyPolicy.penaltyAmount,
      },
      workingHours: {
        start: workingHours.start,
        end: workingHours.end,
      },
      calendar: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedStadium = await newStadium.save();

    await fillCalendarWithSlots(savedStadium, 7);

    // Populate owner info before sending response
    await savedStadium.populate("ownerId", "username email");

    res.status(201).json({
      success: true,
      message: "Stadium created successfully",
      data: savedStadium,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating stadium",
      error: error.message,
    });
  }
};

// Update stadium
const updateStadium = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const updatedStadium = await Stadium.findByIdAndUpdate(id, updateData, {
      new: true, // Return updated document
      runValidators: true, // Run schema validations
    }).populate("ownerId", "username email");

    if (!updatedStadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    // If workingHours updated, clear and refill calendar slots for next 7 days
    if (updateData.workingHours && updateData.workingHours.start && updateData.workingHours.end) {
      // Clear calendar entries for next 7 days (or you can clear all, your choice)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      updatedStadium.calendar = updatedStadium.calendar.filter(
        (entry) => entry.date < today || entry.date > new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      );

      await updatedStadium.save();

      // Fill calendar again with new slots
      await fillCalendarWithSlots(updatedStadium, 7);
    }

    res.status(200).json({
      success: true,
      message: "Stadium updated successfully",
      data: updatedStadium,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating stadium",
      error: error.message,
    });
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

// Add calendar entry to stadium
const addCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, slots } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    if (!date || !slots) {
      return res.status(400).json({
        success: false,
        message: "Date and slots are required",
      });
    }

    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    // Check if calendar entry for this date already exists
    const existingEntry = stadium.calendar.find((entry) => entry.date.toDateString() === new Date(date).toDateString());

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "Calendar entry for this date already exists",
      });
    }

    // Add new calendar entry
    stadium.calendar.push({ date: new Date(date), slots });
    stadium.updatedAt = new Date();

    const updatedStadium = await stadium.save();

    res.status(200).json({
      success: true,
      message: "Calendar entry added successfully",
      data: updatedStadium,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding calendar entry",
      error: error.message,
    });
  }
};

// Update calendar entry
const updateCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, slots } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid stadium ID",
      });
    }

    const stadium = await Stadium.findById(id);
    if (!stadium) {
      return res.status(404).json({
        success: false,
        message: "Stadium not found",
      });
    }

    // Find and update calendar entry
    const entryIndex = stadium.calendar.findIndex(
      (entry) => entry.date.toDateString() === new Date(date).toDateString()
    );

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Calendar entry not found for this date",
      });
    }

    stadium.calendar[entryIndex].slots = slots;
    stadium.updatedAt = new Date();

    const updatedStadium = await stadium.save();

    res.status(200).json({
      success: true,
      message: "Calendar entry updated successfully",
      data: updatedStadium,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating calendar entry",
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
  addCalendarEntry,
  updateCalendarEntry,
};
