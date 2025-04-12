const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Mission title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Mission description is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  budget: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  potentialReturns: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['invited', 'active', 'left'],
      default: 'invited'
    }
  }],
  tasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  }],
  documents: [{
    title: {
      type: String,
      trim: true
    },
    fileUrl: {
      type: String
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  expenses: [{
    description: {
      type: String,
      trim: true
    },
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    },
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      trim: true
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Create indexes
missionSchema.index({ creator: 1 });
missionSchema.index({ requiredSkills: 1 });
missionSchema.index({ location: '2dsphere' });
missionSchema.index({ status: 1 });
missionSchema.index({ category: 1 });

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;
