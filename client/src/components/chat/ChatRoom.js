import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Paper, Typography, TextField, IconButton, List } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ChatMessage from './ChatMessage';
import socket from '../../services/socketService';

const ChatRoom = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const user = useSelector(state => state.auth.user);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Join the room
    socket.emit('join_room', roomId);

    // Listen for new messages
    socket.on('receive_message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    // Load previous messages
    socket.emit('get_messages', roomId, (response) => {
      if (response.success) {
        setMessages(response.messages);
      }
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.off('receive_message');
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        roomId,
        userId: user._id,
        userName: user.name,
        content: message,
        timestamp: new Date().toISOString(),
      };

      socket.emit('send_message', newMessage);
      setMessage('');
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              isOwnMessage={msg.userId === user._id}
            />
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Nachricht eingeben..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="small"
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatRoom;
