// Regras de LIMITE: comparam uma métrica do período atual contra um valor
// de referência fixo. Só dependem de context.current.
//
// Contrato de toda regra: { code, description, evaluate(context) }
// O evaluate devolve um objeto de insight ou null (nada a reportar).

import { GROWTH_THRESHOLDS as T } from '../../config/growthThresholds.js';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatInteger,
} from '../../utils/formatters.js';

// ─────────────────────────────────────────────────────────────
// ROAS baixo — retorno sobre o investimento em mídia
// Fórmula: ROAS = receita ÷ custo
// ─────────────────────────────────────────────────────────────
export const roasRule = {
  code: 'ROAS_LOW',
  description: 'Detecta ROAS abaixo do mínimo saudável.',

  evaluate({ current }) {
    const { roas, revenue, cost } = current;

    // null = não houve investimento; não há o que avaliar.
    if (roas === null) return null;
    // Dentro do esperado: nenhum insight.
    if (roas >= T.roas.warning) return null;

    // Abaixo de 1 significa faturar menos do que se gasta — crítico.
    const isCritical = roas < T.roas.critical;

    return {
      code: this.code,
      level: isCritical ? 'critical' : 'warning',
      scope: 'global',
      title: isCritical ? 'ROAS negativo: a operação perde dinheiro' : 'ROAS abaixo do mínimo saudável',
      description:
        `O ROAS do período é ${formatNumber(roas)}x — cada R$ 1,00 investido ` +
        `retornou ${formatCurrency(roas)} em receita. ` +
        `Foram ${formatCurrency(cost)} de investimento para ${formatCurrency(revenue)} de receita. ` +
        (isCritical
          ? 'Abaixo de 1x, cada venda custa mais do que gera.'
          : `A referência mínima definida é ${T.roas.warning}x.`),
      suggestion:
        'Pause os anúncios de pior desempenho e realoque o orçamento para os canais com maior ROAS. ' +
        'Revise a segmentação para reduzir desperdício e confirme se o rastreamento de receita está ' +
        'capturando todas as conversões — um ROAS baixo às vezes é problema de medição, não de campanha.',
    };
  },
};

// ─────────────────────────────────────────────────────────────
// CTR baixo — atratividade do anúncio
// Fórmula: CTR = cliques ÷ impressões
// ─────────────────────────────────────────────────────────────
export const ctrRule = {
  code: 'CTR_LOW',
  description: 'Detecta CTR abaixo da referência de mercado.',

  evaluate({ current }) {
    const { ctr, clicks, impressions } = current;

    if (ctr === null) return null; // sem impressões registradas
    if (ctr >= T.ctr.warning) return null;

    const isCritical = ctr < T.ctr.critical;

    return {
      code: this.code,
      level: isCritical ? 'critical' : 'warning',
      scope: 'global',
      title: 'CTR abaixo do esperado',
      description:
        `O CTR do período é ${formatPercent(ctr, 2)}, abaixo da referência de ` +
        `${formatPercent(T.ctr.warning, 0)}. De ${formatInteger(impressions)} impressões, ` +
        `apenas ${formatInteger(clicks)} geraram clique. ` +
        (isCritical ? 'O patamar indica baixíssima aderência entre anúncio e público.' : ''),
      suggestion:
        'Teste novas variações de criativo e headline — CTR é, antes de tudo, um problema de mensagem. ' +
        'Revise a aderência do público-alvo e exclua posicionamentos de baixo engajamento. ' +
        'Impressões altas com poucos cliques também sugerem excesso de frequência: verifique a saturação do público.',
    };
  },
};

// ─────────────────────────────────────────────────────────────
// Bounce rate alto — qualidade da experiência pós-clique
// Fórmula: média PONDERADA de bounceRate pelas sessões
// ─────────────────────────────────────────────────────────────
export const bounceRateRule = {
  code: 'BOUNCE_HIGH',
  description: 'Detecta taxa de rejeição acima do limite aceitável.',

  evaluate({ current }) {
    const { bounceRate, sessions } = current;

    if (bounceRate === null) return null;
    if (bounceRate <= T.bounceRate.warning) return null;

    const isCritical = bounceRate > T.bounceRate.critical;

    return {
      code: this.code,
      level: isCritical ? 'critical' : 'warning',
      scope: 'global',
      title: 'Taxa de rejeição elevada',
      description:
        `A taxa de rejeição ponderada é ${formatPercent(bounceRate)}, acima do limite de ` +
        `${formatPercent(T.bounceRate.warning, 0)}. Em ${formatInteger(sessions)} sessões, ` +
        'a maioria dos visitantes saiu sem interagir com a página.',
      suggestion:
        'Verifique o tempo de carregamento da landing page (acima de 3s a rejeição dispara) e a ' +
        'coerência entre a promessa do anúncio e o conteúdo da página. ' +
        'Teste a experiência em dispositivos móveis, onde a maior parte do tráfego costuma chegar.',
    };
  },
};

// ─────────────────────────────────────────────────────────────
// CAC elevado — custo de aquisição vs. valor do cliente
// Fórmulas: CAC = custo ÷ conversões | razão = LTV ÷ CAC
// ─────────────────────────────────────────────────────────────
export const cacRule = {
  code: 'CAC_HIGH',
  description: 'Detecta CAC desproporcional ao valor gerado por cliente.',

  evaluate({ current }) {
    const { cac, ltv, ltvCacRatio, averageOrderValue } = current;

    if (cac === null || ltvCacRatio === null) return null;
    if (ltvCacRatio >= T.ltvCac.warning) return null;

    // Dois sinais de gravidade: LTV menor que o CAC, ou CAC maior que o ticket.
    const burnsCash = ltvCacRatio < T.ltvCac.critical;
    const exceedsTicket = averageOrderValue !== null && cac > averageOrderValue;
    const isCritical = burnsCash || exceedsTicket;

    return {
      code: this.code,
      level: isCritical ? 'critical' : 'warning',
      scope: 'global',
      title: isCritical ? 'CAC insustentável' : 'CAC elevado em relação ao retorno',
      description:
        `O custo de aquisição é ${formatCurrency(cac)} por cliente, com LTV estimado de ` +
        `${formatCurrency(ltv)} — razão LTV/CAC de ${formatNumber(ltvCacRatio)}x ` +
        `(a referência saudável é ${T.ltvCac.warning}x). ` +
        (exceedsTicket
          ? `Pior: o CAC supera o ticket médio de ${formatCurrency(averageOrderValue)}, ` +
            'ou seja, a primeira compra não paga a aquisição.'
          : ''),
      suggestion:
        'Ataque os dois lados da razão. Para baixar o CAC: negocie CPCs, corte os canais mais caros ' +
        'e melhore a taxa de conversão (mais vendas pelo mesmo gasto). Para subir o LTV: trabalhe ' +
        'recompra, e-mail marketing e estratégias de upsell/cross-sell que aumentem o ticket médio.',
    };
  },
};

export const thresholdRules = [roasRule, ctrRule, bounceRateRule, cacRule];