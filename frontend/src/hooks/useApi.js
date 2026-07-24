// Hook genérico de requisição. Encapsula o trio loading/data/error que
// todo fetch precisa, evitando repetir esse boilerplate em cada tela.

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * @param {Function} fetcher  Função async que retorna os dados.
 * @param {Array} deps  Dependências que disparam nova busca ao mudar.
 * @param {object} options  { immediate: dispara ao montar? }
 */
export function useApi(fetcher, deps = [], { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Guarda a referência da função para não recriar o callback a cada render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Flag que evita atualizar estado de um componente já desmontado
  // (causa clássica de memory leak e warning no console).
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(...args);
      if (mountedRef.current) setData(result);
      return result;
    } catch (err) {
      if (mountedRef.current) setError(err);
      throw err;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) execute().catch(() => {}); // erro já está no estado
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: execute, setData };
}