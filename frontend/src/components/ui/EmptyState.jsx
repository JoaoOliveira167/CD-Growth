// Estado vazio — quando a requisição deu certo mas não há dados.
// Distinguir "vazio" de "erro" é essencial para não confundir o usuário.

import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Nenhum dado encontrado', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <Inbox className="h-8 w-8 text-slate-400" />
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}