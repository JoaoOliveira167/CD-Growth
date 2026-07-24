// Etiqueta colorida por severidade/status.

// Mapa de variantes → classes. Centralizar evita condicionais espalhadas.
const VARIANTS = {
  info: 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  critical: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export function Badge({ variant = 'neutral', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        VARIANTS[variant] ?? VARIANTS.neutral
      }`}
    >
      {children}
    </span>
  );
}