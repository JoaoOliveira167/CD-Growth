// Configuração do React Router. Todas as rotas compartilham o Layout,
// que renderiza a página atual via <Outlet />.

import { Routes, Route } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.jsx';

import Dashboard from '../pages/Dashboard.jsx';
import Campaigns from '../pages/Campaigns.jsx';
import Import from '../pages/Import.jsx';
import Analytics from '../pages/Analytics.jsx';
import Insights from '../pages/Insights.jsx';
import Settings from '../pages/Settings.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="/campanhas" element={<Campaigns />} />
        <Route path="/importacao" element={<Import />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/configuracoes" element={<Settings />} />
        {/* Rota desconhecida cai no Dashboard */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}