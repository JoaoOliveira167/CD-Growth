// Wrapper do gráfico de rosca — bom para participação percentual.

import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme.js';
import { CHART_COLORS } from './chartTheme.js';

export function DoughnutChart({ labels, values, height = 260 }) {
  const { isDark } = useTheme();
  const textColor = isDark ? '#cbd5e1' : '#475569';

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%', // espessura do anel
    plugins: {
      legend: {
        position: 'right',
        labels: { color: textColor, boxWidth: 10, usePointStyle: true, font: { size: 11 } },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}