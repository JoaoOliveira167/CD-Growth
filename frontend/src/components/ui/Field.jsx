// Campo de formulário com rótulo e mensagem de erro. Um só componente para
// input e select, já que a estrutura ao redor é idêntica.

export function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}

// Classes compartilhadas entre input e select, exportadas para reuso.
export const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ' +
  'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-900';