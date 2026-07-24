// Serviço do Growth Engine (insights automáticos).

import { api } from './api.js';

export const growthService = {
  // Executa a análise sem persistir. Params: days, startDate, endDate, campaignId
  analyze: (params) => api.get('/growth/analyze', { params }).then((r) => r.data),

  // Executa e salva os insights no banco.
  analyzeAndSave: (params) =>
    api.post('/growth/analyze', null, { params }).then((r) => r.data),

  listInsights: (params) =>
    api.get('/growth/insights', { params }).then((r) => r.data),

  removeInsight: (id) => api.delete(`/growth/insights/${id}`).then((r) => r.data),
};