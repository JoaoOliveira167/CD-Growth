// Rotas de métricas do dashboard. Todas aceitam os filtros opcionais
// via query string: startDate, endDate, campaignId, source,
// purchaseFrequency e customerLifespanMonths.

import { Router } from 'express';
import { metricsController } from '../controllers/metrics.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const metricsRoutes = Router();

metricsRoutes.get('/overview', asyncHandler(metricsController.overview));
metricsRoutes.get('/timeseries', asyncHandler(metricsController.timeSeries));
metricsRoutes.get('/by-source', asyncHandler(metricsController.bySource));
metricsRoutes.get('/by-campaign', asyncHandler(metricsController.byCampaign));
metricsRoutes.get('/filters', asyncHandler(metricsController.filters));

export { metricsRoutes };