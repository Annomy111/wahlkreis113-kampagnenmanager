import api from '../utils/api';

class ChatService {
  async getChatRooms() {
    const response = await api.get('/chat/rooms');
    return response.data;
  }

  async getChatRoomById(roomId) {
    const response = await api.get(`/chat/rooms/${roomId}`);
    return response.data;
  }

  async createChatRoom(roomData) {
    const response = await api.post('/chat/rooms', roomData);
    return response.data;
  }

  async getMessages(roomId) {
    const response = await api.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  }

  async sendMessage(roomId, messageData) {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, messageData);
    return response.data;
  }

  async markMessagesAsRead(roomId) {
    const response = await api.put(`/chat/rooms/${roomId}/read`);
    return response.data;
  }

  async addUserToRoom(roomId, userId) {
    const response = await api.post(`/chat/rooms/${roomId}/users`, { userId });
    return response.data;
  }

  async removeUserFromRoom(roomId, userId) {
    const response = await api.delete(`/chat/rooms/${roomId}/users/${userId}`);
    return response.data;
  }
}

export default new ChatService();
