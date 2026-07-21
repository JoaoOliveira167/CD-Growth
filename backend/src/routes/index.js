// Agregador central de rotas. Monta todos os módulos sob o prefixo /api,
// registrado no app.js. Novos módulos entram aqui com uma linha cada.

import { Router } from 'express';
import { campaignRoutes } from './campaign.routes.js';

const routes = Router();

routes.use('/campaigns', campaignRoutes);
// Fase 3: routes.use('/analytics', analyticsRoutes);
// Fase 4: routes.use('/metrics', metricsRoutes);

export { routes };