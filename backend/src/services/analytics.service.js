// Service de importação de Analytics. Orquestra todo o fluxo:
//  1. Confere se veio arquivo.
//  2. Faz o parse do CSV.
//  3. Valida se o cabeçalho tem todas as colunas obrigatórias.
//  4. Para cada linha: valida (DTO), resolve a campanha pelo nome,
//     checa duplicidade e acumula em "para inserir" ou "erros".
//  5. Insere em lote as linhas válidas e devolve um RELATÓRIO detalhado.
// Não conhece req/res.

import { analyticsRepository } from '../repositories/analytics.repository.js';
import {
  parseAnalyticsRow,
  REQUIRED_COLUMNS,
} from '../dtos/analytics.dto.js';
import { parseCsv, removeFile } from '../utils/csvParser.js';
import { AppError } from '../utils/AppError.js';

export const analyticsService = {
  /**
   * Importa um CSV de analytics.
   * @param {object} file  O objeto req.file gerado pelo Multer.
   * @returns {Promise<object>}  Relatório da importação.
   */
  async importCsv(file) {
    // 1. Arquivo inexistente — Multer não populou req.file.
    if (!file) {
      throw new AppError('Nenhum arquivo enviado. Use o campo "file".', 400);
    }

    try {
      // 2. Lê o CSV do disco.
      const rows = await parseCsv(file.path);

      // Arquivo vazio (sem linhas de dados).
      if (rows.length === 0) {
        throw new AppError('O arquivo CSV está vazio.', 400);
      }

      // 3. Validação do cabeçalho: todas as colunas obrigatórias presentes?
      const headers = Object.keys(rows[0]);
      const missing = REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
      if (missing.length > 0) {
        throw new AppError(
          `Colunas obrigatórias ausentes: ${missing.join(', ')}.`,
          400,
        );
      }

      // Estruturas de acumulação para o relatório.
      const toInsert = []; // linhas válidas e prontas
      const report = {
        totalRows: rows.length,
        imported: 0,
        skippedDuplicates: 0,
        failed: 0,
        errors: [], // detalhes por linha com problema
      };

      // Cache de campanhas por nome, para não consultar o banco repetidamente
      // quando várias linhas apontam para a mesma campanha.
      const campaignCache = new Map();

      // 4. Processa cada linha.
      for (let i = 0; i < rows.length; i += 1) {
        const lineNumber = i + 2; // +2: linha 1 é o cabeçalho, índice começa em 0
        const parsed = parseAnalyticsRow(rows[i]);

        // 4a. Linha com valores inválidos.
        if (!parsed.ok) {
          report.failed += 1;
          report.errors.push({ line: lineNumber, issues: parsed.errors });
          continue;
        }

        // 4b. Resolve a campanha pelo nome (usando cache).
        let campaign = campaignCache.get(parsed.campaignName);
        if (campaign === undefined) {
          campaign = await analyticsRepository.findCampaignByName(parsed.campaignName);
          campaignCache.set(parsed.campaignName, campaign);
        }
        if (!campaign) {
          report.failed += 1;
          report.errors.push({
            line: lineNumber,
            issues: [`campanha "${parsed.campaignName}" não encontrada`],
          });
          continue;
        }

        // 4c. Duplicidade: mesma campanha + data + origem já existe?
        const duplicate = await analyticsRepository.findDuplicate({
          campaignId: campaign.id,
          date: parsed.data.date,
          source: parsed.data.source,
        });
        if (duplicate) {
          report.skippedDuplicates += 1;
          continue;
        }

        // 4d. Linha aprovada: monta o registro final para inserção.
        toInsert.push({ ...parsed.data, campaignId: campaign.id });
      }

      // 5. Inserção em lote das linhas válidas.
      if (toInsert.length > 0) {
        await analyticsRepository.createMany(toInsert);
        report.imported = toInsert.length;
      }

      return report;
    } finally {
      // Remove o arquivo temporário SEMPRE, com sucesso ou erro.
      removeFile(file.path);
    }
  },
};