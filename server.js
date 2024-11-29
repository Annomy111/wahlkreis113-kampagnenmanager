const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/wahlkreis113', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/tasks', require('./server/routes/tasks'));
app.use('/api/districts', require('./server/routes/districts'));
app.use('/api/events', require('./server/routes/events'));
app.use('/api/chat', require('./server/routes/chat'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join chat rooms
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Leave chat rooms
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  // Handle new messages
  socket.on('sendMessage', async (data) => {
    try {
      const { roomId, message } = data;
      io.to(roomId).emit('newMessage', message);
    } catch (error) {
      console.error('Socket error:', error);
    }
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('userTyping', {
      userId: data.userId,
      typing: data.typing
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
