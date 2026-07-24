// Utilitário de parse de CSV. Encapsula o csv-parser (que é baseado em
// streams e callbacks) numa Promise, para a camada de service poder usar
// async/await de forma limpa. Também remove o arquivo do disco ao final,
// já que ele é temporário e não precisa ficar acumulando.

import fs from 'node:fs';
import csvParser from 'csv-parser';

/**
 * Lê um CSV do disco e devolve suas linhas como array de objetos.
 * As chaves de cada objeto são os cabeçalhos do CSV.
 *
 * @param {string} filePath  Caminho do arquivo salvo pelo Multer.
 * @returns {Promise<Array<object>>}
 */
export function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .on('error', reject) // falha ao abrir o arquivo
      .pipe(
        csvParser({
          // Normaliza cabeçalhos: remove espaços e BOM (caractere invisível
          // que o Excel/Google costuma colocar no início do arquivo).
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
          // Remove espaços nas pontas de cada valor.
          mapValues: ({ value }) => (typeof value === 'string' ? value.trim() : value),
        }),
      )
      .on('data', (row) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject); // falha durante o parse
  });
}

/**
 * Remove o arquivo temporário do disco. Chamada num finally para garantir
 * limpeza mesmo se a importação falhar. Erros de remoção são só logados,
 * pois não devem derrubar a resposta ao cliente.
 *
 * @param {string} filePath
 */
export function removeFile(filePath) {
  fs.unlink(filePath, (error) => {
    if (error) {
      console.error(`[csvParser] Falha ao remover arquivo temporário: ${filePath}`, error);
    }
  });
}