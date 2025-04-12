const http = require('http');
const app = require('./app');
const socketIo = require('socket.io');

// Get port from environment or use default
const port = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined conversation: ${conversationId}`);
  });
  
  // Leave a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User left conversation: ${conversationId}`);
  });
  
  // Handle new message
  socket.on('send_message', (messageData) => {
    // Broadcast to all users in the conversation
    io.to(messageData.conversationId).emit('receive_message', messageData);
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      username: data.username
    });
  });
  
  // Handle mission updates
  socket.on('mission_update', (missionData) => {
    io.to(missionData.missionId).emit('mission_updated', missionData);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
