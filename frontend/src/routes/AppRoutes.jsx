// Configuração do React Router. As páginas ainda não criadas usam um
// placeholder temporário — serão substituídas na próxima etapa.

import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';
import Dashboard from '../pages/Dashboard.jsx';

// Placeholder para as telas da próxima etapa.
function EmDesenvolvimento({ nome }) {
  return (
    <div className="card text-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        A tela de <strong>{nome}</strong> será implementada na próxima etapa.
      </p>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Todas as rotas compartilham o Layout (sidebar + header) */}
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/campanhas" element={<EmDesenvolvimento nome="Campanhas" />} />
        <Route path="/importacao" element={<EmDesenvolvimento nome="Importação" />} />
        <Route path="/analytics" element={<EmDesenvolvimento nome="Analytics" />} />
        <Route path="/insights" element={<EmDesenvolvimento nome="Insights" />} />
        <Route path="/configuracoes" element={<EmDesenvolvimento nome="Configurações" />} />
        {/* Qualquer rota desconhecida cai no Dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}