// Ponto de entrada do React.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './lib/chartSetup.js'; // registra os módulos do Chart.js uma única vez

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);