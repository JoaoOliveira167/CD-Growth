// Controller de Campaign: camada de adaptação HTTP.
// Extrai dados de req, chama o service, aplica o DTO de saída e responde.
// NÃO acessa o banco, NÃO valida regra de negócio. Sem try/catch — o
// asyncHandler encaminha qualquer erro ao tratador global.

import { campaignService } from '../services/campaign.service.js';
import {
  campaignResponseDTO,
  campaignListResponseDTO,
} from '../dtos/campaign.dto.js';

export const campaignController = {
  // POST /api/campaigns
  async create(req, res) {
    const campaign = await campaignService.create(req.body);
    res.status(201).json(campaignResponseDTO(campaign)); // 201 Created
  },

  // GET /api/campaigns?source=Google&goal=Vendas
  async list(req, res) {
    const { source, goal } = req.query;
    const campaigns = await campaignService.list({ source, goal });

    res.status(200).json({
      total: campaigns.length,
      data: campaignListResponseDTO(campaigns),
    });
  },

  // GET /api/campaigns/:id
  async getById(req, res) {
    const campaign = await campaignService.getById(req.params.id);
    res.status(200).json(campaignResponseDTO(campaign));
  },

  // PUT /api/campaigns/:id
  async update(req, res) {
    const campaign = await campaignService.update(req.params.id, req.body);
    res.status(200).json(campaignResponseDTO(campaign));
  },

  // DELETE /api/campaigns/:id
  async remove(req, res) {
    await campaignService.remove(req.params.id);
    res.status(204).send(); // 204 No Content
  },
};