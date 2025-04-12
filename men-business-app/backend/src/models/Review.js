const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  content: {
    type: String,
    trim: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      trim: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create indexes
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ mission: 1 });
reviewSchema.index({ rating: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
