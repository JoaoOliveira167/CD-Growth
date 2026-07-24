// Tabela genérica. Recebe a definição das colunas como dados, o que permite
// reutilizá-la em Campanhas e Analytics sem duplicar markup.

export function DataTable({ columns, rows, keyField = 'id', emptyMessage = 'Nenhum registro.' }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    // overflow-x-auto mantém a tabela usável no mobile, com rolagem lateral.
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr
              key={row[keyField] ?? index}
              className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-3 text-slate-700 dark:text-slate-200 ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {/* render permite customizar a célula; sem ele, exibe o valor cru */}
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}