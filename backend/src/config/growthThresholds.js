// Limites que disparam os insights. Centralizados aqui para que ajustar a
// sensibilidade do motor seja mudar UM arquivo de configuração — nunca a
// lógica das regras. Em produção, estes valores poderiam vir do banco,
// permitindo que cada cliente calibre seus próprios parâmetros.

export const GROWTH_THRESHOLDS = {
  // ROAS = receita / custo. Abaixo de 1 a operação perde dinheiro.
  roas: { warning: 2, critical: 1 },

  // CTR = cliques / impressões. 3% é uma referência comum em mídia paga.
  ctr: { warning: 0.03, critical: 0.01 },

  // Bounce rate ponderado. Acima de 70% indica problema de experiência.
  bounceRate: { warning: 0.7, critical: 0.85 },

  // Razão LTV/CAC. Abaixo de 3 é apertado; abaixo de 1 queima caixa.
  ltvCac: { warning: 3, critical: 1 },

  // Queda percentual na taxa de conversão entre períodos.
  conversionDrop: { warning: 0.1, critical: 0.25 },

  // Variação percentual de receita entre períodos.
  revenueChange: { growth: 0.1, drop: 0.15 },

  // Diferença mínima entre o melhor e o pior canal para valer um alerta.
  channelGap: 0.5, // pior precisa ter ROAS <= 50% do melhor

  // Volume mínimo para uma amostra ser considerada confiável.
  // Sem isso, um canal com 3 sessões e 1 venda apareceria como "o melhor".
  minimumVolume: { sessions: 100, cost: 50 },

  // Janela padrão de análise, em dias.
  defaultWindowDays: 30,
};