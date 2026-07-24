// Regras de TENDÊNCIA: comparam o período atual com o período anterior de
// mesma duração. Detectam MOVIMENTO, não estado — uma conversão de 3% pode
// estar ótima em valor absoluto e ainda assim representar uma queda grave.
// Dependem de context.current E context.previous.

import { GROWTH_THRESHOLDS as T } from '../../config/growthThresholds.js';
import { formatCurrency, formatPercent } from '../../utils/formatters.js';

/**
 * Variação percentual entre dois valores.
 * Fórmula: (atual − anterior) ÷ anterior
 * Retorna null quando a base é zero (variação seria infinita).
 */
function percentChange(currentValue, previousValue) {
  if (!previousValue || previousValue === 0) return null;
  return (currentValue - previousValue) / previousValue;
}

// ─────────────────────────────────────────────────────────────
// Queda na taxa de conversão
// ─────────────────────────────────────────────────────────────
export const conversionDropRule = {
  code: 'CONVERSION_DROP',
  description: 'Detecta queda relevante na taxa de conversão entre períodos.',

  evaluate({ current, previous }) {
    // Sem período anterior comparável, a regra não se aplica.
    if (!previous || previous.sessions === 0) return null;
    if (current.conversionRate === null || previous.conversionRate === null) return null;

    const change = percentChange(current.conversionRate, previous.conversionRate);
    if (change === null) return null;

    // change é negativo em queda. -0.20 = caiu 20%.
    const dropSize = -change;
    if (dropSize < T.conversionDrop.warning) return null; // queda irrelevante

    const isCritical = dropSize >= T.conversionDrop.critical;

    return {
      code: this.code,
      level: isCritical ? 'critical' : 'warning',
      scope: 'global',
      title: 'Taxa de conversão em queda',
      description:
        `A conversão caiu ${formatPercent(dropSize)} em relação ao período anterior: ` +
        `de ${formatPercent(previous.conversionRate, 2)} para ` +
        `${formatPercent(current.conversionRate, 2)}. ` +
        `No mesmo intervalo, os pedidos passaram de ${previous.orders} para ${current.orders}.`,
      suggestion:
        'Investigue mudanças recentes no funil: alterações na landing page, no checkout ou no preço. ' +
        'Compare a queda por canal para saber se é um problema geral ou concentrado em uma origem. ' +
        'Verifique também se houve mudança na composição do tráfego — mais volume de audiência fria ' +
        'derruba a conversão mesmo sem nada ter quebrado.',
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Variação de receita (crescimento OU queda)
// ─────────────────────────────────────────────────────────────
export const revenueTrendRule = {
  code: 'REVENUE_TREND',
  description: 'Reporta crescimento ou queda relevante de receita.',

  evaluate({ current, previous }) {
    if (!previous || previous.revenue === 0) return null;

    const change = percentChange(current.revenue, previous.revenue);
    if (change === null) return null;

    const base =
      `Receita de ${formatCurrency(current.revenue)} no período, contra ` +
      `${formatCurrency(previous.revenue)} no anterior.`;

    // Crescimento relevante — insight positivo.
    if (change >= T.revenueChange.growth) {
      return {
        code: this.code,
        level: 'info',
        scope: 'global',
        title: 'Receita em crescimento',
        description: `${base} Alta de ${formatPercent(change)} em relação ao período anterior.`,
        suggestion:
          'Identifique qual canal ou campanha puxou o crescimento e verifique se há espaço para ' +
          'escalar o investimento mantendo o ROAS. Documente o que mudou — crescimento sem causa ' +
          'identificada não é replicável.',
      };
    }

    // Queda relevante — alerta.
    if (change <= -T.revenueChange.drop) {
      return {
        code: this.code,
        level: 'warning',
        scope: 'global',
        title: 'Receita em queda',
        description: `${base} Retração de ${formatPercent(-change)} em relação ao período anterior.`,
        suggestion:
          'Verifique se a queda vem de menos tráfego ou de menor conversão — o diagnóstico é diferente ' +
          'em cada caso. Confira se algum anúncio foi pausado ou teve o orçamento reduzido, e considere ' +
          'sazonalidade antes de reagir.',
      };
    }

    return null; // variação dentro da normalidade
  },
};

export const trendRules = [conversionDropRule, revenueTrendRule];