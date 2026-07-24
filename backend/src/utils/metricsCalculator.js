// Calculadora de métricas de Growth. Funções PURAS: recebem números,
// devolvem números. Não conhecem Prisma, HTTP ou qualquer I/O — o que as
// torna trivialmente testáveis e reutilizáveis em qualquer contexto.

/**
 * Divisão segura. Retorna null quando o denominador é zero ou inválido.
 * Por que null e não 0? Porque "não há dados para calcular" é diferente
 * de "o resultado é zero". Um ROAS de 0 significa receita nula com custo;
 * um ROAS null significa que não houve investimento algum. O frontend
 * exibe "—" para null e "0,00" para zero.
 */
function safeDivide(numerator, denominator) {
  if (!denominator || denominator === 0) return null;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : null;
}

/** Arredonda para N casas decimais, preservando null. */
function round(value, decimals = 2) {
  if (value === null || value === undefined) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// ─────────────────────────────────────────────────────────────
// Premissas padrão do LTV. Podem ser sobrescritas via query string,
// pois o schema não armazena histórico de recompra por cliente.
// ─────────────────────────────────────────────────────────────
export const LTV_DEFAULTS = {
  purchaseFrequency: 1.5, // compras por cliente no período
  customerLifespanMonths: 12, // meses de relacionamento estimados
};

/**
 * Recebe os TOTAIS brutos somados e devolve todas as métricas derivadas.
 *
 * @param {object} totals  { users, sessions, pageViews, revenue, cost,
 *                           orders, impressions, clicks,
 *                           weightedBounce } — weightedBounce é
 *                           Σ(bounceRate × sessions), usado na ponderação.
 * @param {object} ltvParams  Premissas do LTV.
 */
export function calculateMetrics(totals, ltvParams = LTV_DEFAULTS) {
  const {
    users = 0,
    sessions = 0,
    pageViews = 0,
    revenue = 0,
    cost = 0,
    orders = 0,
    impressions = 0,
    clicks = 0,
    weightedBounce = 0,
  } = totals;

  // Conversões: no domínio de e-commerce, cada pedido é uma conversão.
  const conversions = orders;

  // ── Métricas de eficiência de mídia ──
  // CTR: proporção de impressões que viraram clique.
  const ctr = safeDivide(clicks, impressions);
  // CPC: quanto custou, em média, cada clique.
  const cpc = safeDivide(cost, clicks);

  // ── Métricas de conversão ──
  // Taxa de conversão RECALCULADA a partir dos totais (nunca média de médias).
  const conversionRate = safeDivide(conversions, sessions);
  // Bounce rate ponderado pelo volume de sessões de cada registro.
  const bounceRate = safeDivide(weightedBounce, sessions);

  // ── Métricas financeiras ──
  // AOV (Average Order Value): ticket médio por pedido.
  const averageOrderValue = safeDivide(revenue, orders);
  // CAC: quanto custou adquirir cada cliente/conversão.
  const cac = safeDivide(cost, conversions);
  // ROAS: quantos reais de receita cada real investido gerou.
  const roas = safeDivide(revenue, cost);
  // ROI: percentual de retorno sobre o investimento (lucro/investimento).
  const roi = safeDivide(revenue - cost, cost);
  // Lucro absoluto.
  const profit = revenue - cost;

  // ── LTV ──
  // Fórmula: Ticket Médio × Frequência de Compra × Tempo de Vida.
  // As duas últimas são PREMISSAS, pois o schema não guarda recompra.
  const ltv =
    averageOrderValue === null
      ? null
      : averageOrderValue *
        ltvParams.purchaseFrequency *
        (ltvParams.customerLifespanMonths / 12);

  // Razão LTV/CAC — o indicador de saúde do negócio.
  // Referência de mercado: acima de 3 é saudável, abaixo de 1 queima caixa.
  const ltvCacRatio = ltv === null || cac === null ? null : safeDivide(ltv, cac);

  return {
    // Totais brutos
    users,
    sessions,
    pageViews,
    impressions,
    clicks,
    orders,
    conversions,
    revenue: round(revenue),
    cost: round(cost),
    profit: round(profit),

    // Taxas (0 a 1 — o frontend multiplica por 100 para exibir em %)
    ctr: round(ctr, 4),
    conversionRate: round(conversionRate, 4),
    bounceRate: round(bounceRate, 4),

    // Financeiras
    cpc: round(cpc),
    cac: round(cac),
    averageOrderValue: round(averageOrderValue),
    roas: round(roas),
    roi: round(roi, 4),
    ltv: round(ltv),
    ltvCacRatio: round(ltvCacRatio),
  };
}

/**
 * Reduz uma lista de registros de Analytics aos totais brutos.
 * Acumula weightedBounce para permitir a média ponderada depois.
 */
export function sumTotals(records) {
  return records.reduce(
    (acc, r) => ({
      users: acc.users + (r.users ?? 0),
      sessions: acc.sessions + (r.sessions ?? 0),
      pageViews: acc.pageViews + (r.pageViews ?? 0),
      revenue: acc.revenue + (r.revenue ?? 0),
      cost: acc.cost + (r.cost ?? 0),
      orders: acc.orders + (r.orders ?? 0),
      impressions: acc.impressions + (r.impressions ?? 0),
      clicks: acc.clicks + (r.clicks ?? 0),
      // Numerador da média ponderada: taxa × peso (sessões).
      weightedBounce: acc.weightedBounce + (r.bounceRate ?? 0) * (r.sessions ?? 0),
    }),
    {
      users: 0,
      sessions: 0,
      pageViews: 0,
      revenue: 0,
      cost: 0,
      orders: 0,
      impressions: 0,
      clicks: 0,
      weightedBounce: 0,
    },
  );
}