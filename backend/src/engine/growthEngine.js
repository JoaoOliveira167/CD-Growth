// Motor do Growth Engine. Executa TODAS as regras registradas contra um
// contexto de dados e devolve os insights encontrados, ordenados por
// severidade. O motor não conhece nenhuma regra específica — ele só
// respeita o contrato { code, evaluate(context) }.

import { growthRules } from './rules/index.js';

// Peso de ordenação: o mais grave aparece primeiro na lista.
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };

/**
 * Executa o motor de análise.
 *
 * @param {object} context
 * @param {object} context.current   Métricas do período analisado.
 * @param {object|null} context.previous  Métricas do período anterior.
 * @param {Array} context.bySource   Métricas agregadas por canal.
 * @returns {{ insights: Array, summary: object }}
 */
export function runGrowthEngine(context) {
  const insights = [];

  for (const rule of growthRules) {
    try {
      const result = rule.evaluate(context);

      // Uma regra pode devolver null (nada a reportar), um insight
      // ou um array de insights — todos os formatos são aceitos.
      if (Array.isArray(result)) {
        insights.push(...result.filter(Boolean));
      } else if (result) {
        insights.push(result);
      }
    } catch (error) {
      // ISOLAMENTO DE FALHA: uma regra quebrada não pode derrubar a análise
      // inteira. Registramos o problema e seguimos para a próxima.
      console.error(`[GrowthEngine] Falha na regra "${rule.code}":`, error.message);
    }
  }

  // Ordena por gravidade (críticos primeiro).
  insights.sort(
    (a, b) => (SEVERITY_ORDER[a.level] ?? 99) - (SEVERITY_ORDER[b.level] ?? 99),
  );

  // Resumo por severidade, útil para badges no dashboard.
  const summary = {
    total: insights.length,
    critical: insights.filter((i) => i.level === 'critical').length,
    warning: insights.filter((i) => i.level === 'warning').length,
    info: insights.filter((i) => i.level === 'info').length,
    rulesEvaluated: growthRules.length,
  };

  return { insights, summary };
}