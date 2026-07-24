// Contexto de filtros globais. Mantém o período e os recortes selecionados
// compartilhados entre as telas — trocar a data no Dashboard e navegar para
// Analytics preserva o filtro, que é o comportamento esperado num BI.

import { createContext, useState, useMemo, useCallback } from 'react';
import { daysAgo, today } from '../utils/formatters.js';

export const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    startDate: daysAgo(29), // últimos 30 dias, incluindo hoje
    endDate: today(),
    campaignId: '',
    source: '',
    groupBy: 'day',
  });

  /** Atualiza um ou mais filtros, preservando os demais. */
  const updateFilters = useCallback((partial) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  /** Atalho para períodos comuns (7, 30, 90 dias). */
  const setPeriodDays = useCallback((days) => {
    setFilters((prev) => ({
      ...prev,
      startDate: daysAgo(days - 1),
      endDate: today(),
    }));
  }, []);

  /**
   * Remove chaves vazias antes de enviar à API — evita mandar
   * "?source=&campaignId=" e poluir a query string.
   */
  const apiParams = useMemo(() => {
    const params = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    }
    return params;
  }, [filters]);

  return (
    <FilterContext.Provider value={{ filters, updateFilters, setPeriodDays, apiParams }}>
      {children}
    </FilterContext.Provider>
  );
}