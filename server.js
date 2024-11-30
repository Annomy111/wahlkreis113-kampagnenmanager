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

// Update PORT for Replit - try different ports if one is in use
const PORT = process.env.PORT || 3001;

// Handle Replit-specific environment
const CLIENT_URL = process.env.REPL_SLUG 
  ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
  : process.env.CLIENT_URL || `http://localhost:${PORT}`;

console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  REPL_SLUG: process.env.REPL_SLUG,
  CLIENT_URL,
  PORT
});

const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available in routes
app.set('io', io);

// Middleware
app.use(cors({
  origin: CLIENT_URL,
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

// Debug route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
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
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  console.log('Client build path:', clientBuildPath);
  
  // Verify the build directory exists
  const fs = require('fs');
  if (fs.existsSync(clientBuildPath)) {
    console.log('Client build directory exists');
    console.log('Contents:', fs.readdirSync(clientBuildPath));
  } else {
    console.log('Client build directory does not exist');
  }

  // Serve static files from the React app
  app.use(express.static(clientBuildPath));
  
  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    console.log(`Request for: ${req.url}`);
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Build not found. Please run npm run build in the client directory.');
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is running in development mode. Please start the React development server.');
  });
}

// Error handling for server start
const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Client URL: ${CLIENT_URL}`);
  })
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${PORT} is busy, trying port ${PORT + 1}`);
      setTimeout(() => {
        server.close();
        server.listen(PORT + 1);
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Kill any existing process on the port (only in development)
if (process.env.NODE_ENV !== 'production') {
  const killPort = require('kill-port');
  killPort(PORT)
    .then(() => {
      console.log(`Killed process on port ${PORT}`);
      startServer();
    })
    .catch(() => {
      // If kill-port fails or port wasn't in use, start server anyway
      startServer();
    });
} else {
  startServer();
}