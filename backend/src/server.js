// Ponto de entrada da aplicação. Única responsabilidade: subir o servidor
// HTTP na porta configurada. Toda a montagem do Express está no app.js.

import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${env.port}`);
  console.log(`   Ambiente: ${env.nodeEnv}`);
});