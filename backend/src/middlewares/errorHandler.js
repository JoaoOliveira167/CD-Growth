// Tratador GLOBAL de erros. É o ÚLTIMO middleware registrado no app.
// Todo erro lançado em qualquer camada (via throw ou next(err)) cai aqui,
// e a resposta de erro sai sempre no mesmo formato JSON. Isso é o que
// elimina os try/catch repetidos pelos controllers.

import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // Erros "operacionais" (AppError) têm statusCode e mensagem seguros.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Erros conhecidos do Prisma (ex.: registro não encontrado no update/delete)
  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'Registro não encontrado.',
    });
  }

  // Qualquer outra coisa é um erro inesperado (bug). Logamos internamente
  // e não expomos detalhes ao cliente em produção, por segurança.
  console.error('[ERRO NÃO TRATADO]', err);

  return res.status(500).json({
    status: 'error',
    message: 'Erro interno no servidor.',
    // Só mostra o stack em desenvolvimento, para ajudar no debug.
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
};