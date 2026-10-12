import api from './api';

export const paymentService = {
  async getPayments(params = {}) {
    return api.get('/payments', { params });
  },

  async recordPayment(paymentData) {
    return api.post('/payments', paymentData);
  },
};
