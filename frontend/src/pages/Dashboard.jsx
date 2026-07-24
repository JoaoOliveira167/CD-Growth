// Tela principal: KPIs consolidados, evolução temporal, comparativo por
// canal e os insights mais críticos do Growth Engine.

import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, MousePointerClick, DollarSign, ShoppingCart, Target, Percent } from 'lucide-react';

import { useApi } from '../hooks/useApi.js';
import { useFilters } from '../hooks/useFilters.js';
import { metricsService } from '../services/metrics.service.js';
import { growthService } from '../services/growth.service.js';

import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { MetricCard } from '../components/ui/MetricCard.jsx';
import { PeriodFilter } from '../components/ui/PeriodFilter.jsx';
import { LineChart } from '../components/charts/LineChart.jsx';
import { BarChart } from '../components/charts/BarChart.jsx';

import {
  formatCurrency, formatInteger, formatPercent,
  formatMultiplier, formatPeriodLabel,
} from '../utils/formatters.js';

export default function Dashboard() {
  const { apiParams, filters } = useFilters();

  // Chave de dependência: refaz as requisições quando os filtros mudam.
  const depsKey = JSON.stringify(apiParams);

  // Três requisições independentes, cada uma com seu próprio estado —
  // assim um gráfico que falha não derruba a tela inteira.
  const overview = useApi(
    useCallback(() => metricsService.getOverview(apiParams), [depsKey]),
    [depsKey],
  );

  const timeSeries = useApi(
    useCallback(() => metricsService.getTimeSeries(apiParams), [depsKey]),
    [depsKey],
  );

  const bySource = useApi(
    useCallback(() => metricsService.getBySource(apiParams), [depsKey]),
    [depsKey],
  );

  const growth = useApi(
    useCallback(
      () => growthService.analyze({ startDate: filters.startDate, endDate: filters.endDate }),
      [filters.startDate, filters.endDate],
    ),
    [filters.startDate, filters.endDate],
  );

  const m = overview.data?.metrics;

  return (
    <div className="space-y-5">
      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter showGroupBy />
        {overview.data && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {formatInteger(overview.data.recordCount)} registros no período
          </span>
        )}
      </div>

      {/* ── KPIs ── */}
      {overview.loading && <Card><Spinner /></Card>}
      {overview.error && (
        <Card><ErrorState error={overview.error} onRetry={overview.refetch} /></Card>
      )}
      {m && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Usuários" value={formatInteger(m.users)} icon={Users} />
          <MetricCard label="Sessões" value={formatInteger(m.sessions)} icon={MousePointerClick} />
          <MetricCard label="Receita" value={formatCurrency(m.revenue)} icon={DollarSign} />
          <MetricCard label="Pedidos" value={formatInteger(m.orders)} icon={ShoppingCart} />
          <MetricCard label="ROAS" value={formatMultiplier(m.roas)} hint={`CAC ${formatCurrency(m.cac)}`} icon={Target} />
          <MetricCard label="Conversão" value={formatPercent(m.conversionRate, 2)} hint={`Rejeição ${formatPercent(m.bounceRate)}`} icon={Percent} />
        </div>
      )}

      {/* ── Evolução temporal ── */}
      <Card
        title="Evolução no período"
        subtitle={`Agrupado por ${{ day: 'dia', week: 'semana', month: 'mês' }[filters.groupBy]}`}
      >
        {timeSeries.loading && <Spinner />}
        {timeSeries.error && <ErrorState error={timeSeries.error} onRetry={timeSeries.refetch} />}
        {timeSeries.data?.series?.length === 0 && (
          <EmptyState description="Nenhum dado de analytics no período selecionado." />
        )}
        {timeSeries.data?.series?.length > 0 && (
          <LineChart
            labels={timeSeries.data.series.map((s) => formatPeriodLabel(s.period))}
            datasets={[
              { label: 'Receita', data: timeSeries.data.series.map((s) => s.metrics.revenue) },
              { label: 'Custo', data: timeSeries.data.series.map((s) => s.metrics.cost) },
            ]}
            currency
          />
        )}
      </Card>

      {/* ── Canais + Insights, lado a lado no desktop ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Receita por canal" subtitle="Comparativo de origens de tráfego">
          {bySource.loading && <Spinner />}
          {bySource.error && <ErrorState error={bySource.error} onRetry={bySource.refetch} />}
          {bySource.data?.data?.length === 0 && <EmptyState />}
          {bySource.data?.data?.length > 0 && (
            <BarChart
              labels={bySource.data.data.map((s) => s.source)}
              datasets={[
                { label: 'Receita', data: bySource.data.data.map((s) => s.metrics.revenue) },
                { label: 'Custo', data: bySource.data.data.map((s) => s.metrics.cost) },
              ]}
              currency
            />
          )}
        </Card>

        <Card
          title="Insights do Growth Engine"
          subtitle="Diagnósticos automáticos"
          action={
            <Link to="/insights" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              Ver todos
            </Link>
          }
        >
          {growth.loading && <Spinner />}
          {growth.error && <ErrorState error={growth.error} onRetry={growth.refetch} />}
          {growth.data?.insights?.length === 0 && (
            <EmptyState
              title="Nenhum alerta"
              description="Suas métricas estão dentro dos parâmetros esperados."
            />
          )}
          {growth.data?.insights?.length > 0 && (
            <ul className="space-y-3">
              {/* Só os 4 primeiros — já vêm ordenados por severidade */}
              {growth.data.insights.slice(0, 4).map((insight, index) => (
                <li
                  key={`${insight.code}-${index}`}
                  className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {insight.title}
                    </p>
                    <Badge variant={insight.level}>
                      {{ critical: 'Crítico', warning: 'Atenção', info: 'Info' }[insight.level]}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {insight.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}