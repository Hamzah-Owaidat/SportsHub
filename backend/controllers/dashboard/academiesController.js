const Academy = require("../../models/academyModel");
const Notification = require("../../models/notificationModel");
const User = require("../../models/userModel");

// GET all academies
const getAllAcademies = async (req, res) => {
  try {
    const academies = await Academy.find().populate("ownerId", "username email");
    res.json({ success: true, data: academies });
  } catch (error) {
    console.error("Error fetching academies:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET academy by ID
const getAcademyById = async (req, res) => {
  try {
    const academy = await Academy.findById(req.params.id).populate("ownerId", "username email");
    if (!academy) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }
    res.json({ success: true, data: academy });
  } catch (error) {
    console.error("Error fetching academy:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST new academy
const addAcademy = async (req, res) => {
  try {
    const newAcademy = new Academy({
      ...req.body,
      ownerId: req.user.userId || req.user.id,
    });

    const savedAcademy = await newAcademy.save();

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          user: user._id,
          message: `A new academy "${savedAcademy.name}" has been added.`,
          type: "academy-added",
          metadata: {
            academyId: savedAcademy._id,
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

    res.status(201).json({ success: true, data: savedAcademy });
  } catch (error) {
    console.error("Error adding academy:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT update academy
const updateAcademy = async (req, res) => {
  try {
    const updated = await Academy.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating academy:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE academy
const deleteAcademy = async (req, res) => {
  try {
    const deleted = await Academy.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Academy not found" });
    }

    // Notify all users
    const users = await User.find({}, "_id");
    const notifications = await Promise.all(
      users.map((user) =>
        Notification.create({
          user: user._id,
          message: `The academy "${deleted.name}" has been deleted.`,
          type: "info",
          metadata: {
            academyId: deleted._id,
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

    res.json({ success: true, message: "Academy deleted successfully" });
  } catch (error) {
    console.error("Error deleting academy:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getAllAcademies,
  getAcademyById,
  addAcademy,
  updateAcademy,
  deleteAcademy,
};
