import api from './api';

export const assignmentService = {
  async assignWorker(data) {
    return api.post('/assignments', data);
  },

  async getAssignments(params = {}) {
    return api.get('/assignments', { params });
  },

  async getAssignmentById(id) {
    return api.get(`/assignments/${id}`);
  },

  async startAssignment(id) {
    return api.post(`/assignments/${id}/start`);
  },

  async submitAssignment(id, notes = '') {
    return api.post(`/assignments/${id}/submit`, { notes });
  },
};
