import api from '../utils/api';

class AuthService {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  }

  async changePassword(passwordData) {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  }

  logout() {
    localStorage.removeItem('token');
  }
}

export default new AuthService();
