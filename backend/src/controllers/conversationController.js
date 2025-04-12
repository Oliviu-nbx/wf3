const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create a new conversation
// @route   POST /api/conversations
// @access  Private
const createConversation = async (req, res) => {
  try {
    const { type, participants, mission, title } = req.body;
    
    // Validate participants
    if (!participants || participants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Participants are required'
      });
    }
    
    // Make sure current user is included in participants
    let allParticipants = [...participants];
    if (!allParticipants.includes(req.user._id.toString())) {
      allParticipants.push(req.user._id);
    }
    
    // Check if direct conversation already exists between these users
    if (type === 'direct' && allParticipants.length === 2) {
      const existingConversation = await Conversation.findOne({
        type: 'direct',
        participants: { $all: allParticipants, $size: 2 }
      });
      
      if (existingConversation) {
        return res.status(200).json({
          success: true,
          conversation: existingConversation
        });
      }
    }
    
    // Create new conversation
    const conversation = await Conversation.create({
      type,
      participants: allParticipants,
      mission: type === 'mission' ? mission : undefined,
      title: type !== 'direct' ? title : undefined
    });
    
    // Populate participants
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name profileImage')
      .populate('mission', 'title');
    
    res.status(201).json({
      success: true,
      conversation: populatedConversation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profileImage')
      .populate('mission', 'title')
      .populate('lastMessage.sender', 'name')
      .sort({ updatedAt: -1 });
    
    res.json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name profileImage')
      .populate('mission', 'title')
      .populate('lastMessage.sender', 'name');
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this conversation'
      });
    }
    
    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add user to conversation
// @route   PUT /api/conversations/:id/participants
// @access  Private
const addParticipant = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this conversation'
      });
    }
    
    // Check if direct conversation
    if (conversation.type === 'direct') {
      return res.status(400).json({
        success: false,
        error: 'Cannot add participants to direct conversations'
      });
    }
    
    // Check if user already in conversation
    if (conversation.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already in this conversation'
      });
    }
    
    // Add user to participants
    conversation.participants.push(userId);
    await conversation.save();
    
    const updatedConversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name profileImage')
      .populate('mission', 'title');
    
    res.json({
      success: true,
      conversation: updatedConversation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Leave conversation
// @route   DELETE /api/conversations/:id/participants
// @access  Private
const leaveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Check if user is a participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'Not a participant in this conversation'
      });
    }
    
    // Check if direct conversation
    if (conversation.type === 'direct') {
      return res.status(400).json({
        success: false,
        error: 'Cannot leave direct conversations'
      });
    }
    
    // Remove user from participants
    conversation.participants = conversation.participants.filter(
      p => p.toString() !== req.user._id.toString()
    );
    
    // If no participants left, delete conversation
    if (conversation.participants.length === 0) {
      await Conversation.findByIdAndDelete(req.params.id);
      return res.json({
        success: true,
        message: 'Conversation deleted'
      });
    }
    
    await conversation.save();
    
    res.json({
      success: true,
      message: 'Left conversation successfully'
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
  createConversation,
  getConversations,
  getConversationById,
  addParticipant,
  leaveConversation
};
