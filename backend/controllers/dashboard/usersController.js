const User = require("../../models/userModel");
const Role = require("../../models/roleModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all users
// @route   GET /dashboard/users
// @access  Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .lean();

  const transformedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role,
  }));

  res.status(200).json({
    status: "success",
    results: transformedUsers.length,
    data: {
      users: transformedUsers,
    },
  });
});

// @desc    Get single user
// @route   GET /dashboard/users/:id
// @access  Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username');

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc    Add a new user
// @route   POST /dashboard/users
// @access  Admin
exports.addUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    passwordConfirm,
    role: roleId,
    phoneNumber,
    isActive = true,
    termsAccepted = true,
  } = req.body;

  // Debug: Check if req.user exists
  console.log('req.user:', req.user);
  console.log('req.user._id:', req.user?.id);

  // Validation
  if (!username || !email || !password || !passwordConfirm || !roleId) {
    return res.status(400).json({
      status: "error",
      message: "All required fields must be filled (username, email, password, passwordConfirm, role)",
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({
      status: "error", 
      message: "Passwords do not match",
    });
  }

  // Check for existing user
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });
  
  if (existingUser) {
    return res.status(400).json({
      status: "error",
      message: existingUser.email === email ? 
        "User already exists with this email" : 
        "User already exists with this username",
    });
  }

  // Validate role
  const roleData = await Role.findById(roleId);
  if (!roleData) {
    return res.status(400).json({
      status: "error",
      message: "Invalid role selected",
    });
  }

  // Handle profile photo
  let profilePhotoPath = null;
  if (req.file) {
    profilePhotoPath = `/images/user/${req.file.filename}`;
  }

  // Prepare user data
  const userData = {
    username,
    email,
    password,
    passwordConfirm,
    role: {
      id: roleData._id,
      name: roleData.name,
    },
    phoneNumber,
    isActive,
    termsAccepted,
    profilePhoto: profilePhotoPath,
  };

  // Only add createdBy and updatedBy if req.user exists
  if (req.user && req.user.id) {
    userData.createdBy = req.user.id;
    userData.updatedBy = req.user.id;
  }

  console.log('userData before create:', userData);

  // Create user
  const newUser = await User.create(userData);

  console.log('newUser after create:', newUser);

  // Populate the created user only if createdBy/updatedBy exist
  let populatedUser;
  if (newUser.createdBy || newUser.updatedBy) {
    populatedUser = await User.findById(newUser.id)
      .populate('createdBy', 'username email')
      .populate('updatedBy', 'username email');
  } else {
    populatedUser = newUser;
  }

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      user: populatedUser,
    },
  });
});

// @desc    Update user
// @route   PUT /dashboard/users/:id
// @access  Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { 
    username, 
    email, 
    role: roleId, 
    profilePhoto, 
    isActive, 
    phoneNumber 
  } = req.body;

  // Check if user exists
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Prevent admin from changing their own active status
  if (isActive !== undefined && userId === req.user?.id?.toString()) {
    return res.status(400).json({
      status: "error",
      message: "You cannot change your own active status",
    });
  }

  const updateFields = {};
  
  // Build update fields
  if (username !== undefined) {
    // Check for duplicate username (excluding current user)
    const duplicateUsername = await User.findOne({ 
      username, 
      id: { $ne: userId } 
    });
    if (duplicateUsername) {
      return res.status(400).json({
        status: "error",
        message: "Username already exists",
      });
    }
    updateFields.username = username;
  }
  
  if (email !== undefined) {
    // Check for duplicate email (excluding current user)
    const duplicateEmail = await User.findOne({ 
      email, 
      id: { $ne: userId } 
    });
    if (duplicateEmail) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }
    updateFields.email = email;
  }
  
  if (roleId !== undefined) {
    // Validate role
    const roleData = await Role.findById(roleId);
    if (!roleData) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role selected",
      });
    }
    updateFields.role = {
      id: roleData.id,
      name: roleData.name,
    };
  }
  
  if (profilePhoto !== undefined) updateFields.profilePhoto = profilePhoto;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
  
  // Always update these fields
  updateFields.updatedBy = req.user?.id;
  updateFields.updatedAt = Date.now();

  // Handle file upload if present
  if (req.file) {
    updateFields.profilePhoto = `/images/user/${req.file.filename}`;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId, 
    updateFields, 
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('createdBy', 'username email')
    .populate('updatedBy', 'username email');

  // Create dynamic success message
  let message = "User updated successfully";
  if (isActive !== undefined) {
    const statusMessage = isActive ? "activated" : "deactivated";
    message = `User updated and ${statusMessage} successfully`;
  }

  res.status(200).json({
    status: "success",
    message: message,
    data: {
      user: updatedUser,
    },
  });
});

// @desc    Delete user
// @route   DELETE /dashboard/users/:id
// @access  Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  // Prevent admin from deleting themselves
  if (userId === req.user?._id?.toString()) {
    return res.status(400).json({
      status: "error",
      message: "You cannot delete your own account",
    });
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});
