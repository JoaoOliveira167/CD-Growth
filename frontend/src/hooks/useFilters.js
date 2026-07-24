// Acesso tipado ao FilterContext.

import { useContext } from 'react';
import { FilterContext } from '../contexts/FilterContext.jsx';

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters precisa estar dentro de <FilterProvider>.');
  }
  return context;
}