// Controller de Campaign: camada de adaptação HTTP. Extrai dados de req,
// chama o service e devolve status + JSON. NÃO acessa o banco nem valida
// regra de negócio — tudo isso é responsabilidade do service.

import { campaignService } from '../services/campaign.service.js';

export const campaignController = {
  // POST /api/campaigns — cria uma campanha.
  async create(req, res) {
    const campaign = await campaignService.create(req.body);
    res.status(201).json(campaign); // 201 = Created
  },

  // GET /api/campaigns — lista todas.
  async list(req, res) {
    const campaigns = await campaignService.list();
    res.json(campaigns);
  },

  // GET /api/campaigns/:id — detalha uma campanha.
  async getById(req, res) {
    const campaign = await campaignService.getById(req.params.id);
    res.json(campaign);
  },

  // PUT /api/campaigns/:id — atualiza.
  async update(req, res) {
    const campaign = await campaignService.update(req.params.id, req.body);
    res.json(campaign);
  },

  // DELETE /api/campaigns/:id — remove.
  async remove(req, res) {
    await campaignService.remove(req.params.id);
    res.status(204).send(); // 204 = No Content (sucesso sem corpo)
  },
};