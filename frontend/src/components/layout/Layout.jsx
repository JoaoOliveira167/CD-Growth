// Casca da aplicação: sidebar + header + área de conteúdo.
// Usa <Outlet /> do React Router para renderizar a página da rota atual.

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';

// Metadados de cada rota, usados no cabeçalho.
const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral das suas métricas de Growth' },
  '/campanhas': { title: 'Campanhas', subtitle: 'Gerencie suas campanhas de marketing' },
  '/importacao': { title: 'Importação', subtitle: 'Importe dados do Google Analytics' },
  '/analytics': { title: 'Analytics', subtitle: 'Análise detalhada por canal e campanha' },
  '/insights': { title: 'Insights', subtitle: 'Diagnósticos gerados automaticamente' },
  '/configuracoes': { title: 'Configurações', subtitle: 'Preferências da plataforma' },
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const meta = PAGE_META[pathname] ?? { title: 'Growth Analytics' };

  return (
    <div className="min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* lg:pl-64 abre espaço para a sidebar fixa no desktop */}
      <div className="lg:pl-64">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}