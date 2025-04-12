const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createConversation,
  getConversations,
  getConversationById,
  addParticipant,
  leaveConversation
} = require('../controllers/conversationController');

// All routes are protected
router.use(protect);

// Conversation routes
router.route('/')
  .post(createConversation)
  .get(getConversations);

router.route('/:id')
  .get(getConversationById);

// Participant management
router.route('/:id/participants')
  .put(addParticipant)
  .delete(leaveConversation);

module.exports = router;
