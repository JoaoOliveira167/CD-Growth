// Rotas de Campaign. Só declaram endpoints e amarram ao controller.
// O asyncHandler envolve cada método para que erros assíncronos sejam
// capturados e encaminhados ao errorHandler global.

import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const campaignRoutes = Router();

campaignRoutes.get('/', asyncHandler(campaignController.list));
campaignRoutes.get('/:id', asyncHandler(campaignController.getById));
campaignRoutes.post('/', asyncHandler(campaignController.create));
campaignRoutes.put('/:id', asyncHandler(campaignController.update));
campaignRoutes.delete('/:id', asyncHandler(campaignController.remove));

export { campaignRoutes };