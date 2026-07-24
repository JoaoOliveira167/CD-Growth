// DTO (Data Transfer Object) de Campaign.
// Responsabilidades:
//  1. ENTRADA  — validar e normalizar o payload cru vindo do cliente,
//                acumulando TODOS os erros encontrados (não para no primeiro).
//  2. SAÍDA    — formatar a entidade do banco no formato público da API,
//                desacoplando o contrato da API do schema do Prisma.

import { AppError } from '../utils/AppError.js';

// Objetivos aceitos para uma campanha (regra de domínio).
export const VALID_GOALS = [
  'Vendas',
  'Leads',
  'Awareness',
  'Tráfego',
  'Engajamento',
];

// ─────────────────────────────────────────────────────────────
// Validadores auxiliares — pequenos, puros e reutilizáveis.
// Cada um retorna { ok, value, message }.
// ─────────────────────────────────────────────────────────────

function validateString(value, { min = 1, max = 120 } = {}) {
  if (typeof value !== 'string') {
    return { ok: false, message: 'Deve ser um texto.' };
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    return { ok: false, message: `Deve ter ao menos ${min} caractere(s).` };
  }
  if (trimmed.length > max) {
    return { ok: false, message: `Deve ter no máximo ${max} caracteres.` };
  }
  return { ok: true, value: trimmed };
}

function validatePositiveNumber(value) {
  const num = Number(value);
  if (value === '' || value === null || Number.isNaN(num)) {
    return { ok: false, message: 'Deve ser um número válido.' };
  }
  if (num <= 0) {
    return { ok: false, message: 'Deve ser maior que zero.' };
  }
  return { ok: true, value: num };
}

function validateDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: 'Deve ser uma data válida (ex.: 2025-11-01).' };
  }
  return { ok: true, value: date };
}

function validateEnum(value, allowed) {
  if (!allowed.includes(value)) {
    return { ok: false, message: `Deve ser um de: ${allowed.join(', ')}.` };
  }
  return { ok: true, value };
}

// ─────────────────────────────────────────────────────────────
// Núcleo da validação, compartilhado entre create e update.
// @param {object} payload  Dados crus do cliente.
// @param {boolean} partial  true = update (valida só o que veio).
// ─────────────────────────────────────────────────────────────
function buildCampaignData(payload, { partial }) {
  const data = {};
  const errors = []; // acumula TODOS os problemas encontrados

  // Helper: decide se um campo deve ser processado.
  // No create, todo obrigatório entra. No update, só se foi enviado.
  const shouldValidate = (field) => !partial || payload[field] !== undefined;

  // Helper: aplica um validador e registra o erro (se houver).
  const apply = (field, validator) => {
    const result = validator(payload[field]);
    if (result.ok) {
      data[field] = result.value;
    } else {
      errors.push({ field, message: result.message });
    }
  };

  // ── name ── obrigatório, 2 a 120 caracteres
  if (shouldValidate('name')) {
    apply('name', (v) => validateString(v, { min: 2, max: 120 }));
  }

  // ── source ── obrigatório (ex.: "Google Ads", "Meta Ads")
  if (shouldValidate('source')) {
    apply('source', (v) => validateString(v, { min: 2, max: 80 }));
  }

  // ── budget ── obrigatório, número > 0
  if (shouldValidate('budget')) {
    apply('budget', validatePositiveNumber);
  }

  // ── goal ── obrigatório, dentro da lista permitida
  if (shouldValidate('goal')) {
    apply('goal', (v) => validateEnum(v, VALID_GOALS));
  }

  // ── startDate ── obrigatório, data válida
  if (shouldValidate('startDate')) {
    apply('startDate', validateDate);
  }

  // ── endDate ── SEMPRE opcional. null limpa o campo no banco.
  if (payload.endDate !== undefined) {
    if (payload.endDate === null || payload.endDate === '') {
      data.endDate = null;
    } else {
      apply('endDate', validateDate);
    }
  }

  // ── Regra cruzada ── o fim não pode anteceder o início.
  // Só validamos quando ambas as datas foram resolvidas com sucesso.
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.push({
      field: 'endDate',
      message: 'A data final não pode ser anterior à data inicial.',
    });
  }

  return { data, errors };
}

// ─────────────────────────────────────────────────────────────
// DTOs públicos
// ─────────────────────────────────────────────────────────────

/** Valida o payload de CRIAÇÃO. Lança AppError 400 se houver erros. */
export function createCampaignDTO(payload = {}) {
  const { data, errors } = buildCampaignData(payload, { partial: false });

  if (errors.length > 0) {
    throw new AppError('Dados inválidos para criar a campanha.', 400, errors);
  }
  return data;
}

/** Valida o payload de ATUALIZAÇÃO (parcial). Lança AppError 400 se inválido. */
export function updateCampaignDTO(payload = {}) {
  const { data, errors } = buildCampaignData(payload, { partial: true });

  if (errors.length > 0) {
    throw new AppError('Dados inválidos para atualizar a campanha.', 400, errors);
  }
  // Evita um UPDATE vazio no banco.
  if (Object.keys(data).length === 0) {
    throw new AppError('Informe ao menos um campo para atualizar.', 400);
  }
  return data;
}

/**
 * Formata a entidade do banco para o formato público da API.
 * Datas viram ISO string e, quando disponível, expomos a contagem de
 * registros de analytics vinculados.
 */
export function campaignResponseDTO(campaign) {
  if (!campaign) return null;

  return {
    id: campaign.id,
    name: campaign.name,
    source: campaign.source,
    budget: campaign.budget,
    goal: campaign.goal,
    startDate: campaign.startDate?.toISOString() ?? null,
    endDate: campaign.endDate?.toISOString() ?? null,
    analyticsCount: campaign._count?.analytics ?? undefined,
    createdAt: campaign.createdAt?.toISOString() ?? null,
    updatedAt: campaign.updatedAt?.toISOString() ?? null,
  };
}

/** Aplica o DTO de saída em uma lista. */
export function campaignListResponseDTO(campaigns) {
  return campaigns.map(campaignResponseDTO);
}