const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['direct', 'group', 'mission'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  },
  title: {
    type: String,
    trim: true
  },
  lastMessage: {
    content: {
      type: String,
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ mission: 1 });
conversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
