// Utilitário de agrupamento temporal. Converte uma data no "rótulo" do
// bucket a que ela pertence (dia, semana ou mês). Manter isso separado
// respeita o SRP: a calculadora não precisa saber nada sobre calendário.

/** Formata uma Date como YYYY-MM-DD (sem fuso, usando UTC para consistência). */
function toIsoDay(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Retorna a segunda-feira da semana a que a data pertence (padrão ISO 8601).
 * Usar sempre o primeiro dia da semana como rótulo garante que todos os dias
 * de uma mesma semana caiam no mesmo bucket e que a ordenação alfabética
 * das chaves coincida com a ordem cronológica.
 */
function toIsoWeekStart(date) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=domingo, 1=segunda ... 6=sábado
  // Quantos dias voltar para chegar na segunda. Domingo (0) volta 6 dias.
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return toIsoDay(d);
}

/** Retorna o rótulo do mês no formato YYYY-MM. */
function toMonth(date) {
  return date.toISOString().slice(0, 7);
}

// Mapa de estratégias: cada modo de agrupamento aponta para sua função.
// Adicionar "trimestre" no futuro é acrescentar uma linha aqui — nenhum
// if/else espalhado pelo código (princípio aberto/fechado do SOLID).
const GROUPERS = {
  day: toIsoDay,
  week: toIsoWeekStart,
  month: toMonth,
};

export const VALID_PERIODS = Object.keys(GROUPERS);

/**
 * Devolve a chave de agrupamento de uma data.
 * @param {Date} date
 * @param {'day'|'week'|'month'} period
 */
export function getPeriodKey(date, period) {
  const grouper = GROUPERS[period];
  if (!grouper) {
    throw new Error(`Período inválido: ${period}`);
  }
  return grouper(new Date(date));
}