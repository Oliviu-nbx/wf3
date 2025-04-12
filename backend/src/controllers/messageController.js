const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, attachments } = req.body;
    
    // Validate required fields
    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID and content are required'
      });
    }
    
    // Check if conversation exists
    const conversation = await Conversation.findById(conversationId);
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
        error: 'Not authorized to send messages in this conversation'
      });
    }
    
    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      attachments: attachments || [],
      readBy: [{ user: req.user._id, readAt: Date.now() }]
    });
    
    // Update conversation's lastMessage
    conversation.lastMessage = {
      content,
      sender: req.user._id,
      sentAt: Date.now()
    };
    
    await conversation.save();
    
    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage')
      .populate('readBy.user', 'name');
    
    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Check if conversation exists
    const conversation = await Conversation.findById(req.params.conversationId);
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
        error: 'Not authorized to view messages in this conversation'
      });
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages
    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name profileImage')
      .populate('readBy.user', 'name');
    
    // Get total count
    const total = await Message.countDocuments({ conversation: req.params.conversationId });
    
    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: req.params.conversationId,
        'readBy.user': { $ne: req.user._id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user._id, 
            readAt: Date.now() 
          } 
        } 
      }
    );
    
    res.json({
      success: true,
      count: messages.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      page: parseInt(page),
      messages: messages.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this message'
      });
    }
    
    // Check if message is less than 5 minutes old
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (message.createdAt < fiveMinutesAgo) {
      return res.status(400).json({
        success: false,
        error: 'Messages can only be deleted within 5 minutes of sending'
      });
    }
    
    await message.remove();
    
    res.json({
      success: true,
      message: 'Message deleted'
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
  sendMessage,
  getMessages,
  deleteMessage
};
