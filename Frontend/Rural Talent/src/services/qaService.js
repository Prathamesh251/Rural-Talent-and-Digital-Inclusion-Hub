import api from './api';

export const qaService = {
  async getQAReviews(params = {}) {
    return api.get('/qa', { params });
  },

  async reviewSubmission(submissionId, reviewData) {
    return api.post(`/qa/submissions/${submissionId}`, reviewData);
  },
};
