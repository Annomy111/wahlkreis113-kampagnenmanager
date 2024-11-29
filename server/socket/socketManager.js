const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');

class SocketManager {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
  }

  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.name}`);
      this.connectedUsers.set(socket.user._id.toString(), socket.id);

      this.handleConnection(socket);
    });
  }

  handleConnection(socket) {
    // Join room
    socket.on('join_room', async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is a participant
        if (!room.participants.includes(socket.user._id)) {
          socket.emit('error', { message: 'Not authorized to join this room' });
          return;
        }

        socket.join(roomId);
        console.log(`${socket.user.name} joined room: ${roomId}`);
      } catch (error) {
        socket.emit('error', { message: 'Error joining room' });
      }
    });

    // Leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.user.name} left room: ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (messageData) => {
      try {
        const { roomId, content } = messageData;

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const message = new Message({
          room: roomId,
          sender: socket.user._id,
          content,
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name')
          .lean();

        this.io.to(roomId).emit('receive_message', {
          ...populatedMessage,
          userName: socket.user.name,
        });

        // Send notifications to other participants
        room.participants.forEach((participantId) => {
          const participantSocketId = this.connectedUsers.get(participantId.toString());
          if (participantSocketId && participantSocketId !== socket.id) {
            this.io.to(participantSocketId).emit('new_message_notification', {
              roomId,
              message: populatedMessage,
            });
          }
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Get room messages
    socket.on('get_messages', async (roomId, callback) => {
      try {
        const messages = await Message.find({ room: roomId })
          .populate('sender', 'name')
          .sort({ createdAt: 1 })
          .lean();

        const formattedMessages = messages.map(msg => ({
          ...msg,
          userName: msg.sender.name,
        }));

        callback({ success: true, messages: formattedMessages });
      } catch (error) {
        console.error('Error getting messages:', error);
        callback({ success: false, error: 'Error getting messages' });
      }
    });

    // Handle typing status
    socket.on('typing_start', ({ roomId }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name,
      });
    });

    socket.on('typing_end', ({ roomId }) => {
      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.user._id,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
      this.connectedUsers.delete(socket.user._id.toString());
    });
  }
}

module.exports = SocketManager;
