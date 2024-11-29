import api from '../utils/api';

class DistrictService {
  async getAllDistricts() {
    const response = await api.get('/districts');
    return response.data;
  }

  async getDistrictById(id) {
    const response = await api.get(`/districts/${id}`);
    return response.data;
  }

  async updateDistrict(id, districtData) {
    const response = await api.put(`/districts/${id}`, districtData);
    return response.data;
  }

  async addHousehold(districtId, householdData) {
    const response = await api.post(`/districts/${districtId}/households`, householdData);
    return response.data;
  }

  async updateHousehold(districtId, householdId, householdData) {
    const response = await api.put(`/districts/${districtId}/households/${householdId}`, householdData);
    return response.data;
  }

  async getDistrictStats() {
    const response = await api.get('/districts/stats');
    return response.data;
  }

  async getDistrictProgress() {
    const response = await api.get('/districts/progress');
    return response.data;
  }
}

export default new DistrictService();
