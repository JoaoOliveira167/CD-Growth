// Middleware de upload (Multer). Responsável APENAS por receber o arquivo:
// define onde salvar, como nomear e qual tipo aceitar. A validação do
// CONTEÚDO (colunas, valores) acontece depois, na camada de service.

import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { AppError } from '../utils/AppError.js';

// Estratégia de armazenamento em disco.
const storage = multer.diskStorage({
  // Pasta de destino dos arquivos enviados.
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // Nome final: hash aleatório + extensão original. Evita colisão de nomes
  // e sobrescrita acidental quando dois usuários enviam "dados.csv".
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueName}${extension}`);
  },
});

// Filtro de tipo: só deixa passar arquivos CSV.
// Rejeita pela extensão E pelo mimetype, cobrindo as variações que o
// navegador/SO reportam para CSV.
function fileFilter(req, file, cb) {
  const isCsvExtension = path.extname(file.originalname).toLowerCase() === '.csv';
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel', // o Windows costuma reportar CSV assim
    'application/octet-stream', // fallback genérico de alguns navegadores
    'text/plain',
  ];

  if (isCsvExtension && allowedMimes.includes(file.mimetype)) {
    return cb(null, true); // aceita
  }
  // Rejeita com um AppError, que cai no tratador global como 400.
  return cb(new AppError('Formato inválido. Envie um arquivo .csv.', 400));
}

// Exporta o middleware pronto: aceita UM arquivo no campo "file",
// com limite de 5 MB para evitar uploads abusivos.
export const uploadCsv = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('file');