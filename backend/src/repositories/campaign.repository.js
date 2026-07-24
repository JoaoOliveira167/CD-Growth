// Repository de Campaign: ÚNICA camada que acessa o Prisma diretamente.
// Isola o ORM do restante do sistema (inversão de dependência do SOLID):
// trocar SQLite por Postgres, ou Prisma por outro ORM, muda só este arquivo.
// Não contém regra de negócio nem validação.

import { prisma } from '../database/prisma.js';

// Inclui a contagem de registros de analytics relacionados, sem carregar
// todos eles — útil para a listagem do dashboard.
const withAnalyticsCount = {
  _count: { select: { analytics: true } },
};

export const campaignRepository = {
  // Insere uma nova campanha (dados já validados pelo DTO).
  create(data) {
    return prisma.campaign.create({
      data,
      include: withAnalyticsCount,
    });
  },

  /**
   * Lista campanhas com filtros opcionais.
   * @param {object} filters { source, goal }
   */
  findAll(filters = {}) {
    const where = {};

    // Filtros aplicados apenas quando informados.
    if (filters.source) {
      where.source = { contains: filters.source };
    }
    if (filters.goal) {
      where.goal = filters.goal;
    }

    return prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // mais recentes primeiro
      include: withAnalyticsCount,
    });
  },

  // Busca por id. Retorna null quando não existe.
  findById(id) {
    return prisma.campaign.findUnique({
      where: { id },
      include: withAnalyticsCount,
    });
  },

  // Verifica duplicidade de nome (usado na regra de negócio do service).
  // O parâmetro exceptId permite ignorar o próprio registro em updates.
  findByName(name, exceptId = null) {
    return prisma.campaign.findFirst({
      where: {
        name,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
  },

  // Atualiza os campos informados.
  update(id, data) {
    return prisma.campaign.update({
      where: { id },
      data,
      include: withAnalyticsCount,
    });
  },

  // Remove a campanha (analytics são apagados em cascata, conforme o schema).
  delete(id) {
    return prisma.campaign.delete({ where: { id } });
  },
};