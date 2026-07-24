// Repository de métricas: ÚNICA camada que consulta o Prisma para o
// dashboard. Devolve registros CRUS — toda agregação e cálculo acontece
// na camada de service, mantendo o repositório burro e substituível.

import { prisma } from '../database/prisma.js';

/**
 * Monta a cláusula WHERE a partir dos filtros do dashboard.
 * Centralizado aqui para não duplicar a lógica em cada consulta.
 */
function buildWhere({ startDate, endDate, campaignId, source }) {
  const where = {};

  // Intervalo de datas (gte = maior ou igual, lte = menor ou igual).
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }
  if (campaignId) where.campaignId = campaignId;
  if (source) where.source = source;

  return where;
}

export const metricsRepository = {
  /**
   * Busca registros de analytics conforme os filtros.
   * Inclui apenas o nome da campanha (não o objeto inteiro) para
   * manter o payload leve nas agregações por campanha.
   */
  findRecords(filters = {}) {
    return prisma.analytics.findMany({
      where: buildWhere(filters),
      orderBy: { date: 'asc' },
      include: {
        campaign: { select: { id: true, name: true, budget: true, goal: true } },
      },
    });
  },

  /** Lista as origens distintas presentes no banco (para filtros da UI). */
  async findDistinctSources() {
    const rows = await prisma.analytics.findMany({
      distinct: ['source'],
      select: { source: true },
      orderBy: { source: 'asc' },
    });
    return rows.map((r) => r.source);
  },
};