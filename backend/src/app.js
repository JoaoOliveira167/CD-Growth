// Monta e configura a aplicação Express (middlewares e rotas), mas NÃO sobe
// o servidor — isso fica no server.js. Essa separação permite importar o app
// em testes sem precisar abrir uma porta.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { routes } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { env } from './config/env.js';

const app = express();

// ── Middlewares de segurança e performance ───────────────────
// helmet: define cabeçalhos HTTP seguros (protege contra ataques comuns
//         como clickjacking, sniffing de MIME, etc.).
app.use(helmet());

// cors: libera o frontend (que roda em outra porta) a consumir a API.
app.use(cors());

// compression: comprime as respostas com gzip, reduzindo o tráfego.
app.use(compression());

// express.json: faz o parse do corpo das requisições em formato JSON.
app.use(express.json());

// morgan: LOGGER de requisições HTTP. Registra método, rota, status e tempo
//         de resposta no console. Formato "dev" (colorido) em desenvolvimento,
//         "combined" (padrão Apache, mais completo) em produção.
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// ── Healthcheck ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'growth-analytics-api' });
});

// ── Rotas da aplicação ───────────────────────────────────────
// Todas as rotas de negócio ficam sob o prefixo /api.
app.use('/api', routes);

// ── Rota não encontrada (404) ────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada.' });
});

// ── Tratamento global de erros ───────────────────────────────
// IMPORTANTE: precisa ser o ÚLTIMO middleware registrado.
app.use(errorHandler);

export { app };