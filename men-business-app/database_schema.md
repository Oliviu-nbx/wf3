# Men's Business Collaboration App - Database Schema

## Overview

This document outlines the database schema for the men's business collaboration mobile application. The schema is designed for MongoDB, a NoSQL document database, which provides flexibility for evolving data models while maintaining relationships between collections.

## Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number, Number] // [longitude, latitude]
  },
  skills: [String],
  experience: String,
  missionInterests: [String],
  financialResources: String,
  investmentGoals: String,
  profileImage: String, // URL to Firebase Storage
  createdAt: Date,
  updatedAt: Date,
  lastActive: Date,
  isVerified: Boolean,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  level: Number,
  badges: [{ 
    type: String, 
    earnedAt: Date 
  }],
  rating: {
    average: Number,
    count: Number
  },
  notificationSettings: {
    email: Boolean,
    push: Boolean,
    missionInvites: Boolean,
    messages: Boolean,
    updates: Boolean
  }
}
```

Indexes:
- `email`: Unique index
- `location`: 2dsphere index for geospatial queries
- `skills`: Index for skill-based searches
- `missionInterests`: Index for interest-based matching

### Missions Collection

```javascript
{
  _id: ObjectId,
  creator: { type: ObjectId, ref: 'Users' },
  title: String,
  description: String,
  category: String,
  requiredSkills: [String],
  budget: {
    amount: Number,
    currency: String
  },
  potentialReturns: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String
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
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date,
  team: [{
    user: { type: ObjectId, ref: 'Users' },
    role: String,
    joinedAt: Date,
    status: { type: String, enum: ['invited', 'active', 'left'] }
  }],
  tasks: [{
    title: String,
    description: String,
    assignedTo: { type: ObjectId, ref: 'Users' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'] },
    dueDate: Date,
    completedAt: Date
  }],
  documents: [{
    title: String,
    fileUrl: String, // URL to Firebase Storage
    uploadedBy: { type: ObjectId, ref: 'Users' },
    uploadedAt: Date
  }],
  expenses: [{
    description: String,
    amount: Number,
    currency: String,
    date: Date,
    category: String,
    paidBy: { type: ObjectId, ref: 'Users' }
  }],
  views: Number,
  applications: [{
    user: { type: ObjectId, ref: 'Users' },
    message: String,
    status: { type: String, enum: ['pending', 'accepted', 'rejected'] },
    appliedAt: Date,
    respondedAt: Date
  }]
}
```

Indexes:
- `creator`: Index for creator-based queries
- `requiredSkills`: Index for skill-based searches
- `location`: 2dsphere index for geospatial queries
- `status`: Index for status-based filtering
- `category`: Index for category-based searches

### Messages Collection

```javascript
{
  _id: ObjectId,
  conversation: { type: ObjectId, ref: 'Conversations' },
  sender: { type: ObjectId, ref: 'Users' },
  content: String,
  attachments: [{
    fileUrl: String, // URL to Firebase Storage
    fileType: String,
    fileName: String
  }],
  createdAt: Date,
  readBy: [{ 
    user: { type: ObjectId, ref: 'Users' },
    readAt: Date
  }]
}
```

Indexes:
- `conversation`: Index for conversation-based queries
- `sender`: Index for sender-based queries
- `createdAt`: Index for time-based sorting

### Conversations Collection

```javascript
{
  _id: ObjectId,
  type: { type: String, enum: ['direct', 'group', 'mission'] },
  participants: [{ type: ObjectId, ref: 'Users' }],
  mission: { type: ObjectId, ref: 'Missions' }, // If mission-related
  title: String, // For group conversations
  createdAt: Date,
  updatedAt: Date,
  lastMessage: {
    content: String,
    sender: { type: ObjectId, ref: 'Users' },
    sentAt: Date
  }
}
```

Indexes:
- `participants`: Index for participant-based queries
- `mission`: Index for mission-based conversations
- `updatedAt`: Index for sorting by recent activity

### Reviews Collection

```javascript
{
  _id: ObjectId,
  reviewer: { type: ObjectId, ref: 'Users' },
  reviewee: { type: ObjectId, ref: 'Users' },
  mission: { type: ObjectId, ref: 'Missions' },
  rating: Number, // 1-5
  content: String,
  createdAt: Date,
  updatedAt: Date,
  helpfulVotes: Number,
  reports: [{
    user: { type: ObjectId, ref: 'Users' },
    reason: String,
    reportedAt: Date
  }]
}
```

Indexes:
- `reviewer`: Index for reviewer-based queries
- `reviewee`: Index for reviewee-based queries
- `mission`: Index for mission-based reviews
- `rating`: Index for rating-based sorting

### Events Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  organizer: { type: ObjectId, ref: 'Users' },
  category: String,
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,
    virtual: Boolean,
    meetingLink: String // If virtual
  },
  startDate: Date,
  endDate: Date,
  createdAt: Date,
  updatedAt: Date,
  attendees: [{
    user: { type: ObjectId, ref: 'Users' },
    status: { type: String, enum: ['interested', 'going', 'not-going'] },
    respondedAt: Date
  }],
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  image: String // URL to Firebase Storage
}
```

Indexes:
- `organizer`: Index for organizer-based queries
- `startDate`: Index for date-based queries
- `location`: 2dsphere index for geospatial queries
- `category`: Index for category-based searches

### ForumPosts Collection

```javascript
{
  _id: ObjectId,
  author: { type: ObjectId, ref: 'Users' },
  title: String,
  content: String,
  category: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date,
  views: Number,
  upvotes: Number,
  downvotes: Number,
  comments: [{
    author: { type: ObjectId, ref: 'Users' },
    content: String,
    createdAt: Date,
    updatedAt: Date,
    upvotes: Number,
    downvotes: Number
  }],
  reports: [{
    user: { type: ObjectId, ref: 'Users' },
    reason: String,
    reportedAt: Date
  }]
}
```

Indexes:
- `author`: Index for author-based queries
- `category`: Index for category-based searches
- `tags`: Index for tag-based searches
- `createdAt`: Index for time-based sorting
- `upvotes`: Index for popularity-based sorting

### SuccessStories Collection

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: { type: ObjectId, ref: 'Users' },
  mission: { type: ObjectId, ref: 'Missions' },
  images: [String], // URLs to Firebase Storage
  createdAt: Date,
  updatedAt: Date,
  featured: Boolean,
  views: Number,
  likes: Number,
  comments: [{
    author: { type: ObjectId, ref: 'Users' },
    content: String,
    createdAt: Date,
    updatedAt: Date
  }]
}
```

Indexes:
- `author`: Index for author-based queries
- `mission`: Index for mission-based stories
- `featured`: Index for featured stories
- `createdAt`: Index for time-based sorting
- `likes`: Index for popularity-based sorting

### Notifications Collection

```javascript
{
  _id: ObjectId,
  recipient: { type: ObjectId, ref: 'Users' },
  type: String, // e.g., 'mission_invite', 'message', 'review'
  title: String,
  content: String,
  relatedTo: {
    model: String, // e.g., 'Missions', 'Messages'
    id: ObjectId
  },
  createdAt: Date,
  read: Boolean,
  readAt: Date
}
```

Indexes:
- `recipient`: Index for recipient-based queries
- `read`: Index for read/unread filtering
- `createdAt`: Index for time-based sorting

### Quests Collection (Gamification)

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  requirements: [{
    type: String, // e.g., 'complete_profile', 'join_mission', 'create_mission'
    count: Number, // How many times this action needs to be performed
    currentProgress: Number // Current progress towards the requirement
  }],
  reward: {
    type: String, // e.g., 'badge', 'points', 'level'
    value: String // Badge name, points amount, or level number
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  createdAt: Date,
  updatedAt: Date,
  active: Boolean
}
```

