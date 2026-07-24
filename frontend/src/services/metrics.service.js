// Serviço de métricas. Cada função espelha um endpoint do backend.

import { api } from './api.js';

export const metricsService = {
  // Filtros aceitos: startDate, endDate, campaignId, source
  getOverview: (params) =>
    api.get('/metrics/overview', { params }).then((r) => r.data),

  // groupBy: 'day' | 'week' | 'month'
  getTimeSeries: (params) =>
    api.get('/metrics/timeseries', { params }).then((r) => r.data),

  getBySource: (params) =>
    api.get('/metrics/by-source', { params }).then((r) => r.data),

  getByCampaign: (params) =>
    api.get('/metrics/by-campaign', { params }).then((r) => r.data),

  getFilters: () => api.get('/metrics/filters').then((r) => r.data),
};