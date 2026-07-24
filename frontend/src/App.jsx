// Raiz da aplicação: empilha os Providers e o Router.
// A ordem importa — os contextos precisam envolver as rotas para que
// qualquer página consiga consumi-los.

import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { FilterProvider } from './contexts/FilterContext.jsx';
import { AppRoutes } from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <FilterProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FilterProvider>
    </ThemeProvider>
  );
}