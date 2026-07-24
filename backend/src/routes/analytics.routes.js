// Rotas de Analytics. O middleware uploadCsv (Multer) roda ANTES do
// controller, processando o multipart/form-data e populando req.file.

import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { uploadCsv } from '../middlewares/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const analyticsRoutes = Router();

analyticsRoutes.post(
  '/import',
  uploadCsv, // 1º: recebe o arquivo
  asyncHandler(analyticsController.import), // 2º: processa e importa
);

export { analyticsRoutes };