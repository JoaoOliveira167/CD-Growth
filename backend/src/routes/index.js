// Agregador central de rotas. Monta todos os módulos sob o prefixo /api.

import { Router } from 'express';
import { campaignRoutes } from './campaign.routes.js';
import { analyticsRoutes } from './analytics.routes.js';
import { metricsRoutes } from './metrics.routes.js';
import { growthRoutes } from './growth.routes.js';

const routes = Router();

routes.use('/campaigns', campaignRoutes);
routes.use('/analytics', analyticsRoutes);
routes.use('/metrics', metricsRoutes);
routes.use('/growth', growthRoutes);

export { routes };