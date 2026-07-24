// Exibição padronizada de erro, com botão de nova tentativa.

import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <AlertCircle className="h-8 w-8 text-rose-500" />
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Não foi possível carregar os dados
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {error?.message ?? 'Erro desconhecido.'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}