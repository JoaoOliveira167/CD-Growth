// Insights do Growth Engine: executa a análise, filtra por severidade e
// exibe cada diagnóstico com sua sugestão de ação.

import { useState, useCallback } from 'react';
import { RefreshCw, Save, AlertOctagon, AlertTriangle, Info, Lightbulb } from 'lucide-react';

import { useApi } from '../hooks/useApi.js';
import { useFilters } from '../hooks/useFilters.js';
import { growthService } from '../services/growth.service.js';

import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { PeriodFilter } from '../components/ui/PeriodFilter.jsx';
import { formatDate } from '../utils/formatters.js';

// Metadados de cada severidade: rótulo, ícone e cor da borda.
const LEVELS = {
  critical: { label: 'Crítico', icon: AlertOctagon, border: 'border-l-rose-500' },
  warning: { label: 'Atenção', icon: AlertTriangle, border: 'border-l-amber-500' },
  info: { label: 'Informativo', icon: Info, border: 'border-l-brand-500' },
};

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'critical', label: 'Críticos' },
  { id: 'warning', label: 'Atenção' },
  { id: 'info', label: 'Informativos' },
];

export default function Insights() {
  const { filters } = useFilters();
  const [levelFilter, setLevelFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(null);

  const params = { startDate: filters.startDate, endDate: filters.endDate };
  const depsKey = `${filters.startDate}|${filters.endDate}`;

  const analysis = useApi(
    useCallback(() => growthService.analyze(params), [depsKey]),
    [depsKey],
  );

  /** Persiste o diagnóstico atual no banco. */
  async function handleSave() {
    setSaving(true);
    setSavedMessage(null);
    try {
      const result = await growthService.analyzeAndSave(params);
      setSavedMessage(`${result.persisted} insight(s) salvo(s) com sucesso.`);
    } catch (error) {
      setSavedMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const insights = analysis.data?.insights ?? [];
  const visible =
    levelFilter === 'all' ? insights : insights.filter((i) => i.level === levelFilter);
  const summary = analysis.data?.summary;

  return (
    <div className="space-y-5">
      {/* Ações e filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter />
        <div className="flex gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={analysis.refetch} loading={analysis.loading}>
            Reanalisar
          </Button>
          <Button icon={Save} onClick={handleSave} loading={saving} disabled={insights.length === 0}>
            Salvar
          </Button>
        </div>
      </div>

      {savedMessage && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {savedMessage}
        </p>
      )}

      {/* Resumo por severidade */}
      {summary && summary.total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {['critical', 'warning', 'info'].map((level) => {
            const { label, icon: Icon } = LEVELS[level];
            return (
              <div key={level} className="card">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {summary[level]}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filtro por severidade */}
      {insights.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setLevelFilter(item.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                levelFilter === item.id
                  ? 'bg-brand-500 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Lista de insights */}
      {analysis.loading && <Card><Spinner label="Analisando suas métricas..." /></Card>}
      {analysis.error && <Card><ErrorState error={analysis.error} onRetry={analysis.refetch} /></Card>}

      {analysis.data && insights.length === 0 && (
        <Card>
          <EmptyState
            title="Nenhum alerta no período"
            description={
              analysis.data.message ??
              'Todas as métricas estão dentro dos parâmetros configurados no Growth Engine.'
            }
          />
        </Card>
      )}

      {visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((insight, index) => {
            const meta = LEVELS[insight.level] ?? LEVELS.info;
            const Icon = meta.icon;

            return (
              <div
                key={`${insight.code}-${index}`}
                className={`card border-l-4 ${meta.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {insight.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant={insight.level}>{meta.label}</Badge>
                </div>

                {/* Sugestão de ação, destacada do diagnóstico */}
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {insight.suggestion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rodapé com o período analisado */}
      {analysis.data?.period && (
        <p className="text-center text-xs text-slate-400">
          Período analisado: {formatDate(analysis.data.period.current.startDate)} a{' '}
          {formatDate(analysis.data.period.current.endDate)}
          {analysis.data.hasComparison
            ? ` · comparado com ${formatDate(analysis.data.period.previous.startDate)} a ${formatDate(analysis.data.period.previous.endDate)}`
            : ' · sem período anterior comparável'}
        </p>
      )}
    </div>
  );
}