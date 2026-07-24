// Wrapper do gráfico de barras.

import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme.js';
import { getChartOptions, CHART_COLORS } from './chartTheme.js';

export function BarChart({ labels, datasets, currency = false, height = 300 }) {
  const { isDark } = useTheme();

  const data = {
    labels,
    datasets: datasets.map((set, index) => ({
      ...set,
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
      borderRadius: 6,
      maxBarThickness: 48,
    })),
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={getChartOptions(isDark, { currency })} />
    </div>
  );
}