const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getNearbyUsers,
  searchUsers
} = require('../controllers/userController');

// Public routes
router.post('/', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/nearby', protect, getNearbyUsers);
router.get('/search', protect, searchUsers);

module.exports = router;
