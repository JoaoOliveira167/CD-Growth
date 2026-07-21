// Centraliza a leitura das variáveis de ambiente em um único lugar.
// Assim, o resto do código importa daqui em vez de acessar process.env solto,
// o que facilita validação e evita "strings mágicas" espalhadas.

import dotenv from 'dotenv';

// Carrega o arquivo .env para dentro de process.env
dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3333,
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Falha rápido: se faltar configuração essencial, o app nem sobe.
// É melhor quebrar no boot do que dar erro obscuro em produção.
if (!env.databaseUrl) {
  throw new Error('Variável de ambiente DATABASE_URL não definida.');
}