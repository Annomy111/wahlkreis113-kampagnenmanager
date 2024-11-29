import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Typography,
  Badge,
  Divider,
  IconButton,
  Box,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import CreateChatRoomDialog from './CreateChatRoomDialog';
import chatService from '../../services/chatService';
import socket from '../../services/socketService';

const ChatList = ({ onSelectRoom, selectedRoomId }) => {
  const [rooms, setRooms] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    loadRooms();

    socket.on('new_message_notification', ({ roomId }) => {
      if (roomId !== selectedRoomId) {
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: (prev[roomId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off('new_message_notification');
    };
  }, [selectedRoomId]);

  const loadRooms = async () => {
    try {
      const response = await chatService.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const handleRoomSelect = (roomId) => {
    onSelectRoom(roomId);
    setUnreadCounts(prev => ({
      ...prev,
      [roomId]: 0,
    }));
  };

  const handleCreateRoom = async (roomData) => {
    try {
      await chatService.createRoom(roomData);
      loadRooms();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Typography variant="h6">Chat Räume</Typography>
        <IconButton
          color="primary"
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ width: '100%' }}>
        {rooms.map((room) => (
          <ListItem
            key={room._id}
            disablePadding
            secondaryAction={
              unreadCounts[room._id] ? (
                <Badge
                  badgeContent={unreadCounts[room._id]}
                  color="primary"
                  sx={{ mr: 2 }}
                />
              ) : null
            }
          >
            <ListItemButton
              selected={selectedRoomId === room._id}
              onClick={() => handleRoomSelect(room._id)}
            >
              <ListItemAvatar>
                <Avatar>
                  <GroupIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={room.name}
                secondary={`${room.participants.length} Teilnehmer`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <CreateChatRoomDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateRoom}
      />
    </Box>
  );
};

export default ChatList;
