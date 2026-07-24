// Formatadores para compor as mensagens dos insights em português.
// Mantidos separados para que as regras cuidem só de LÓGICA, não de texto.

/** Formata como moeda brasileira. Retorna "—" para valores nulos. */
export function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/** Converte uma taxa (0 a 1) em percentual legível: 0.0345 → "3,5%". */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(decimals).replace('.', ',')}%`;
}

/** Formata número com casas decimais e vírgula decimal. */
export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals).replace('.', ',');
}

/** Formata inteiros com separador de milhar: 31240 → "31.240". */
export function formatInteger(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}