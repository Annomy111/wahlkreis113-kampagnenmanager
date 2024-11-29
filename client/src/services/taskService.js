import api from '../utils/api';

class TaskService {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data;
  }

  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(id, taskData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }

  async assignTask(taskId, userId) {
    const response = await api.post(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  }

  async completeTask(taskId) {
    const response = await api.put(`/tasks/${taskId}/complete`);
    return response.data;
  }

  async getTaskStats() {
    const response = await api.get('/tasks/stats');
    return response.data;
  }
}

export default new TaskService();
