const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// For Replit, use port 3000
const PORT = process.env.PORT || 3000;

// Handle Replit-specific environment
const CLIENT_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : process.env.CLIENT_URL || `http://localhost:${PORT}`;

console.log('Starting server with configuration:', {
  PORT,
  CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV,
  REPL_SLUG: process.env.REPL_SLUG
});

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = 'mongodb+srv://dietermeier82:7i4XxjLYal4P0Dxx@cluster0.3lg9t.mongodb.net/jdcampaignmanager?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', port: PORT });
});

// API Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/tasks', require('./server/routes/tasks'));
app.use('/api/districts', require('./server/routes/districts'));
app.use('/api/events', require('./server/routes/events'));
app.use('/api/chat', require('./server/routes/chat'));

// Static file serving - AFTER API routes
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  console.log('Serving static files from:', clientBuildPath);
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Serving index.html');
      res.sendFile(indexPath);
    } else {
      console.log('index.html not found');
      res.status(404).send('Build not found. Please run npm run build in the client directory.');
    }
  });
} else {
  console.log('Build directory does not exist');
  app.get('*', (req, res) => {
    res.status(404).send('Build not found. Please run npm run build in the client directory.');
  });
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { roomId, message } = data;
      io.to(roomId).emit('newMessage', message);
    } catch (error) {
      console.error('Socket error:', error);
    }
  });

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Client URL: ${CLIENT_URL}`);
    // Log the contents of the build directory
    if (fs.existsSync(clientBuildPath)) {
      console.log('Build directory contents:', fs.readdirSync(clientBuildPath));
    } else {
      console.log('Build directory does not exist');
    }
  });
};

startServer();