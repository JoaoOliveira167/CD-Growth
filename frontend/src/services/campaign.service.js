// Serviço de campanhas — CRUD completo.

import { api } from './api.js';

export const campaignService = {
  list: (params) => api.get('/campaigns', { params }).then((r) => r.data),
  getById: (id) => api.get(`/campaigns/${id}`).then((r) => r.data),
  create: (data) => api.post('/campaigns', data).then((r) => r.data),
  update: (id, data) => api.put(`/campaigns/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/campaigns/${id}`).then((r) => r.data),
};