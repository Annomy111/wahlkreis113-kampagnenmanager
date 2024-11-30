const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// For Replit, we need to use port 3000 or the port provided by Replit
const PORT = parseInt(process.env.PORT || '3000');

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
    origin: '*',  // For development
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: '*',  // For development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/wahlkreis113';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', port: PORT });
});

// Routes
app.use('/api/auth', require('./server/routes/auth'));
app.use('/api/tasks', require('./server/routes/tasks'));
app.use('/api/districts', require('./server/routes/districts'));
app.use('/api/events', require('./server/routes/events'));
app.use('/api/chat', require('./server/routes/chat'));

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

// Serve static files in production or Replit environment
if (process.env.NODE_ENV === 'production' || process.env.REPL_SLUG) {
  console.log('Serving static files from client/build');
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is running in development mode.');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server with retry logic
const startServer = async (retryCount = 0) => {
  try {
    await new Promise((resolve, reject) => {
      server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Client URL: ${CLIENT_URL}`);
        resolve();
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' && retryCount < 3) {
          console.log(`Port ${PORT} is busy, retrying on port ${PORT + 1}`);
          PORT = PORT + 1;
          resolve(startServer(retryCount + 1));
        } else {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();