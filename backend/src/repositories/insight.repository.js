// Repository de Insight: ÚNICA camada que acessa o Prisma para esta entidade.

import { prisma } from '../database/prisma.js';

export const insightRepository = {
  // Insere vários insights de uma vez.
  createMany(insights) {
    return prisma.insight.createMany({ data: insights });
  },

  // Lista insights salvos, com filtro opcional por severidade.
  findAll({ level } = {}) {
    return prisma.insight.findMany({
      where: level ? { level } : {},
      orderBy: { createdAt: 'desc' },
    });
  },

  // Apaga todos os insights — usado para substituir o diagnóstico anterior.
  deleteAll() {
    return prisma.insight.deleteMany();
  },

  // Remove um insight específico (ex.: usuário marcou como resolvido).
  delete(id) {
    return prisma.insight.delete({ where: { id } });
  },
};