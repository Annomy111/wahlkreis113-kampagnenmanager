import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@material-ui/core';
import {
  Send as SendIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Person as PersonIcon
} from '@material-ui/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import io from 'socket.io-client';
import chatService from '../services/chatService';
import { setAlert } from '../redux/actions/uiActions';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: 'calc(100vh - 64px)',
  },
  chatList: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
  chatRoom: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  messageList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: theme.spacing(2),
  },
  messageInput: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  message: {
    marginBottom: theme.spacing(2),
  },
  myMessage: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 2),
    maxWidth: '70%',
    marginLeft: 'auto',
  },
  otherMessage: {
    backgroundColor: theme.palette.grey[200],
    borderRadius: theme.spacing(2),
    padding: theme.spacing(1, 2),
    maxWidth: '70%',
  },
  timestamp: {
    fontSize: '0.75rem',
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  selectedRoom: {
    backgroundColor: theme.palette.action.selected,
  },
  unreadBadge: {
    marginRight: theme.spacing(1),
  },
}));

const Chat = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [openNewRoomDialog, setOpenNewRoomDialog] = useState(false);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    type: 'group',
    participants: [],
  });
  const messageListRef = useRef(null);
  const socketRef = useRef();

  useEffect(() => {
    loadChatRooms();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    socketRef.current.on('message', (message) => {
      if (message.roomId === selectedRoom?._id) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });
  };

  const loadChatRooms = async () => {
    try {
      const data = await chatService.getChatRooms();
      setChatRooms(data);
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const data = await chatService.getMessages(roomId);
      setMessages(data);
      scrollToBottom();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    await loadMessages(room._id);
    await chatService.markMessagesAsRead(room._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message = await chatService.sendMessage(selectedRoom._id, {
        content: newMessage,
      });
      socketRef.current.emit('message', message);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const handleCreateRoom = async () => {
    try {
      await chatService.createChatRoom(newRoomData);
      dispatch(setAlert('Chat-Raum erfolgreich erstellt', 'success'));
      setOpenNewRoomDialog(false);
      loadChatRooms();
    } catch (err) {
      dispatch(setAlert(err.message, 'error'));
    }
  };

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3} style={{ height: '100%' }}>
        <Grid item xs={12} md={4} style={{ height: '100%' }}>
          <Paper className={classes.chatList}>
            <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Chats</Typography>
              <Button
                startIcon={<AddIcon />}
                color="primary"
                onClick={() => setOpenNewRoomDialog(true)}
              >
                Neuer Chat
              </Button>
            </Box>
            <Divider />
            <List>
              {chatRooms.map((room) => (
                <ListItem
                  button
                  key={room._id}
                  onClick={() => handleSelectRoom(room)}
                  className={selectedRoom?._id === room._id ? classes.selectedRoom : ''}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {room.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name}
                    secondary={`${room.participants.length} Teilnehmer`}
                  />
                  {room.unreadCount > 0 && (
                    <Badge
                      badgeContent={room.unreadCount}
                      color="primary"
                      className={classes.unreadBadge}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} style={{ height: '100%' }}>
          <Paper className={classes.chatRoom}>
            {selectedRoom ? (
              <>
                <Box p={2} bgcolor="background.paper">
                  <Typography variant="h6">{selectedRoom.name}</Typography>
                </Box>
                <Divider />
                <div className={classes.messageList} ref={messageListRef}>
                  {messages.map((message, index) => (
                    <div
                      key={message._id}
                      className={classes.message}
                    >
                      <Box
                        className={
                          message.sender._id === user._id
                            ? classes.myMessage
                            : classes.otherMessage
                        }
                      >
                        {message.sender._id !== user._id && (
                          <Typography variant="subtitle2" color="textSecondary">
                            {message.sender.name}
                          </Typography>
                        )}
                        <Typography>{message.content}</Typography>
                        <Typography className={classes.timestamp}>
                          {format(new Date(message.createdAt), 'dd.MM.yyyy HH:mm', {
                            locale: de,
                          })}
                        </Typography>
                      </Box>
                    </div>
                  ))}
                </div>
                <Divider />
                <form onSubmit={handleSendMessage} className={classes.messageInput}>
                  <Grid container spacing={2}>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Nachricht schreiben..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        type="submit"
                        disabled={!newMessage.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </form>
              </>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
              >
                <Typography variant="body1" color="textSecondary">
                  Wählen Sie einen Chat aus oder erstellen Sie einen neuen.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openNewRoomDialog}
        onClose={() => setOpenNewRoomDialog(false)}
      >
        <DialogTitle>Neuen Chat erstellen</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <TextField
              label="Name"
              value={newRoomData.name}
              onChange={(e) =>
                setNewRoomData({ ...newRoomData, name: e.target.value })
              }
              fullWidth
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Typ</InputLabel>
            <Select
              value={newRoomData.type}
              onChange={(e) =>
                setNewRoomData({ ...newRoomData, type: e.target.value })
              }
            >
              <MenuItem value="group">Gruppe</MenuItem>
              <MenuItem value="direct">Direktnachricht</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewRoomDialog(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleCreateRoom}
            color="primary"
            variant="contained"
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Chat;
