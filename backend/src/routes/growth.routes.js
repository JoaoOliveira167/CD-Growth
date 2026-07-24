// Rotas do Growth Engine. Todas aceitam os filtros opcionais via query
// string: days, startDate, endDate e campaignId.

import { Router } from 'express';
import { growthController } from '../controllers/growth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const growthRoutes = Router();

growthRoutes.get('/analyze', asyncHandler(growthController.analyze));
growthRoutes.post('/analyze', asyncHandler(growthController.analyzeAndSave));
growthRoutes.get('/insights', asyncHandler(growthController.listInsights));
growthRoutes.delete('/insights/:id', asyncHandler(growthController.removeInsight));

export { growthRoutes };