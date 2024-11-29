import api from '../utils/api';

class EventService {
  async getAllEvents() {
    const response = await api.get('/events');
    return response.data;
  }

  async getEventById(id) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  }

  async createEvent(eventData) {
    const response = await api.post('/events', eventData);
    return response.data;
  }

  async updateEvent(id, eventData) {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  }

  async deleteEvent(id) {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  }

  async registerForEvent(eventId) {
    const response = await api.post(`/events/${eventId}/register`);
    return response.data;
  }

  async unregisterFromEvent(eventId) {
    const response = await api.delete(`/events/${eventId}/register`);
    return response.data;
  }

  async getEventParticipants(eventId) {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  }

  async submitEventFeedback(eventId, feedbackData) {
    const response = await api.post(`/events/${eventId}/feedback`, feedbackData);
    return response.data;
  }
}

export default new EventService();
