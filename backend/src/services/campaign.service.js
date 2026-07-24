// Service de Campaign: coração da regra de negócio.
// Orquestra DTO (validação) + Repository (persistência) e aplica invariantes
// do domínio, como unicidade de nome. NÃO conhece req/res — poderia ser
// chamado por um cron, uma fila ou pelo importador de CSV da próxima fase.

import { campaignRepository } from '../repositories/campaign.repository.js';
import {
  createCampaignDTO,
  updateCampaignDTO,
} from '../dtos/campaign.dto.js';
import { AppError } from '../utils/AppError.js';

export const campaignService = {
  /**
   * Cria uma campanha.
   * Regras: dados válidos (DTO) + nome único.
   */
  async create(payload) {
    const data = createCampaignDTO(payload);

    // Invariante de domínio: não permitir duas campanhas com o mesmo nome.
    const existing = await campaignRepository.findByName(data.name);
    if (existing) {
      // 409 Conflict é o status correto para violação de unicidade.
      throw new AppError('Já existe uma campanha com esse nome.', 409);
    }

    return campaignRepository.create(data);
  },

  /** Lista campanhas, com filtros opcionais de source e goal. */
  async list(filters) {
    return campaignRepository.findAll(filters);
  },

  /** Busca por id. Lança 404 quando não encontrada. */
  async getById(id) {
    const campaign = await campaignRepository.findById(id);

    if (!campaign) {
      throw new AppError('Campanha não encontrada.', 404);
    }
    return campaign;
  },

  /**
   * Atualiza uma campanha existente (payload parcial).
   * Precisa revalidar a regra cruzada de datas usando os valores JÁ salvos,
   * pois o cliente pode enviar só uma das duas datas.
   */
  async update(id, payload) {
    const current = await this.getById(id); // garante existência (404)
    const data = updateCampaignDTO(payload);

    // Unicidade de nome, ignorando o próprio registro.
    if (data.name) {
      const duplicate = await campaignRepository.findByName(data.name, id);
      if (duplicate) {
        throw new AppError('Já existe uma campanha com esse nome.', 409);
      }
    }

    // Coerência de datas considerando o estado atual + as mudanças enviadas.
    const startDate = data.startDate ?? current.startDate;
    const endDate = data.endDate !== undefined ? data.endDate : current.endDate;

    if (startDate && endDate && endDate < startDate) {
      throw new AppError(
        'Dados inválidos para atualizar a campanha.',
        400,
        [{ field: 'endDate', message: 'A data final não pode ser anterior à data inicial.' }],
      );
    }

    return campaignRepository.update(id, data);
  },

  /** Remove uma campanha existente. */
  async remove(id) {
    await this.getById(id); // 404 se não existir
    return campaignRepository.delete(id);
  },
};