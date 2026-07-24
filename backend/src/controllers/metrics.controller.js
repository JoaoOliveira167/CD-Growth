// Controller de métricas: fino por design. Repassa a query string ao
// service e devolve o resultado. Nenhum cálculo aqui.

import { metricsService } from '../services/metrics.service.js';

export const metricsController = {
  // GET /api/metrics/overview
  async overview(req, res) {
    const result = await metricsService.getOverview(req.query);
    res.status(200).json(result);
  },

  // GET /api/metrics/timeseries?groupBy=day|week|month
  async timeSeries(req, res) {
    const result = await metricsService.getTimeSeries(req.query);
    res.status(200).json(result);
  },

  // GET /api/metrics/by-source
  async bySource(req, res) {
    const result = await metricsService.getBySource(req.query);
    res.status(200).json(result);
  },

  // GET /api/metrics/by-campaign
  async byCampaign(req, res) {
    const result = await metricsService.getByCampaign(req.query);
    res.status(200).json(result);
  },

  // GET /api/metrics/filters
  async filters(req, res) {
    const result = await metricsService.getFilterOptions();
    res.status(200).json(result);
  },
};