const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createChatRoom,
  getChatRooms,
  getChatMessages,
  sendMessage,
  markMessagesAsRead
} = require('../controllers/chatController');

router.route('/rooms')
  .post(protect, createChatRoom)
  .get(protect, getChatRooms);

router.route('/rooms/:roomId/messages')
  .get(protect, getChatMessages)
  .post(protect, sendMessage);

router.post('/rooms/:roomId/read', protect, markMessagesAsRead);

module.exports = router;
