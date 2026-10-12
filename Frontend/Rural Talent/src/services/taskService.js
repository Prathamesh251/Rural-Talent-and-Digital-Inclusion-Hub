import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    return api.get('/tasks', { params });
  },

  async getTaskById(id) {
    return api.get(`/tasks/${id}`);
  },

  async createTask(taskData) {
    return api.post('/tasks', taskData);
  },

  async updateTask(id, taskData) {
    return api.patch(`/tasks/${id}`, taskData);
  },

  async uploadTaskFile(id, formData) {
    return api.post(`/tasks/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async getTaskRecords(id, params = {}) {
    return api.get(`/tasks/${id}/records`, { params });
  },

  async updateRecord(recordId, recordData) {
    return api.patch(`/tasks/records/${recordId}`, recordData);
  },
};
