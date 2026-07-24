// Repository de Analytics: ÚNICA camada que acessa o Prisma para esta
// entidade. Sem regra de negócio — só queries.

import { prisma } from '../database/prisma.js';

export const analyticsRepository = {
  // Insere vários registros de uma vez (bulk). Muito mais rápido que
  // inserir um a um dentro de um loop.
  createMany(records) {
    return prisma.analytics.createMany({ data: records });
  },

  // Busca uma campanha pelo nome exato — usado para vincular cada linha
  // do CSV à campanha correta a partir da coluna "Campaign".
  findCampaignByName(name) {
    return prisma.campaign.findFirst({ where: { name } });
  },

  // Verifica se já existe um registro para a mesma campanha, data e origem.
  // É a base da checagem de DUPLICIDADE.
  findDuplicate({ campaignId, date, source }) {
    return prisma.analytics.findFirst({
      where: { campaignId, date, source },
    });
  },

  // Lista os analytics de uma campanha (útil para conferência depois).
  findByCampaign(campaignId) {
    return prisma.analytics.findMany({
      where: { campaignId },
      orderBy: { date: 'asc' },
    });
  },
};