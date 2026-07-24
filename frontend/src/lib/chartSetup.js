// Registro dos módulos do Chart.js. A v3+ usa "tree shaking": só o que for
// explicitamente registrado entra no bundle. Este arquivo é importado UMA vez
// (no main.jsx) e vale para toda a aplicação.

import {
  Chart as ChartJS,
  CategoryScale,   // eixo X de categorias
  LinearScale,     // eixo Y numérico
  PointElement,    // pontos da linha
  LineElement,     // a linha em si
  BarElement,      // barras
  ArcElement,      // fatias de rosca/pizza
  Filler,          // preenchimento sob a linha
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
);