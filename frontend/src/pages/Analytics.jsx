// Análise detalhada: alternância entre visão por canal e por campanha,
// com tabela completa de métricas e gráfico de participação na receita.

import { useState, useCallback } from 'react';

import { useApi } from '../hooks/useApi.js';
import { useFilters } from '../hooks/useFilters.js';
import { metricsService } from '../services/metrics.service.js';

import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { PeriodFilter } from '../components/ui/PeriodFilter.jsx';
import { DoughnutChart } from '../components/charts/DoughnutChart.jsx';
import { LineChart } from '../components/charts/LineChart.jsx';

import {
  formatCurrency, formatInteger, formatPercent,
  formatMultiplier, formatPeriodLabel,
} from '../utils/formatters.js';

// As duas dimensões de análise disponíveis.
const VIEWS = [
  { id: 'source', label: 'Por canal' },
  { id: 'campaign', label: 'Por campanha' },
];

export default function Analytics() {
  const { apiParams, filters } = useFilters();
  const [view, setView] = useState('source');

  const depsKey = JSON.stringify(apiParams);

  // Busca a agregação conforme a visão selecionada.
  const grouped = useApi(
    useCallback(
      () =>
        view === 'source'
          ? metricsService.getBySource(apiParams)
          : metricsService.getByCampaign(apiParams),
      [depsKey, view],
    ),
    [depsKey, view],
  );

  const series = useApi(
    useCallback(() => metricsService.getTimeSeries(apiParams), [depsKey]),
    [depsKey],
  );

  const rows = grouped.data?.data ?? [];

  // Colunas comuns às duas visões, com a primeira coluna variando.
  const columns = [
    view === 'source'
      ? {
          key: 'source',
          header: 'Canal',
          render: (row) => (
            <span className="font-medium text-slate-900 dark:text-slate-100">{row.source}</span>
          ),
        }
      : {
          key: 'campaignName',
          header: 'Campanha',
          render: (row) => (
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">{row.campaignName}</p>
              {row.goal && <p className="text-xs text-slate-500 dark:text-slate-400">{row.goal}</p>}
            </div>
          ),
        },
    { key: 'sessions', header: 'Sessões', align: 'right', render: (r) => formatInteger(r.metrics.sessions) },
    { key: 'orders', header: 'Pedidos', align: 'right', render: (r) => formatInteger(r.metrics.orders) },
    { key: 'revenue', header: 'Receita', align: 'right', render: (r) => formatCurrency(r.metrics.revenue) },
    { key: 'cost', header: 'Custo', align: 'right', render: (r) => formatCurrency(r.metrics.cost) },
    { key: 'cac', header: 'CAC', align: 'right', render: (r) => formatCurrency(r.metrics.cac) },
    {
      key: 'roas',
      header: 'ROAS',
      align: 'right',
      render: (r) => (
        // Cor sinaliza a saúde: verde acima de 2, âmbar entre 1 e 2, vermelho abaixo.
        <Badge
          variant={
            r.metrics.roas === null ? 'neutral'
              : r.metrics.roas >= 2 ? 'success'
              : r.metrics.roas >= 1 ? 'warning'
              : 'critical'
          }
        >
          {formatMultiplier(r.metrics.roas)}
        </Badge>
      ),
    },
    {
      key: 'conversionRate',
      header: 'Conversão',
      align: 'right',
      render: (r) => formatPercent(r.metrics.conversionRate, 2),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter showGroupBy />

        {/* Alternador de visão */}
        <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                view === item.id
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela detalhada */}
      <Card title={view === 'source' ? 'Desempenho por canal' : 'Desempenho por campanha'}>
        {grouped.loading && <Spinner />}
        {grouped.error && <ErrorState error={grouped.error} onRetry={grouped.refetch} />}
        {grouped.data && (
          <DataTable
            columns={columns}
            rows={rows}
            keyField={view === 'source' ? 'source' : 'campaignId'}
            emptyMessage="Nenhum dado no período selecionado."
          />
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Participação na receita */}
        <Card title="Participação na receita" className="lg:col-span-1">
          {grouped.loading && <Spinner />}
          {rows.length > 0 && (
            <DoughnutChart
              labels={rows.map((r) => (view === 'source' ? r.source : r.campaignName))}
              values={rows.map((r) => r.metrics.revenue)}
            />
          )}
        </Card>

        {/* Evolução de sessões e pedidos */}
        <Card title="Sessões e pedidos" subtitle="Evolução no período" className="lg:col-span-2">
          {series.loading && <Spinner />}
          {series.error && <ErrorState error={series.error} onRetry={series.refetch} />}
          {series.data?.series?.length > 0 && (
            <LineChart
              labels={series.data.series.map((s) => formatPeriodLabel(s.period))}
              datasets={[
                { label: 'Sessões', data: series.data.series.map((s) => s.metrics.sessions) },
                { label: 'Pedidos', data: series.data.series.map((s) => s.metrics.orders) },
              ]}
              height={260}
            />
          )}
        </Card>
      </div>
    </div>
  );
}