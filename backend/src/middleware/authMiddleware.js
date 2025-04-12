const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - middleware to verify JWT token
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-passwordHash');

      // Update last active
      req.user.lastActive = Date.now();
      await req.user.save({ validateBeforeSave: false });

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Not authorized as an admin'
    });
  }
};

module.exports = { protect, admin };
