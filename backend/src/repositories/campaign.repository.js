// Repository de Campaign: ÚNICA camada que acessa o Prisma diretamente.
// Isola o ORM do resto do sistema — se um dia trocarmos SQLite por Postgres,
// ou Prisma por outra ferramenta, só este arquivo muda (inversão de
// dependência do SOLID). Não contém regra de negócio nem validação.

import { prisma } from '../database/prisma.js';

export const campaignRepository = {
  // Cria uma nova campanha com os dados já validados pela camada de service.
  create(data) {
    return prisma.campaign.create({ data });
  },

  // Retorna todas as campanhas, da mais recente para a mais antiga.
  findAll() {
    return prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  // Busca uma campanha pelo id. Retorna null se não existir.
  findById(id) {
    return prisma.campaign.findUnique({ where: { id } });
  },

  // Atualiza os campos informados de uma campanha existente.
  update(id, data) {
    return prisma.campaign.update({ where: { id }, data });
  },

  // Remove a campanha (e seus analytics em cascata, conforme o schema).
  delete(id) {
    return prisma.campaign.delete({ where: { id } });
  },
};