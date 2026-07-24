// DTO de Analytics para IMPORTAÇÃO de CSV.
// Valida e converte UMA linha do CSV (todos os valores chegam como string)
// para o formato tipado do banco. Retorna { ok, data, errors } em vez de
// lançar, para que o importador consiga processar as linhas boas e
// relatar as ruins sem abortar tudo.

// Colunas obrigatórias no cabeçalho do CSV (exatamente como o GA exporta).
export const REQUIRED_COLUMNS = [
  'Date',
  'Users',
  'Sessions',
  'Revenue',
  'Orders',
  'Source',
  'Campaign',
];

// Converte string para inteiro >= 0. Aceita vazio como 0.
function toInt(value) {
  if (value === undefined || value === '') return { ok: true, value: 0 };
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0) {
    return { ok: false, message: 'deve ser um inteiro não-negativo' };
  }
  return { ok: true, value: num };
}

// Converte string para número decimal >= 0. Aceita vazio como 0.
// Troca vírgula por ponto (planilhas em pt-BR usam vírgula decimal).
function toFloat(value) {
  if (value === undefined || value === '') return { ok: true, value: 0 };
  const num = Number(String(value).replace(',', '.'));
  if (Number.isNaN(num) || num < 0) {
    return { ok: false, message: 'deve ser um número não-negativo' };
  }
  return { ok: true, value: num };
}

// Converte string para Date válida.
function toDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: 'data inválida' };
  }
  return { ok: true, value: date };
}

/**
 * Valida e normaliza uma linha do CSV.
 * @param {object} row  Objeto com as chaves = cabeçalhos do CSV.
 * @returns {{ ok: boolean, data?: object, campaignName?: string, errors: string[] }}
 */
export function parseAnalyticsRow(row) {
  const errors = [];
  const data = {};

  // Campos numéricos e de data, com seus conversores.
  const fields = [
    ['date', 'Date', toDate],
    ['users', 'Users', toInt],
    ['sessions', 'Sessions', toInt],
    ['revenue', 'Revenue', toFloat],
    ['orders', 'Orders', toInt],
  ];

  for (const [key, column, convert] of fields) {
    const result = convert(row[column]);
    if (result.ok) {
      data[key] = result.value;
    } else {
      errors.push(`"${column}" ${result.message}`);
    }
  }

  // Source — texto obrigatório.
  if (!row.Source || row.Source.length === 0) {
    errors.push('"Source" é obrigatório');
  } else {
    data.source = row.Source;
  }

  // Campaign — não vai para o banco direto; é o nome usado para achar a
  // campanha e obter o campaignId. Retornado à parte.
  const campaignName = row.Campaign;
  if (!campaignName || campaignName.length === 0) {
    errors.push('"Campaign" é obrigatório');
  }

  return { ok: errors.length === 0, data, campaignName, errors };
}