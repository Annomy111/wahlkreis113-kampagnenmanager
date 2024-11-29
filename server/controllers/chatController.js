const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Create new chat room
// @route   POST /api/chat/rooms
// @access  Private
exports.createChatRoom = async (req, res) => {
  try {
    const { name, type, participants } = req.body;

    // Validate participants
    if (type === 'direct' && (!participants || participants.length !== 1)) {
      return res.status(400).json({
        success: false,
        message: 'Direktnachrichten benötigen genau einen Teilnehmer'
      });
    }

    // For direct messages, check if chat already exists
    if (type === 'direct') {
      const existingChat = await ChatRoom.findOne({
        type: 'direct',
        participants: { 
          $all: [req.user.id, participants[0]],
          $size: 2
        }
      });

      if (existingChat) {
        return res.json({
          success: true,
          data: existingChat
        });
      }
    }

    // Create chat room
    const chatRoom = await ChatRoom.create({
      name,
      type,
      participants: [...participants, req.user.id],
      admins: [req.user.id],
      createdBy: req.user.id
    });

    const populatedRoom = await ChatRoom.findById(chatRoom._id)
      .populate('participants', 'firstName lastName email')
      .populate('admins', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedRoom
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's chat rooms
// @route   GET /api/chat/rooms
// @access  Private
exports.getChatRooms = async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'firstName lastName email')
      .populate('admins', 'firstName lastName email')
      .populate('lastMessage')
      .populate('district', 'name code')
      .populate('event', 'title startDate')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: chatRooms.length,
      data: chatRooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get chat room messages
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat-Raum nicht gefunden'
      });
    }

    // Check if user is participant
    if (!room.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diesen Chat-Raum'
      });
    }

    const query = { chatRoom: req.params.roomId };
    if (before) {
      query.createdAt = { $lt: before };
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: messages.length,
      data: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Send message
// @route   POST /api/chat/rooms/:roomId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat-Raum nicht gefunden'
      });
    }

    // Check if user is participant
    if (!room.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Keine Berechtigung für diesen Chat-Raum'
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      content: req.body.content,
      chatRoom: req.params.roomId,
      type: req.body.type || 'text',
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName
    });

    // Update chat room's last message
    room.lastMessage = message._id;
    room.updatedAt = Date.now();
    await room.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email');

    // Emit socket event (will be implemented in socket handler)
    req.app.get('io').to(req.params.roomId).emit('newMessage', populatedMessage);

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   POST /api/chat/rooms/:roomId/read
// @access  Private
exports.markMessagesAsRead = async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat-Raum nicht gefunden'
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      {
        chatRoom: req.params.roomId,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $addToSet: {
          readBy: {
            user: req.user.id,
            readAt: Date.now()
          }
        }
      }
    );

    res.json({
      success: true,
      message: 'Nachrichten als gelesen markiert'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
