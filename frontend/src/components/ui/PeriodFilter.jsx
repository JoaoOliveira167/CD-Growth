// Seletor de período, compartilhado entre Dashboard e Analytics.
// Escreve direto no FilterContext, então qualquer tela reflete a mudança.

import { useFilters } from '../../hooks/useFilters.js';

const PRESETS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
];

export function PeriodFilter({ showGroupBy = false }) {
  const { filters, updateFilters, setPeriodDays } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Atalhos rápidos */}
      <div className="flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
        {PRESETS.map(({ label, days }) => (
          <button
            key={days}
            onClick={() => setPeriodDays(days)}
            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Datas específicas */}
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => updateFilters({ startDate: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
      <span className="text-xs text-slate-400">até</span>
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => updateFilters({ endDate: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />

      {/* Granularidade do gráfico temporal */}
      {showGroupBy && (
        <select
          value={filters.groupBy}
          onChange={(e) => updateFilters({ groupBy: e.target.value })}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <option value="day">Por dia</option>
          <option value="week">Por semana</option>
          <option value="month">Por mês</option>
        </select>
      )}
    </div>
  );
}