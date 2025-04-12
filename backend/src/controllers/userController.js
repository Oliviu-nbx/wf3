const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      email,
      passwordHash: password,
      name
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Update last active
      user.lastActive = Date.now();
      await user.save();

      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');

    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.skills = req.body.skills || user.skills;
      user.experience = req.body.experience || user.experience;
      user.missionInterests = req.body.missionInterests || user.missionInterests;
      user.financialResources = req.body.financialResources || user.financialResources;
      user.investmentGoals = req.body.investmentGoals || user.investmentGoals;
      user.profileImage = req.body.profileImage || user.profileImage;
      
      if (req.body.location) {
        user.location = req.body.location;
      }
      
      if (req.body.notificationSettings) {
        user.notificationSettings = {
          ...user.notificationSettings,
          ...req.body.notificationSettings
        };
      }
      
      if (req.body.password) {
        user.passwordHash = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          skills: updatedUser.skills,
          experience: updatedUser.experience,
          missionInterests: updatedUser.missionInterests,
          financialResources: updatedUser.financialResources,
          investmentGoals: updatedUser.investmentGoals,
          profileImage: updatedUser.profileImage,
          location: updatedUser.location,
          notificationSettings: updatedUser.notificationSettings,
          token: generateToken(updatedUser._id)
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get users by location
// @route   GET /api/users/nearby
// @access  Private
const getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query; // maxDistance in meters, default 50km

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        error: 'Longitude and latitude are required'
      });
    }

    const users = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('-passwordHash');

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Search users by skills
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { skills, interests, query } = req.query;
    
    let searchQuery = {};
    
    if (skills) {
      searchQuery.skills = { $in: skills.split(',') };
    }
    
    if (interests) {
      searchQuery.missionInterests = { $in: interests.split(',') };
    }
    
    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { experience: { $regex: query, $options: 'i' } }
      ];
    }
    
    const users = await User.find(searchQuery).select('-passwordHash');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyUsers,
  searchUsers
};
