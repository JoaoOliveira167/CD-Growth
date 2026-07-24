// Formatadores de exibição. Centralizados para garantir que moeda, percentual
// e data apareçam iguais em toda a aplicação.

/** Formata como Real brasileiro. Null vira travessão. */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Converte taxa (0 a 1) em percentual: 0.0345 → "3,5%". */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
}

/** Inteiro com separador de milhar: 31240 → "31.240". */
export function formatInteger(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

/** Número com casas decimais e vírgula: 8.99 → "8,99". */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals).replace('.', ',');
}

/** Multiplicador de ROAS: 8.99 → "8,99x". */
export function formatMultiplier(value) {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(value)}x`;
}

/** Data ISO → "23/07/2026". */
export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/** Rótulo de período do gráfico: "2026-07" → "jul/2026". */
export function formatPeriodLabel(key) {
  if (!key) return '';
  // Mês (YYYY-MM)
  if (key.length === 7) {
    const [year, month] = key.split('-');
    const names = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${names[Number(month) - 1]}/${year}`;
  }
  // Dia ou início de semana (YYYY-MM-DD)
  const [, month, day] = key.split('-');
  return `${day}/${month}`;
}

/** Retorna YYYY-MM-DD de N dias atrás (para os filtros padrão). */
export function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

/** Retorna a data de hoje em YYYY-MM-DD. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}