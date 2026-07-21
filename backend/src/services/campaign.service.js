// Service de Campaign: coração da regra de negócio. Valida os dados de
// entrada, normaliza tipos (ex.: strings de data → Date) e garante invariantes
// do domínio antes de delegar a persistência ao repository. Não conhece HTTP.

import { campaignRepository } from '../repositories/campaign.repository.js';
import { AppError } from '../utils/AppError.js';

// Status permitidos para uma campanha (regra de domínio).
const VALID_STATUSES = ['active', 'paused', 'finished'];

// Pequeno helper: se a condição for falsa, lança um erro de validação (400).
function assert(condition, message) {
  if (!condition) throw new AppError(message, 400);
}

/**
 * Valida e normaliza os dados de uma campanha.
 * @param {object} data  Payload recebido do cliente.
 * @param {object} opts
 * @param {boolean} opts.partial  Se true (update), só valida os campos presentes.
 * @returns {object}  Objeto limpo e tipado, pronto para o banco.
 */
function normalizeAndValidate(data, { partial = false } = {}) {
  const result = {};

  // name — obrigatório na criação; se presente, mínimo de 2 caracteres.
  if (!partial || data.name !== undefined) {
    assert(
      typeof data.name === 'string' && data.name.trim().length >= 2,
      'O campo "name" é obrigatório e deve ter ao menos 2 caracteres.',
    );
    result.name = data.name.trim();
  }

  // channel — obrigatório na criação; não pode ser vazio.
  if (!partial || data.channel !== undefined) {
    assert(
      typeof data.channel === 'string' && data.channel.trim().length > 0,
      'O campo "channel" é obrigatório.',
    );
    result.channel = data.channel.trim();
  }

  // budget — obrigatório na criação; número maior que zero.
  if (!partial || data.budget !== undefined) {
    const budget = Number(data.budget);
    assert(
      !Number.isNaN(budget) && budget > 0,
      'O campo "budget" deve ser um número maior que zero.',
    );
    result.budget = budget;
  }

  // status — opcional; se enviado, precisa estar na lista permitida.
  if (data.status !== undefined) {
    assert(
      VALID_STATUSES.includes(data.status),
      `O campo "status" deve ser um de: ${VALID_STATUSES.join(', ')}.`,
    );
    result.status = data.status;
  }

  // startDate — obrigatório na criação; precisa ser uma data válida.
  if (!partial || data.startDate !== undefined) {
    const startDate = new Date(data.startDate);
    assert(
      !Number.isNaN(startDate.getTime()),
      'O campo "startDate" é obrigatório e deve ser uma data válida.',
    );
    result.startDate = startDate;
  }

  // endDate — opcional; se enviado, precisa ser uma data válida.
  if (data.endDate !== undefined && data.endDate !== null) {
    const endDate = new Date(data.endDate);
    assert(
      !Number.isNaN(endDate.getTime()),
      'O campo "endDate" deve ser uma data válida.',
    );
    result.endDate = endDate;
  }

  // Regra cruzada: quando ambas as datas vierem no payload, o fim não pode
  // ser anterior ao início.
  if (result.startDate && result.endDate) {
    assert(
      result.endDate >= result.startDate,
      'A data final não pode ser anterior à data inicial.',
    );
  }

  return result;
}

export const campaignService = {
  // Cria uma campanha após validar todos os campos obrigatórios.
  async create(data) {
    const clean = normalizeAndValidate(data, { partial: false });
    return campaignRepository.create(clean);
  },

  // Lista todas as campanhas.
  async list() {
    return campaignRepository.findAll();
  },

  // Busca por id; se não existir, lança 404 (erro operacional tratado no handler).
  async getById(id) {
    const campaign = await campaignRepository.findById(id);
    if (!campaign) {
      throw new AppError('Campanha não encontrada.', 404);
    }
    return campaign;
  },

  // Atualiza uma campanha existente (validação parcial: só o que veio no body).
  async update(id, data) {
    // Garante que a campanha existe antes de tentar atualizar.
    await this.getById(id);
    const clean = normalizeAndValidate(data, { partial: true });
    return campaignRepository.update(id, clean);
  },

  // Remove uma campanha existente.
  async remove(id) {
    await this.getById(id);
    return campaignRepository.delete(id);
  },
};