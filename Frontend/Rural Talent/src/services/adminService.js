import api from './api';

export const adminService = {
  async getDashboardStats() {
    return api.get('/admin/dashboard');
  },

  async listWorkers(params = {}) {
    return api.get('/admin/workers', { params });
  },

  async verifyWorker(id, data = { is_verified: 1 }) {
    return api.patch(`/admin/workers/${id}/verify`, data);
  },

  async listEmployers(params = {}) {
    return api.get('/admin/employers', { params });
  },

  async verifyEmployer(id, data = { is_verified: 1 }) {
    return api.patch(`/admin/employers/${id}/verify`, data);
  },

  async getAuditLogs(params = {}) {
    return api.get('/admin/audit-logs', { params });
  },
};
