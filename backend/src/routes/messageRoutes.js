const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  deleteMessage
} = require('../controllers/messageController');

// All routes are protected
router.use(protect);

// Message routes
router.route('/')
  .post(sendMessage);

router.route('/:id')
  .delete(deleteMessage);

router.route('/:conversationId')
  .get(getMessages);

module.exports = router;
