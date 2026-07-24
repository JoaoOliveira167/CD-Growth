// Acesso tipado ao ThemeContext, com erro claro se usado fora do Provider.

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext.jsx';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme precisa estar dentro de <ThemeProvider>.');
  }
  return context;
}