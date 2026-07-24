// Contexto de tema. Guarda a preferência do usuário, aplica a classe "dark"
// no <html> (que é o gatilho do Tailwind) e persiste no localStorage para
// que a escolha sobreviva ao recarregar a página.

import { createContext, useEffect, useState, useCallback } from 'react';

export const ThemeContext = createContext(null);

const STORAGE_KEY = 'growth-theme';

/** Descobre o tema inicial: preferência salva > preferência do SO > claro. */
function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  // Sem escolha prévia, respeita a configuração do sistema operacional.
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Sincroniza o estado do React com o DOM e o localStorage.
  useEffect(() => {
    const root = document.documentElement; // <html>

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}