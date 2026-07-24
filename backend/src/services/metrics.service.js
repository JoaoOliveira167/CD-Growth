// Service de métricas: orquestra busca → agrupamento → cálculo.
// Toda a inteligência analítica do dashboard vive aqui.
//
// NOTA DE ARQUITETURA: a agregação é feita em JavaScript, não em SQL.
// Motivo: o SQLite não tem funções nativas de truncamento de data por
// semana/mês, o que exigiria SQL cru e amarraria o código ao dialeto do
// banco. Para os volumes desta aplicação (milhares de linhas), o custo é
// desprezível e ganhamos portabilidade total. Se o volume crescer para
// milhões de registros, o ponto de otimização é migrar ESTE arquivo para
// queries agregadas — nenhuma outra camada precisaria mudar.

import { metricsRepository } from '../repositories/metrics.repository.js';
import {
  calculateMetrics,
  sumTotals,
  LTV_DEFAULTS,
} from '../utils/metricsCalculator.js';
import { getPeriodKey, VALID_PERIODS } from '../utils/dateGrouper.js';
import { AppError } from '../utils/AppError.js';

/**
 * Agrupa registros por uma chave qualquer e calcula as métricas de cada grupo.
 * Função genérica reutilizada por período, origem e campanha.
 *
 * @param {Array} records  Registros crus do banco.
 * @param {Function} keyFn  Extrai a chave de agrupamento de um registro.
 * @param {Function} labelFn  Monta os campos identificadores do grupo.
 * @param {object} ltvParams
 */
function groupAndCalculate(records, keyFn, labelFn, ltvParams) {
  const buckets = new Map();

  // 1. Distribui cada registro no seu balde.
  for (const record of records) {
    const key = keyFn(record);
    if (!buckets.has(key)) {
      buckets.set(key, { label: labelFn(record), records: [] });
    }
    buckets.get(key).records.push(record);
  }

  // 2. Calcula as métricas de cada balde.
  return [...buckets.entries()]
    .map(([key, bucket]) => ({
      key,
      ...bucket.label,
      metrics: calculateMetrics(sumTotals(bucket.records), ltvParams),
    }))
    // 3. Ordena pela chave (nas datas, isso é ordem cronológica pelo formato ISO).
    .sort((a, b) => String(a.key).localeCompare(String(b.key)));
}

/** Converte e valida os filtros vindos da query string. */
function parseFilters(query = {}) {
  const filters = {};

  if (query.startDate) {
    const date = new Date(query.startDate);
    if (Number.isNaN(date.getTime())) {
      throw new AppError('startDate inválida. Use o formato YYYY-MM-DD.', 400);
    }
    filters.startDate = date;
  }

  if (query.endDate) {
    const date = new Date(query.endDate);
    if (Number.isNaN(date.getTime())) {
      throw new AppError('endDate inválida. Use o formato YYYY-MM-DD.', 400);
    }
    // Empurra para o fim do dia, para incluir registros do próprio dia final.
    date.setUTCHours(23, 59, 59, 999);
    filters.endDate = date;
  }

  if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
    throw new AppError('endDate não pode ser anterior a startDate.', 400);
  }

  if (query.campaignId) filters.campaignId = query.campaignId;
  if (query.source) filters.source = query.source;

  return filters;
}

/** Lê as premissas do LTV da query string, caindo nos defaults. */
function parseLtvParams(query = {}) {
  const frequency = Number(query.purchaseFrequency);
  const lifespan = Number(query.customerLifespanMonths);

  return {
    purchaseFrequency:
      Number.isFinite(frequency) && frequency > 0
        ? frequency
        : LTV_DEFAULTS.purchaseFrequency,
    customerLifespanMonths:
      Number.isFinite(lifespan) && lifespan > 0
        ? lifespan
        : LTV_DEFAULTS.customerLifespanMonths,
  };
}

export const metricsService = {
  /** KPIs consolidados de todo o conjunto filtrado. */
  async getOverview(query) {
    const filters = parseFilters(query);
    const ltvParams = parseLtvParams(query);
    const records = await metricsRepository.findRecords(filters);

    return {
      filters: query,
      assumptions: ltvParams, // premissas declaradas para auditabilidade
      recordCount: records.length,
      metrics: calculateMetrics(sumTotals(records), ltvParams),
    };
  },

  /** Série temporal agrupada por dia, semana ou mês. */
  async getTimeSeries(query) {
    const period = query.groupBy ?? 'day';

    if (!VALID_PERIODS.includes(period)) {
      throw new AppError(
        `groupBy inválido. Use um de: ${VALID_PERIODS.join(', ')}.`,
        400,
      );
    }

    const filters = parseFilters(query);
    const ltvParams = parseLtvParams(query);
    const records = await metricsRepository.findRecords(filters);

    const series = groupAndCalculate(
      records,
      (r) => getPeriodKey(r.date, period),
      (r) => ({ period: getPeriodKey(r.date, period) }),
      ltvParams,
    );

    return { groupBy: period, total: series.length, series };
  },

  /** Métricas agregadas por origem de tráfego. */
  async getBySource(query) {
    const filters = parseFilters(query);
    const ltvParams = parseLtvParams(query);
    const records = await metricsRepository.findRecords(filters);

    const data = groupAndCalculate(
      records,
      (r) => r.source,
      (r) => ({ source: r.source }),
      ltvParams,
    );

    return { groupBy: 'source', total: data.length, data };
  },

  /** Métricas agregadas por campanha. */
  async getByCampaign(query) {
    const filters = parseFilters(query);
    const ltvParams = parseLtvParams(query);
    const records = await metricsRepository.findRecords(filters);

    const data = groupAndCalculate(
      records,
      (r) => r.campaignId,
      (r) => ({
        campaignId: r.campaignId,
        campaignName: r.campaign?.name ?? 'Desconhecida',
        budget: r.campaign?.budget ?? null,
        goal: r.campaign?.goal ?? null,
      }),
      ltvParams,
    );

    // Enriquece com o consumo do orçamento — informação que só faz sentido
    // no agrupamento por campanha.
    const enriched = data.map((item) => ({
      ...item,
      budgetUsage:
        item.budget && item.budget > 0
          ? Number((item.metrics.cost / item.budget).toFixed(4))
          : null,
    }));

    return { groupBy: 'campaign', total: enriched.length, data: enriched };
  },

  /** Valores disponíveis para popular os filtros da interface. */
  async getFilterOptions() {
    const sources = await metricsRepository.findDistinctSources();
    return { sources, periods: VALID_PERIODS };
  },
};