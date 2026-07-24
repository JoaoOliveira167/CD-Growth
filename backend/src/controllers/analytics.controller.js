// Controller de Analytics. Recebe o req.file (populado pelo Multer),
// delega ao service e responde com o relatório da importação.

import { analyticsService } from '../services/analytics.service.js';

export const analyticsController = {
  // POST /api/analytics/import
  async import(req, res) {
    const report = await analyticsService.importCsv(req.file);

    // 207 seria "multi-status"; para simplicidade usamos 200 e deixamos o
    // relatório indicar o que passou e o que falhou.
    res.status(200).json({
      status: 'success',
      message: 'Importação concluída.',
      report,
    });
  },
};