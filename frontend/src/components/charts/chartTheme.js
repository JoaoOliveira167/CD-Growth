// Opções compartilhadas dos gráficos, sensíveis ao tema. Chart.js desenha em
// canvas e não enxerga classes CSS — as cores precisam ser passadas em JS.

export function getChartOptions(isDark, { currency = false } = {}) {
  const gridColor = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(100,116,139,0.15)';
  const textColor = isDark ? '#cbd5e1' : '#475569';

  return {
    responsive: true,
    maintainAspectRatio: false, // permite controlar a altura via CSS
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { color: textColor, boxWidth: 10, usePointStyle: true, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#0f172a',
        padding: 10,
        cornerRadius: 8,
        callbacks: currency
          ? {
              label: (ctx) =>
                `${ctx.dataset.label}: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency', currency: 'BRL',
                }).format(ctx.parsed.y)}`,
            }
          : undefined,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 } },
        border: { color: gridColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };
}

// Paleta usada nas séries, na ordem.
export const CHART_COLORS = [
  '#3182f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
];