Indexes:
- `difficulty`: Index for difficulty-based filtering
- `active`: Index for active quests filtering

### UserQuests Collection (User-Quest Relationship)

```javascript
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'Users' },
  quest: { type: ObjectId, ref: 'Quests' },
  progress: Number, // Percentage of completion
  requirements: [{
    type: String,
    count: Number,
    currentProgress: Number
  }],
  startedAt: Date,
  completedAt: Date,
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'] }
}
```

Indexes:
- `user`: Index for user-based queries
- `quest`: Index for quest-based queries
- `status`: Index for status-based filtering

## Relationships

1. **Users to Missions**: One-to-many (creator) and many-to-many (team members)
2. **Users to Messages**: One-to-many (sender)
3. **Users to Conversations**: Many-to-many (participants)
4. **Users to Reviews**: One-to-many (reviewer) and one-to-many (reviewee)
5. **Users to Events**: One-to-many (organizer) and many-to-many (attendees)
6. **Users to ForumPosts**: One-to-many (author)
7. **Users to SuccessStories**: One-to-many (author)
8. **Users to Notifications**: One-to-many (recipient)
9. **Users to UserQuests**: One-to-many
10. **Missions to Tasks**: One-to-many
11. **Missions to Documents**: One-to-many
12. **Missions to Expenses**: One-to-many
13. **Missions to Applications**: One-to-many
14. **Missions to SuccessStories**: One-to-many
15. **Conversations to Messages**: One-to-many

## Data Validation and Constraints

1. **Email Validation**: Regex pattern for valid email format
2. **Password Strength**: Minimum length and complexity requirements
3. **Rating Range**: 1-5 stars
4. **Date Validation**: End dates must be after start dates
5. **Location Validation**: Valid coordinates within acceptable ranges
6. **Currency Validation**: Supported currency codes only
7. **Status Transitions**: Valid state transitions for missions and tasks

## Data Migration and Versioning

The schema is designed to be flexible for future enhancements. As the application evolves:

1. **Field Additions**: New fields can be added without disrupting existing documents
2. **Embedded vs. Referenced**: Current design balances between embedded documents and references based on access patterns
3. **Schema Versioning**: Consider adding a schemaVersion field to collections for future migrations

This database schema provides a comprehensive foundation for the men's business collaboration application, supporting all required features while maintaining flexibility for future growth and enhancements.
