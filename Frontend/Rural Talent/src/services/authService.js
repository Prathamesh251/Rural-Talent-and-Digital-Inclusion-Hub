import api from './api';

export const authService = {
  async register(data) {
    return api.post('/auth/register', data);
  },

  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  async getProfile() {
    return api.get('/auth/me');
  },

  async updateProfile(profileData) {
    return api.patch('/auth/profile', profileData);
  },
};
