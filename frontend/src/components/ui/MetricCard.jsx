// Cartão de KPI: número grande + rótulo + variação opcional.

import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetricCard({ label, value, hint, trend, icon: Icon }) {
  // trend é a variação percentual (ex.: 0.12 = +12%). Null oculta o indicador.
  const hasTrend = trend !== null && trend !== undefined;
  const isPositive = hasTrend && trend >= 0;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>

      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </p>

      <div className="mt-1 flex items-center gap-2">
        {hasTrend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend * 100).toFixed(1).replace('.', ',')}%
          </span>
        )}
        {hint && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}