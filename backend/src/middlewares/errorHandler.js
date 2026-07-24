// Tratador GLOBAL de erros — ÚLTIMO middleware do app. Todo erro lançado em
// qualquer camada cai aqui e sai no MESMO formato JSON. É o que elimina
// try/catch espalhado pelos controllers.

import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // ── 1. Erros do Multer ──────────────────────────────────────
  // Gerados pelo próprio Multer: arquivo acima do limite de 5 MB,
  // campo de formulário inesperado, excesso de arquivos, etc.
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: `Erro no upload: ${err.message}`,
    });
  }

  // ── 2. Erros operacionais da aplicação ──────────────────────
  // Status e mensagem seguros para expor ao cliente.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      // Só inclui "errors" quando há detalhes de campo a reportar.
      ...(err.details?.length ? { errors: err.details } : {}),
    });
  }

  // ── 3. Erros conhecidos do Prisma ───────────────────────────
  // P2025: registro alvo de um update/delete não existe.
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'Registro não encontrado.',
    });
  }

  // P2003: violação de chave estrangeira (relacionamento inválido).
  if (err.code === 'P2003') {
    return res.status(400).json({
      status: 'error',
      message: 'Referência inválida: o registro relacionado não existe.',
    });
  }

  // ── 4. Erro inesperado (bug) ────────────────────────────────
  // Loga internamente e não expõe detalhes em produção, por segurança.
  console.error('[ERRO NÃO TRATADO]', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor.',
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
};