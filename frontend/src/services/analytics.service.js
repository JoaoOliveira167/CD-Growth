// Serviço de importação de CSV.

import { api } from './api.js';

export const analyticsService = {
  /**
   * Envia o CSV para o backend.
   * @param {File} file  Arquivo selecionado pelo usuário.
   * @param {Function} onProgress  Callback com o percentual (0-100).
   */
  importCsv: (file, onProgress) => {
    // multipart/form-data é obrigatório para upload de arquivo.
    const formData = new FormData();
    formData.append('file', file); // o campo precisa se chamar "file" (Multer)

    return api
      .post('/analytics/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Progresso do upload, para alimentar a barra na interface.
        onUploadProgress: (event) => {
          if (onProgress && event.total) {
            onProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      })
      .then((r) => r.data);
  },
};