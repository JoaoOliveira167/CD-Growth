// Camada de conexão com o banco. Instancia UM único PrismaClient (singleton)
// para toda a aplicação — abrir vários clients estoura o limite de conexões
// e gera warnings no hot-reload de desenvolvimento.

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

export const prisma = new PrismaClient({
  // Em dev, logamos as queries para facilitar o debug.
  // Em produção, apenas warnings e erros, para não poluir os logs.
  log: env.isProduction ? ['warn', 'error'] : ['query', 'warn', 'error'],
});

// Fecha a conexão de forma limpa quando o processo é encerrado (Ctrl+C, deploy).
// Evita conexões pendentes ("penduradas") no banco.
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});