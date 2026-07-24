// Wrapper do gráfico de linhas. Recebe dados já formatados e aplica o tema.

import { Line } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme.js';
import { getChartOptions, CHART_COLORS } from './chartTheme.js';

/**
 * @param {string[]} labels  Rótulos do eixo X.
 * @param {Array} datasets  [{ label, data }]
 * @param {boolean} currency  Formata o tooltip como moeda.
 */
export function LineChart({ labels, datasets, currency = false, height = 300 }) {
  const { isDark } = useTheme();

  const data = {
    labels,
    datasets: datasets.map((set, index) => ({
      ...set,
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}22`, // 22 = ~13% alpha
      borderWidth: 2,
      pointRadius: 0,      // pontos só aparecem no hover
      pointHoverRadius: 4,
      tension: 0.35,       // suaviza a curva
      fill: true,
    })),
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={getChartOptions(isDark, { currency })} />
    </div>
  );
}