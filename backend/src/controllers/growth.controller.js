// Controller do Growth Engine. Fino por design: repassa a query ao service.

import { growthService } from '../services/growth.service.js';

export const growthController = {
  // GET /api/growth/analyze — executa e retorna, sem salvar.
  async analyze(req, res) {
    const result = await growthService.analyze(req.query);
    res.status(200).json(result);
  },

  // POST /api/growth/analyze — executa e persiste os insights.
  async analyzeAndSave(req, res) {
    const result = await growthService.analyzeAndSave(req.query);
    res.status(201).json(result);
  },

  // GET /api/growth/insights — lista os insights salvos.
  async listInsights(req, res) {
    const result = await growthService.listSaved(req.query);
    res.status(200).json(result);
  },

  // DELETE /api/growth/insights/:id
  async removeInsight(req, res) {
    await growthService.removeSaved(req.params.id);
    res.status(204).send();
  },
};