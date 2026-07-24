// Regras de RANKING: comparam segmentos (canais) entre si para encontrar
// o melhor e o pior desempenho. Dependem de context.bySource.
//
// FILTRO DE SIGNIFICÂNCIA: canais com volume irrisório são descartados.
// Sem isso, uma origem com 4 sessões e 1 venda apareceria como "o canal
// mais lucrativo" — ruído estatístico virando recomendação de negócio.

import { GROWTH_THRESHOLDS as T } from '../../config/growthThresholds.js';
import { formatCurrency, formatNumber, formatInteger } from '../../utils/formatters.js';

/** Mantém apenas canais com volume suficiente para uma conclusão confiável. */
function significantChannels(bySource) {
  return bySource.filter(
    (item) =>
      item.metrics.roas !== null &&
      item.metrics.sessions >= T.minimumVolume.sessions &&
      item.metrics.cost >= T.minimumVolume.cost,
  );
}

/** Ordena canais do maior para o menor ROAS. */
function rankByRoas(channels) {
  return [...channels].sort((a, b) => b.metrics.roas - a.metrics.roas);
}

// ─────────────────────────────────────────────────────────────
// Canal mais lucrativo
// ─────────────────────────────────────────────────────────────
export const bestChannelRule = {
  code: 'BEST_CHANNEL',
  description: 'Identifica o canal com melhor retorno sobre investimento.',

  evaluate({ bySource }) {
    const eligible = significantChannels(bySource);
    // Com menos de 2 canais não há comparação a fazer.
    if (eligible.length < 2) return null;

    const [best] = rankByRoas(eligible);
    const { roas, revenue, cost, orders } = best.metrics;

    return {
      code: this.code,
      level: 'info',
      scope: `source:${best.source}`,
      title: `${best.source} é o canal mais lucrativo`,
      description:
        `${best.source} lidera com ROAS de ${formatNumber(roas)}x: ` +
        `${formatCurrency(cost)} investidos geraram ${formatCurrency(revenue)} ` +
        `em ${formatInteger(orders)} pedidos.`,
      suggestion:
        `Teste um aumento gradual de orçamento em ${best.source}, monitorando se o ROAS se mantém — ` +
        'canais costumam perder eficiência ao escalar, conforme a audiência qualificada satura. ' +
        'Suba entre 20% e 30% por vez e reavalie antes do próximo incremento.',
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Canal com pior desempenho
// ─────────────────────────────────────────────────────────────
export const worstChannelRule = {
  code: 'WORST_CHANNEL',
  description: 'Identifica o canal com pior retorno, quando a diferença é relevante.',

  evaluate({ bySource }) {
    const eligible = significantChannels(bySource);
    if (eligible.length < 2) return null;

    const ranked = rankByRoas(eligible);
    const best = ranked[0];
    const worst = ranked[ranked.length - 1];

    const { roas, revenue, cost } = worst.metrics;

    // Só alerta se o pior for MUITO pior que o melhor, ou se estiver
    // abaixo do mínimo saudável. Diferenças pequenas não são acionáveis.
    const isFarBehind = roas <= best.metrics.roas * T.channelGap;
    const isUnhealthy = roas < T.roas.warning;
    if (!isFarBehind && !isUnhealthy) return null;

    const losesMoney = roas < T.roas.critical;

    return {
      code: this.code,
      level: losesMoney ? 'critical' : 'warning',
      scope: `source:${worst.source}`,
      title: `${worst.source} é o canal de pior desempenho`,
      description:
        `${worst.source} apresenta ROAS de ${formatNumber(roas)}x ` +
        `(${formatCurrency(cost)} investidos para ${formatCurrency(revenue)} de receita), ` +
        `contra ${formatNumber(best.metrics.roas)}x de ${best.source}. ` +
        (losesMoney ? 'O canal está consumindo mais caixa do que retorna.' : ''),
      suggestion:
        `Antes de cortar ${worst.source}, verifique se ele cumpre papel de topo de funil — canais de ` +
        'descoberta têm ROAS baixo por natureza e podem estar alimentando conversões atribuídas a outros. ' +
        'Se não for o caso, reduza o orçamento gradualmente e realoque para ' +
        `${best.source}, medindo o impacto no resultado consolidado.`,
    };
  },
};

export const rankingRules = [bestChannelRule, worstChannelRule];