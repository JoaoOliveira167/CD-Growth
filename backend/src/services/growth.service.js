// Service do Growth Engine. Orquestra a montagem do CONTEXTO (buscar
// métricas do período atual, do anterior e por canal), executa o motor e,
// opcionalmente, persiste os insights.
//
// Reutiliza o metricsService em vez de acessar o repositório diretamente:
// os cálculos de métrica já estão testados e centralizados lá, e duplicá-los
// aqui violaria o DRY e criaria duas fontes de verdade para as mesmas fórmulas.

import { metricsService } from './metrics.service.js';
import { insightRepository } from '../repositories/insight.repository.js';
import { runGrowthEngine } from '../engine/growthEngine.js';
import { GROWTH_THRESHOLDS as T } from '../config/growthThresholds.js';
import { AppError } from '../utils/AppError.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Converte uma Date para o formato YYYY-MM-DD. */
function toIsoDay(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Resolve a janela de análise e a janela anterior equivalente.
 *
 * Regra: o período anterior tem a MESMA duração e termina no dia anterior
 * ao início do período atual. Comparar 30 dias com 7 dias produziria
 * conclusões inválidas — a duração precisa ser idêntica.
 */
function resolveWindows(query = {}) {
  const days = Number(query.days) > 0 ? Number(query.days) : T.defaultWindowDays;

  // Fim do período: informado ou hoje.
  const end = query.endDate ? new Date(query.endDate) : new Date();
  if (Number.isNaN(end.getTime())) {
    throw new AppError('endDate inválida. Use o formato YYYY-MM-DD.', 400);
  }

  // Início do período: informado ou calculado a partir da duração.
  const start = query.startDate
    ? new Date(query.startDate)
    : new Date(end.getTime() - (days - 1) * MS_PER_DAY);
  if (Number.isNaN(start.getTime())) {
    throw new AppError('startDate inválida. Use o formato YYYY-MM-DD.', 400);
  }
  if (start > end) {
    throw new AppError('startDate não pode ser posterior a endDate.', 400);
  }

  // Duração real em dias (inclusiva).
  const durationDays = Math.round((end - start) / MS_PER_DAY) + 1;

  // Período anterior: termina um dia antes do início atual.
  const previousEnd = new Date(start.getTime() - MS_PER_DAY);
  const previousStart = new Date(previousEnd.getTime() - (durationDays - 1) * MS_PER_DAY);

  return {
    current: { startDate: toIsoDay(start), endDate: toIsoDay(end) },
    previous: { startDate: toIsoDay(previousStart), endDate: toIsoDay(previousEnd) },
    durationDays,
  };
}

export const growthService = {
  /**
   * Executa a análise SEM persistir. Útil para pré-visualização.
   * @param {object} query  { days, startDate, endDate, campaignId }
   */
  async analyze(query = {}) {
    const windows = resolveWindows(query);
    const scopeFilter = query.campaignId ? { campaignId: query.campaignId } : {};

    // Três consultas em paralelo — não dependem umas das outras.
    const [currentOverview, previousOverview, bySource] = await Promise.all([
      metricsService.getOverview({ ...windows.current, ...scopeFilter }),
      metricsService.getOverview({ ...windows.previous, ...scopeFilter }),
      metricsService.getBySource({ ...windows.current, ...scopeFilter }),
    ]);

    // Sem dados no período atual, não há diagnóstico possível.
    if (currentOverview.recordCount === 0) {
      return {
        period: windows,
        insights: [],
        summary: { total: 0, critical: 0, warning: 0, info: 0 },
        message: 'Nenhum dado de analytics encontrado no período informado.',
      };
    }

    // Monta o contexto consumido pelas regras.
    const context = {
      current: currentOverview.metrics,
      // Só oferecemos "previous" quando ele tem dados — as regras de
      // tendência checam isso e se abstêm quando não há base de comparação.
      previous: previousOverview.recordCount > 0 ? previousOverview.metrics : null,
      bySource: bySource.data,
    };

    const { insights, summary } = runGrowthEngine(context);

    return {
      period: windows,
      recordCount: currentOverview.recordCount,
      hasComparison: context.previous !== null,
      summary,
      insights,
    };
  },

  /**
   * Executa a análise e SUBSTITUI os insights salvos.
   *
   * Decisão de design: a tabela representa o DIAGNÓSTICO ATUAL, não um
   * histórico. Cada execução limpa e regrava, evitando que alertas já
   * resolvidos permaneçam no dashboard. Para manter histórico, bastaria
   * adicionar um campo runId e deixar de apagar.
   */
  async analyzeAndSave(query = {}) {
    const result = await this.analyze(query);

    await insightRepository.deleteAll();

    if (result.insights.length > 0) {
      // Remove campos que não existem no banco antes de gravar.
      await insightRepository.createMany(
        result.insights.map(({ code, title, description, suggestion, level, scope }) => ({
          code,
          title,
          description,
          suggestion,
          level,
          scope,
        })),
      );
    }

    return { ...result, persisted: result.insights.length };
  },

  /** Lista os insights já salvos no banco. */
  async listSaved(query = {}) {
    const insights = await insightRepository.findAll({ level: query.level });
    return { total: insights.length, insights };
  },

  /** Remove um insight salvo. */
  async removeSaved(id) {
    return insightRepository.delete(id);
  },
};