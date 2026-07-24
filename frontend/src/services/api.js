// Instância única do Axios. ÚNICO ponto do frontend que conhece a URL da API
// e detalhes de HTTP. Componentes nunca importam axios diretamente.

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api',
  timeout: 15000, // 15s — evita requisição pendurada para sempre
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de RESPOSTA: normaliza os erros do backend num formato único,
// para que os componentes não precisem cavar dentro de error.response.data.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // O backend responde { status, message, errors? }
    const payload = error.response?.data;

    const normalized = {
      status: error.response?.status ?? 0,
      message:
        payload?.message ??
        (error.code === 'ECONNABORTED'
          ? 'A requisição demorou demais. Tente novamente.'
          : 'Não foi possível conectar à API. Verifique se o backend está rodando.'),
      errors: payload?.errors ?? [], // erros por campo, vindos do DTO
    };

    return Promise.reject(normalized);
  },
);