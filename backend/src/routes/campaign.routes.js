// Rotas de Campaign. Declaram os endpoints e ligam cada um ao método
// correspondente do controller. O asyncHandler envolve cada método para que
// qualquer erro assíncrono seja capturado e enviado ao errorHandler global.

import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const campaignRoutes = Router();

campaignRoutes.post('/', asyncHandler(campaignController.create));
campaignRoutes.get('/', asyncHandler(campaignController.list));
campaignRoutes.get('/:id', asyncHandler(campaignController.getById));
campaignRoutes.put('/:id', asyncHandler(campaignController.update));
campaignRoutes.delete('/:id', asyncHandler(campaignController.remove));

export { campaignRoutes };