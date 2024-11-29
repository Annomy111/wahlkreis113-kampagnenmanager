import io from 'socket.io-client';
import store from '../redux/store';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

// Add auth token to socket connection
socket.on('connect', () => {
  const state = store.getState();
  const token = state.auth.token;
  if (token) {
    socket.emit('authenticate', { token });
  }
});

// Handle authentication errors
socket.on('authentication_error', (error) => {
  console.error('Socket authentication error:', error);
  socket.disconnect();
});

// Reconnect handling
socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // Reconnect if server initiated disconnect
    socket.connect();
  }
});

// Connect socket when user is authenticated
store.subscribe(() => {
  const state = store.getState();
  const isAuthenticated = state.auth.isAuthenticated;
  const token = state.auth.token;

  if (isAuthenticated && token && !socket.connected) {
    socket.connect();
  } else if (!isAuthenticated && socket.connected) {
    socket.disconnect();
  }
});

export default socket;
