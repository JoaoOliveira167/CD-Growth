<div align="center">

# 📊 Growth Analytics Dashboard

**Plataforma full-stack para gestão de campanhas de marketing, importação de dados de Analytics e geração automática de insights de Growth.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Sobre](#-sobre-o-projeto) · [Arquitetura](#%EF%B8%8F-arquitetura) · [Instalação](#-instalação) · [API](#-documentação-da-api) · [Roadmap](#%EF%B8%8F-roadmap) · [Contribuição](#-contribuição)

</div>

---

## 📑 Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Demonstração](#-demonstração)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#%EF%B8%8F-arquitetura)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Instalação](#-instalação)
- [Configuração](#%EF%B8%8F-configuração)
- [Banco de dados](#-banco-de-dados)
- [Documentação da API](#-documentação-da-api)
- [Growth Engine](#-growth-engine)
- [Métricas e fórmulas](#-métricas-e-fórmulas)
- [Importação de CSV](#-importação-de-csv)
- [Boas práticas](#-boas-práticas-adotadas)
- [Deploy](#-deploy)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🎯 Sobre o projeto

O **Growth Analytics Dashboard** centraliza o ciclo completo de análise de performance de marketing digital:

1. **Cadastro de campanhas** — registre campanhas com orçamento, canal, objetivo e período.
2. **Importação de dados** — envie CSVs exportados do Google Analytics e tenha as linhas validadas, deduplicadas e vinculadas automaticamente à campanha correta.
3. **Cálculo de métricas** — CAC, ROI, ROAS, LTV, CTR, taxa de conversão e rejeição calculados a partir dos dados brutos, com agrupamento por dia, semana, mês, canal ou campanha.
4. **Insights automáticos** — o *Growth Engine* analisa os números, detecta problemas e oportunidades, e entrega diagnósticos com sugestões acionáveis.

### Por que este projeto existe

Times de marketing costumam viver entre planilhas desconectadas e dashboards que mostram números sem dizer o que fazer com eles. Esta plataforma resolve os dois lados: consolida os dados em um só lugar **e** interpreta os resultados automaticamente, apontando qual canal escalar, qual pausar e onde o funil está vazando.

---

## 🎬 Demonstração

> **📌 Nota:** as imagens e GIFs abaixo devem ser capturados da sua própria instância rodando localmente. Veja [como capturar](#como-capturar-as-mídias) logo abaixo.

<div align="center">

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

### Tema claro e escuro

<img src="docs/screenshots/theme-light.png" width="49%" alt="Tema claro" />
<img src="docs/screenshots/theme-dark.png" width="49%" alt="Tema escuro" />

### Importação de CSV em ação

![Importação](docs/gifs/import-flow.gif)

### Growth Engine gerando insights

![Insights](docs/gifs/insights.gif)

### Layout responsivo

<img src="docs/screenshots/mobile.png" width="32%" alt="Visão mobile" />

</div>

### Como capturar as mídias

Crie a estrutura de pastas na raiz do repositório:

```bash
mkdir -p docs/screenshots docs/gifs
```

**Screenshots (Windows):** use `Win + Shift + S` para recortar a tela, ou `F12 → Ctrl+Shift+M` no Chrome para simular um dispositivo móvel antes de capturar.

**GIFs:** recomendamos o [ScreenToGif](https://www.screentogif.com/) (gratuito, Windows). Grave em **até 1280px de largura**, **10–15 fps** e **menos de 15 segundos** — GIFs acima de 10 MB deixam o carregamento do README lento no GitHub.

Fluxos que valem a pena gravar:

| Arquivo | O que gravar |
|---|---|
| `import-flow.gif` | Arrastar o CSV → barra de progresso → relatório colorido |
| `insights.gif` | Clicar em "Reanalisar" → insights aparecendo → filtro por severidade |
| `crud-campaign.gif` | Abrir modal → erro de validação → correção → campanha criada |
| `theme-toggle.gif` | Alternar entre claro e escuro com os gráficos redesenhando |

---

## 🛠 Tecnologias

### Backend

| Tecnologia | Função |
|---|---|
| **Node.js 18+** | Runtime JavaScript |
| **Express 4** | Framework HTTP |
| **Prisma ORM 5** | Mapeamento objeto-relacional e migrações |
| **SQLite** | Banco de dados relacional embarcado |
| **Multer** | Recebimento de uploads `multipart/form-data` |
| **csv-parser** | Parse de CSV via streams |
| **Helmet** | Cabeçalhos HTTP de segurança |
| **Compression** | Compressão gzip das respostas |
| **Morgan** | Logger de requisições HTTP |
| **CORS** | Liberação de origem cruzada |
| **dotenv** | Variáveis de ambiente |
| **ESLint** | Análise estática de código |

### Frontend

| Tecnologia | Função |
|---|---|
| **React 18** | Biblioteca de interface |
| **Vite** | Build tool e dev server |
| **TailwindCSS 3.4** | Estilização utilitária |
| **React Router 6** | Roteamento SPA |
| **Axios** | Cliente HTTP |
| **Chart.js 4** + **react-chartjs-2** | Gráficos |
| **Lucide React** | Ícones |

---

## 🏗️ Arquitetura

O sistema é um **monorepo** com duas aplicações independentes que se comunicam via HTTP/JSON.

```
growth-analytics-dashboard/
├── backend/     → API REST (fonte da verdade)
└── frontend/    → SPA (camada de apresentação)
```

O backend é a **fonte única de verdade**: persiste os dados, processa uploads e calcula todas as métricas de negócio. O frontend nunca recalcula métrica crítica — consome números já prontos e os visualiza.

### Fluxo de uma requisição

```
Request → Route → Middleware → Controller → DTO → Service → Repository → Prisma → SQLite
                                   ↓                  ↓
                            (só HTTP)        (regra de negócio)
```

Cada camada conhece apenas a camada imediatamente abaixo:

| Camada | Responsabilidade | O que **não** faz |
|---|---|---|
| **Route** | Declara endpoints e amarra middlewares | Nenhuma lógica |
| **Middleware** | Preocupações transversais (erros, upload, segurança) | Regra de negócio |
| **Controller** | Traduz HTTP ↔ Service | Não acessa o banco nem calcula |
| **DTO** | Valida entrada e formata saída | Não persiste |
| **Service** | Regra de negócio e orquestração | Não conhece `req`/`res` |
| **Repository** | Única camada que fala com o Prisma | Não valida |

### Growth Engine — padrão Registry de Regras

```
        ┌─────────────────────────────────────┐
        │  Context                            │
        │  • current   → métricas do período  │
        │  • previous  → período anterior     │
        │  • bySource  → métricas por canal   │
        └──────────────┬──────────────────────┘
                       ↓
        ┌──────────────────────────────────────┐
        │  growthEngine.run(context)           │
        │  percorre TODAS as regras            │
        └──────────────┬───────────────────────┘
                       ↓
   ┌───────────────────┼───────────────────┐
   ↓                   ↓                   ↓
threshold.rules   trend.rules       ranking.rules
(ROAS, CTR,       (conversão caiu,  (melhor canal,
 bounce, CAC)      receita subiu)    pior canal)
   ↓                   ↓                   ↓
   └───────────────────┼───────────────────┘
                       ↓
            Insights ordenados por severidade
```

O motor **não conhece nenhuma regra específica** — ele apenas percorre o registro e respeita o contrato `{ code, evaluate(context) }`. Adicionar uma regra nova é acrescentar um objeto ao array, sem tocar no motor (princípio aberto/fechado do SOLID).

### Arquitetura do frontend

```
Page → Hook (estado) → Service (HTTP) → Axios → API
  ↓
Components (UI pura, recebem props)
```

Nenhum componente importa `axios` diretamente. A pasta `services/` é a única que conhece URLs — o equivalente ao Repository do backend.

---

## 📁 Estrutura de pastas

<details>
<summary><strong>Backend</strong> (clique para expandir)</summary>

```
backend/
├── prisma/
│   ├── migrations/                  # Histórico de migrações
│   ├── schema.prisma                # Modelos e datasource
│   └── seed.js                      # Dados de exemplo
├── src/
│   ├── config/
│   │   ├── env.js                   # Variáveis de ambiente validadas
│   │   └── growthThresholds.js      # Limites que disparam insights
│   ├── database/
│   │   └── prisma.js                # PrismaClient singleton
│   ├── dtos/
│   │   ├── campaign.dto.js          # Validação de entrada + formato de saída
│   │   └── analytics.dto.js         # Validação linha a linha do CSV
│   ├── repositories/
│   │   ├── campaign.repository.js
│   │   ├── analytics.repository.js
│   │   ├── metrics.repository.js
│   │   └── insight.repository.js
│   ├── services/
│   │   ├── campaign.service.js      # CRUD + unicidade de nome
│   │   ├── analytics.service.js     # Importação e relatório
│   │   ├── metrics.service.js       # Agregação e agrupamento
│   │   └── growth.service.js        # Orquestra o Growth Engine
│   ├── controllers/
│   │   ├── campaign.controller.js
│   │   ├── analytics.controller.js
│   │   ├── metrics.controller.js
│   │   └── growth.controller.js
│   ├── routes/
│   │   ├── index.js                 # Agregador sob /api
│   │   ├── campaign.routes.js
│   │   ├── analytics.routes.js
│   │   ├── metrics.routes.js
│   │   └── growth.routes.js
│   ├── middlewares/
│   │   ├── errorHandler.js          # Tratamento global de erros
│   │   └── upload.js                # Configuração do Multer
│   ├── engine/
│   │   ├── growthEngine.js          # Motor de execução das regras
│   │   └── rules/
│   │       ├── index.js             # Registro central de regras
│   │       ├── threshold.rules.js   # ROAS, CTR, bounce, CAC
│   │       ├── trend.rules.js       # Conversão, receita
│   │       └── ranking.rules.js     # Melhor/pior canal
│   ├── utils/
│   │   ├── AppError.js              # Erro operacional customizado
│   │   ├── asyncHandler.js          # Captura de erros async
│   │   ├── csvParser.js             # Parse via stream
│   │   ├── metricsCalculator.js     # Funções puras de cálculo
│   │   ├── dateGrouper.js           # Agrupamento temporal
│   │   └── formatters.js            # Formatação pt-BR
│   ├── app.js                       # Configuração do Express
│   └── server.js                    # Ponto de entrada HTTP
├── uploads/                         # CSVs temporários (gitignored)
├── .env
├── .eslintrc.json
└── package.json
```

</details>

<details>
<summary><strong>Frontend</strong> (clique para expandir)</summary>

```
frontend/
├── src/
│   ├── services/
│   │   ├── api.js                   # Instância Axios + interceptors
│   │   ├── campaign.service.js
│   │   ├── analytics.service.js
│   │   ├── metrics.service.js
│   │   └── growth.service.js
│   ├── contexts/
│   │   ├── ThemeContext.jsx         # Tema + persistência
│   │   └── FilterContext.jsx        # Filtros globais
│   ├── hooks/
│   │   ├── useApi.js                # loading/data/error genérico
│   │   ├── useTheme.js
│   │   └── useFilters.js
│   ├── components/
│   │   ├── layout/                  # Sidebar, Header, Layout
│   │   ├── ui/                      # Card, Button, Modal, Badge...
│   │   └── charts/                  # Line, Bar, Doughnut + tema
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Campaigns.jsx
│   │   ├── Import.jsx
│   │   ├── Analytics.jsx
│   │   ├── Insights.jsx
│   │   └── Settings.jsx
│   ├── routes/AppRoutes.jsx
│   ├── utils/formatters.js
│   ├── lib/chartSetup.js            # Registro dos módulos Chart.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── tailwind.config.js
└── package.json
```

</details>

---

## 🚀 Instalação

### Pré-requisitos

- **Node.js 18 ou superior** — verifique com `node -v`
- **npm 9+** — verifique com `npm -v`
- **Git**

### Clonando o repositório

```bash
git clone https://github.com/seu-usuario/growth-analytics-dashboard.git
cd growth-analytics-dashboard
```

### Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init    # cria o banco e as tabelas
npx prisma db seed                    # popula com dados de exemplo
npm run dev                           # http://localhost:3333
```

### Frontend

Em **outro terminal**, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev                           # http://localhost:5173
```

> ⚠️ **Importante:** os dois servidores precisam estar rodando simultaneamente. O frontend depende da API na porta 3333.

<details>
<summary><strong>💡 Erro de execução de scripts no Windows PowerShell?</strong></summary>

Se aparecer `npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada`, execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Alternativamente, use o **Prompt de Comando (CMD)**, que não tem essa restrição.

</details>

### Scripts disponíveis

**Backend**

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor com hot-reload |
| `npm start` | Servidor em modo produção |
| `npm run lint` | Verificação do ESLint |
| `npx prisma studio` | Interface visual do banco |
| `npx prisma migrate dev` | Cria e aplica migração |
| `npx prisma db seed` | Popula dados de exemplo |
| `npx prisma migrate reset` | Reseta o banco e re-executa o seed |

**Frontend**

| Comando | Descrição |
|---|---|
| `npm run dev` | Dev server do Vite |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Preview local do build |
| `npm run lint` | Verificação do ESLint |

---

## ⚙️ Configuração

### `backend/.env`

```bash
# Porta em que o servidor Express escuta
PORT=3333

# Conexão do Prisma. Para SQLite, é o caminho do arquivo .db
DATABASE_URL="file:./dev.db"

# development | production — controla o detalhamento dos erros e logs
NODE_ENV=development
```

### `frontend/.env`

```bash
# URL base da API. O prefixo VITE_ é obrigatório para o Vite expor a variável
VITE_API_URL=http://localhost:3333/api
```

> 🔒 Ambos os arquivos `.env` estão no `.gitignore` e **nunca devem ser versionados**. Considere criar `.env.example` com valores fictícios para orientar novos contribuidores.

### Ajustando os limites do Growth Engine

Os parâmetros que disparam os insights ficam em `backend/src/config/growthThresholds.js`. Alterá-los muda a sensibilidade de **todas as regras** sem exigir mudança na lógica do motor:

```js
export const GROWTH_THRESHOLDS = {
  roas:           { warning: 2,    critical: 1    },
  ctr:            { warning: 0.03, critical: 0.01 },
  bounceRate:     { warning: 0.7,  critical: 0.85 },
  ltvCac:         { warning: 3,    critical: 1    },
  conversionDrop: { warning: 0.1,  critical: 0.25 },
  // ...
};
```

---

## 🗄 Banco de dados

### Diagrama de entidades

```
┌─────────────────────────┐
│       Campaign          │
├─────────────────────────┤
│ id         String  @id  │
│ name       String       │
│ source     String       │
│ budget     Float        │
│ goal       String       │
│ startDate  DateTime     │
│ endDate    DateTime?    │
│ createdAt  DateTime     │
│ updatedAt  DateTime     │
└───────────┬─────────────┘
            │ 1
            │
            │ N          (onDelete: Cascade)
┌───────────┴─────────────┐         ┌─────────────────────────┐
│       Analytics         │         │        Insight          │
├─────────────────────────┤         ├─────────────────────────┤
│ id             String   │         │ id          String  @id │
│ campaignId     String   │◄─ FK    │ code        String      │
│ date           DateTime │         │ title       String      │
│ users          Int      │         │ description String      │
│ sessions       Int      │         │ suggestion  String      │
│ pageViews      Int      │         │ level       String      │
│ bounceRate     Float    │         │ scope       String      │
│ conversionRate Float    │         │ createdAt   DateTime    │
│ revenue        Float    │         └─────────────────────────┘
│ cost           Float    │            (entidade independente)
│ orders         Int      │
│ impressions    Int      │
│ clicks         Int      │
│ source         String   │
└─────────────────────────┘
```

### Relacionamentos

**`Campaign` 1 → N `Analytics`** — uma campanha gera dados ao longo de vários dias. Do lado da campanha, o campo `analytics Analytics[]` representa a coleção; do lado do Analytics, `campaignId` é a chave estrangeira real e `campaign` é o objeto de navegação do Prisma.

O `onDelete: Cascade` garante integridade: ao excluir uma campanha, seus registros de analytics são removidos automaticamente, evitando registros órfãos.

O índice `@@index([campaignId])` acelera as consultas por campanha, que são as mais frequentes do dashboard.

**`Insight` é independente** — não possui chave estrangeira. Funciona como um registro de diagnósticos do sistema. O campo `scope` (`"global"` ou `"source:Meta Ads"`) indica a que o insight se refere, sem criar acoplamento no schema.

### Comandos úteis

```bash
npx prisma studio                    # interface visual em localhost:5555
npx prisma migrate dev --name nome   # criar nova migração
npx prisma migrate reset             # resetar banco + re-seed
npx prisma generate                  # regerar o client após mudar o schema
```

---

## 📡 Documentação da API

**Base URL:** `http://localhost:3333/api`

### Health check

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Verifica se a API está no ar (fora do prefixo `/api`) |

### Campanhas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/campaigns` | Lista campanhas. Filtros: `?source=`, `?goal=` |
| `GET` | `/campaigns/:id` | Detalha uma campanha |
| `POST` | `/campaigns` | Cria uma campanha |
| `PUT` | `/campaigns/:id` | Atualiza (payload parcial aceito) |
| `DELETE` | `/campaigns/:id` | Remove (analytics em cascata) |

<details>
<summary>Exemplos de requisição e resposta</summary>

**Criar campanha**

```bash
curl -X POST http://localhost:3333/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Black Friday 2025",
    "source": "Google Ads",
    "budget": 15000,
    "goal": "Vendas",
    "startDate": "2025-11-01",
    "endDate": "2025-11-30"
  }'
```

**Resposta `201 Created`**

```json
{
  "id": "a3f1...",
  "name": "Black Friday 2025",
  "source": "Google Ads",
  "budget": 15000,
  "goal": "Vendas",
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-30T00:00:00.000Z",
  "analyticsCount": 0,
  "createdAt": "2026-07-24T14:32:10.000Z",
  "updatedAt": "2026-07-24T14:32:10.000Z"
}
```

**Erro de validação `400`** — todos os campos inválidos são reportados de uma vez:

```json
{
  "status": "error",
  "message": "Dados inválidos para criar a campanha.",
  "errors": [
    { "field": "name",   "message": "Deve ter ao menos 2 caractere(s)." },
    { "field": "budget", "message": "Deve ser maior que zero." },
    { "field": "goal",   "message": "Deve ser um de: Vendas, Leads, Awareness, Tráfego, Engajamento." }
  ]
}
```

</details>

### Analytics

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/analytics/import` | Importa CSV (`multipart/form-data`, campo `file`) |

<details>
<summary>Exemplo e relatório de importação</summary>

```bash
curl -X POST http://localhost:3333/api/analytics/import \
  -F "file=@dados.csv"
```

**Resposta `200 OK`**

```json
{
  "status": "success",
  "message": "Importação concluída.",
  "report": {
    "totalRows": 30,
    "imported": 27,
    "skippedDuplicates": 2,
    "failed": 1,
    "errors": [
      { "line": 14, "issues": ["\"Users\" deve ser um inteiro não-negativo"] }
    ]
  }
}
```

</details>

### Métricas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/metrics/overview` | KPIs consolidados do período |
| `GET` | `/metrics/timeseries` | Série temporal. `?groupBy=day\|week\|month` |
| `GET` | `/metrics/by-source` | Agregação por canal |
| `GET` | `/metrics/by-campaign` | Agregação por campanha (inclui `budgetUsage`) |
| `GET` | `/metrics/filters` | Valores disponíveis para os filtros da UI |

**Query params aceitos em todas as rotas de métricas:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `startDate` | `YYYY-MM-DD` | Início do período |
| `endDate` | `YYYY-MM-DD` | Fim do período (inclusivo) |
| `campaignId` | `string` | Filtra por campanha |
| `source` | `string` | Filtra por canal |
| `purchaseFrequency` | `number` | Premissa do LTV (padrão: 1.5) |
| `customerLifespanMonths` | `number` | Premissa do LTV (padrão: 12) |

<details>
<summary>Exemplo de resposta do overview</summary>

```json
{
  "recordCount": 60,
  "assumptions": { "purchaseFrequency": 1.5, "customerLifespanMonths": 12 },
  "metrics": {
    "users": 31240, "sessions": 40180, "orders": 1187, "conversions": 1187,
    "revenue": 168432.55, "cost": 18740.22, "profit": 149692.33,
    "ctr": 0.0912, "conversionRate": 0.0295, "bounceRate": 0.4981,
    "cpc": 5.12, "cac": 15.79, "averageOrderValue": 141.90,
    "roas": 8.99, "roi": 7.99, "ltv": 212.85, "ltvCacRatio": 13.48
  }
}
```

</details>

### Growth Engine

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/growth/analyze` | Executa a análise sem persistir |
| `POST` | `/growth/analyze` | Executa e salva os insights |
| `GET` | `/growth/insights` | Lista insights salvos. `?level=critical` |
| `DELETE` | `/growth/insights/:id` | Remove um insight salvo |

**Query params:** `days` (padrão: 30), `startDate`, `endDate`, `campaignId`.

### Códigos de status

| Código | Significado |
|---|---|
| `200` | Sucesso |
| `201` | Recurso criado |
| `204` | Sucesso sem conteúdo (DELETE) |
| `400` | Dados inválidos ou upload malformado |
| `404` | Recurso não encontrado |
| `409` | Conflito (ex.: nome de campanha duplicado) |
| `500` | Erro interno |

Todos os erros seguem o mesmo formato:

```json
{
  "status": "error",
  "message": "Descrição legível do problema.",
  "errors": [ { "field": "campo", "message": "detalhe" } ]
}
```

---

## 🧠 Growth Engine

O motor executa **8 regras** distribuídas em três famílias. Cada família precisa de um tipo diferente de dado, e juntas cobrem estado, movimento e distribuição.

### Regras de limite — comparam contra referências fixas

| Código | Dispara quando | Severidade |
|---|---|---|
| `ROAS_LOW` | ROAS abaixo de 2x (crítico abaixo de 1x) | ⚠️ / 🔴 |
| `CTR_LOW` | CTR abaixo de 3% (crítico abaixo de 1%) | ⚠️ / 🔴 |
| `BOUNCE_HIGH` | Rejeição acima de 70% (crítico acima de 85%) | ⚠️ / 🔴 |
| `CAC_HIGH` | Razão LTV/CAC abaixo de 3x, ou CAC maior que o ticket médio | ⚠️ / 🔴 |

### Regras de tendência — comparam com o período anterior

| Código | Dispara quando | Severidade |
|---|---|---|
| `CONVERSION_DROP` | Conversão caiu mais de 10% (crítico acima de 25%) | ⚠️ / 🔴 |
| `REVENUE_TREND` | Receita variou mais de 10% para cima ou 15% para baixo | ℹ️ / ⚠️ |

### Regras de ranking — comparam canais entre si

| Código | Dispara quando | Severidade |
|---|---|---|
| `BEST_CHANNEL` | Há ao menos 2 canais elegíveis | ℹ️ |
| `WORST_CHANNEL` | Pior canal tem ROAS ≤ 50% do melhor, ou abaixo de 2x | ⚠️ / 🔴 |

### Decisões de design que garantem confiabilidade

**Filtro de significância estatística.** Regras de ranking descartam canais com menos de **100 sessões** ou **R$ 50** de investimento. Sem isso, um canal com 4 sessões e 1 venda apareceria como "o mais lucrativo" — ruído virando recomendação de negócio.

**Comparação de períodos de duração idêntica.** O período anterior tem exatamente a mesma quantidade de dias do atual e termina na véspera do início. Comparar 30 dias com 7 produziria uma "queda" artificial.

**Silêncio na ausência de evidência.** Toda regra se abstém (`return null`) quando não há base para o cálculo — sem impressões, sem período anterior, menos de dois canais. Reportar "CTR de 0%" quando não há dados gera alarme falso e destrói a confiança no sistema.

**Isolamento de falha.** Cada `evaluate()` roda dentro de um `try/catch`. Uma regra com bug não derruba a análise inteira: as demais continuam e o erro vai para o log.

### Adicionando uma regra nova

```js
// backend/src/engine/rules/threshold.rules.js
export const minhaRegra = {
  code: 'MINHA_REGRA',
  description: 'O que ela detecta.',

  evaluate({ current, previous, bySource }) {
    if (/* condição não atendida */) return null;

    return {
      code: this.code,
      level: 'warning',        // 'info' | 'warning' | 'critical'
      scope: 'global',
      title: 'Título curto',
      description: 'O que foi detectado, com os números.',
      suggestion: 'Ação recomendada.',
    };
  },
};

// Registre no array exportado ao final do arquivo
export const thresholdRules = [roasRule, ctrRule, /* ... */, minhaRegra];
```

Motor, service, controller e rotas permanecem intocados.

---

## 📐 Métricas e fórmulas

| Métrica | Fórmula | Interpretação |
|---|---|---|
| **CTR** | `clicks ÷ impressions` | Atratividade do anúncio |
| **CPC** | `cost ÷ clicks` | Custo médio por clique |
| **Taxa de conversão** | `orders ÷ sessions` | Eficiência do funil |
| **CAC** | `cost ÷ conversions` | Custo para adquirir um cliente |
| **AOV** (ticket médio) | `revenue ÷ orders` | Valor médio por pedido |
| **ROAS** | `revenue ÷ cost` | Retorno por real investido |
| **ROI** | `(revenue − cost) ÷ cost` | Percentual de lucro sobre investimento |
| **LTV** | `AOV × frequência × (lifespan ÷ 12)` | Valor estimado do cliente |
| **LTV/CAC** | `LTV ÷ CAC` | Saúde do negócio (>3 saudável, <1 queima caixa) |
| **Bounce Rate** | `Σ(bounceRate × sessions) ÷ Σ sessions` | Média **ponderada** |

### Três decisões que evitam números errados

**Bounce rate e conversão usam média ponderada, nunca média simples.** Se um dia teve 10 sessões com 90% de rejeição e outro teve 1.000 sessões com 30%, a média simples daria 60% — número completamente errado. O correto pondera pelo volume: ~30,6%. Por isso a taxa de conversão é **recalculada a partir dos totais**, não obtida pela média do campo `conversionRate`.

**Divisão por zero retorna `null`, não `0`.** "Não há dados para calcular" é diferente de "o resultado é zero". Um ROAS de `0` significa receita nula com investimento; um ROAS `null` significa que não houve investimento algum. A interface exibe `—` para `null`.

**LTV é uma estimativa com premissas declaradas.** O schema não armazena identidade de cliente nem histórico de recompra, então frequência e tempo de vida **não podem ser derivados dos dados**. Vêm por query string com defaults conservadores, e toda resposta da API declara quais premissas foram usadas — o número é auditável, não inventado.

---

## 📥 Importação de CSV

### Formato esperado

O arquivo precisa conter exatamente estas colunas no cabeçalho:

```csv
Date,Users,Sessions,Revenue,Orders,Source,Campaign
2025-11-01,500,650,4200.50,32,Google Ads,Black Friday 2025
2025-11-02,480,600,3900.00,28,Google Ads,Black Friday 2025
```

| Coluna | Tipo | Observação |
|---|---|---|
| `Date` | Data | Formato `YYYY-MM-DD` |
| `Users` | Inteiro | Não-negativo |
| `Sessions` | Inteiro | Não-negativo |
| `Revenue` | Decimal | Aceita vírgula ou ponto |
| `Orders` | Inteiro | Não-negativo |
| `Source` | Texto | Origem do tráfego |
| `Campaign` | Texto | **Nome exato** de uma campanha já cadastrada |

### Validações aplicadas

| Etapa | Validação | Resultado |
|---|---|---|
| Multer | Extensão e MIME type | `400` se não for `.csv` |
| Multer | Tamanho máximo de 5 MB | `400` se exceder |
| Service | Arquivo enviado | `400` se ausente |
| Service | Arquivo não vazio | `400` se sem linhas |
| Service | Colunas obrigatórias | `400` listando as ausentes |
| DTO | Tipos de cada valor | linha reportada em `errors` |
| Service | Campanha existe | linha reportada em `errors` |
| Service | Duplicidade | contabilizada em `skippedDuplicates` |

**Chave de duplicidade:** `campaignId` + `date` + `source`. Reenviar o mesmo arquivo não gera registros repetidos.

Linhas com erro **não interrompem a importação** — as válidas são gravadas em lote e as problemáticas aparecem no relatório com número de linha e motivo.

---

## ✅ Boas práticas adotadas

### Clean Code

- Funções curtas com responsabilidade única e nomes descritivos
- Código integralmente comentado, explicando o **porquê**, não o óbvio
- Sem *números mágicos*: limites centralizados em arquivos de configuração
- Early return em vez de aninhamento profundo de condicionais

### SOLID

| Princípio | Aplicação no projeto |
|---|---|
| **S** — Responsabilidade única | Cada camada muda por um único motivo; controllers não calculam, services não conhecem HTTP |
| **O** — Aberto/fechado | Growth Engine aceita regras novas sem alterar o motor; `dateGrouper` aceita períodos novos sem `if/else` |
| **L** — Substituição de Liskov | Todas as regras respeitam o mesmo contrato `evaluate(context)` |
| **I** — Segregação de interface | Services expõem apenas os métodos que cada consumidor precisa |
| **D** — Inversão de dependência | Services dependem da abstração do repository, não do Prisma |

### Tratamento de erros

Um único `errorHandler` global captura tudo — `AppError`, erros do Multer, códigos do Prisma (`P2025`, `P2003`) e exceções inesperadas. O wrapper `asyncHandler` encaminha rejeições de Promise automaticamente, eliminando `try/catch` repetido nos controllers.

Stack traces só aparecem em desenvolvimento; em produção, o cliente recebe apenas mensagens seguras.

### Segurança

- **Helmet** — cabeçalhos HTTP contra clickjacking e MIME sniffing
- **Filtro de upload** — extensão e MIME validados, limite de 5 MB
- **Nomes aleatórios** — arquivos renomeados com hash, evitando sobrescrita e path traversal
- **Limpeza automática** — CSVs temporários removidos em bloco `finally`, mesmo em caso de erro
- **Variáveis de ambiente** — segredos fora do código, `.env` no `.gitignore`

### Frontend

- **Falha isolada** — cada bloco tem seu próprio estado de carregamento e erro; se os insights falharem, os KPIs continuam funcionando
- **Estados explícitos** — `loading`, `error`, `empty` e `success` tratados separadamente; "vazio" nunca se confunde com "erro"
- **Acessibilidade** — `aria-label` nos botões de ícone, modal fecha com `Escape`, foco visível
- **Componentes puros** — a pasta `ui/` recebe props e renderiza, sem lógica de negócio

### Convenções de commit

O projeto segue [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
refactor: refatoração sem mudança de comportamento
test:     testes
chore:    build, dependências, configuração
```

---

## 🚢 Deploy

> ⚠️ **Atenção crítica sobre o SQLite:** o banco é um arquivo em disco. A maioria das plataformas de hospedagem usa **sistema de arquivos efêmero** — o arquivo é apagado a cada redeploy ou reinício do container. **Para produção real, migre para PostgreSQL.**

### Migrando para PostgreSQL

A troca fica contida na camada de configuração, exatamente como a arquitetura previu:

**1.** Ajuste o `datasource` em `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2.** Atualize a variável de ambiente:

```bash
DATABASE_URL="postgresql://usuario:senha@host:5432/growth?schema=public"
```

**3.** Gere a migração inicial no novo banco:

```bash
npx prisma migrate deploy
```

Nenhum service, controller ou repository precisa mudar — o Prisma abstrai o dialeto.

### Backend

Plataformas recomendadas: **Railway**, **Render**, **Fly.io** (todas com PostgreSQL gerenciado).

Variáveis de ambiente necessárias:

```bash
DATABASE_URL=postgresql://...
PORT=3333
NODE_ENV=production
```

Comandos de build e start:

```bash
# Build
npm install && npx prisma generate && npx prisma migrate deploy

# Start
npm start
```

### Frontend

Plataformas recomendadas: **Vercel**, **Netlify**, **Cloudflare Pages**.

| Configuração | Valor |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Variável de ambiente | `VITE_API_URL=https://sua-api.com/api` |

> 📌 Variáveis `VITE_*` são embutidas **no momento do build**. Mudar a URL da API exige um novo build, não apenas reiniciar o serviço.

### Ajustes obrigatórios para produção

**CORS restrito** — em `backend/src/app.js`, substitua `app.use(cors())` por:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
```

**Uploads persistentes** — o disco efêmero também afeta a pasta `uploads/`. Como os CSVs são temporários e removidos após o processamento, isso raramente é problema — mas se precisar retê-los, use S3, Cloudflare R2 ou equivalente.

**Rate limiting** — considere adicionar `express-rate-limit` na rota de importação para evitar abuso.

---

## 🗺️ Roadmap

### ✅ Concluído

- [x] CRUD de campanhas com validação por DTO
- [x] Importação de CSV com relatório detalhado
- [x] Cálculo automático de 15+ métricas de Growth
- [x] Agrupamento por dia, semana, mês, canal e campanha
- [x] Growth Engine com 8 regras em 3 famílias
- [x] Dashboard com gráficos interativos
- [x] Tema claro e escuro com persistência
- [x] Layout responsivo

### 🚧 Próximas versões

**v1.1 — Qualidade**
- [ ] Testes unitários do `metricsCalculator` e das regras do Growth Engine (Vitest)
- [ ] Testes de integração da API (Supertest)
- [ ] Cobertura mínima de 80%
- [ ] CI com GitHub Actions

**v1.2 — Autenticação**
- [ ] Cadastro e login com JWT
- [ ] Middleware de autenticação (a arquitetura já está preparada)
- [ ] Multi-tenancy: cada usuário vê apenas suas campanhas
- [ ] Perfis de acesso (admin / analista / leitor)

**v1.3 — Integrações**
- [ ] Conexão direta com a Google Analytics Data API
- [ ] Importação da Meta Ads API
- [ ] Sincronização agendada via cron
- [ ] Webhooks de notificação para insights críticos

**v1.4 — Análise avançada**
- [ ] Exportação de relatórios em PDF e Excel
- [ ] Comparação lado a lado entre campanhas
- [ ] Previsão de receita com regressão linear
- [ ] Análise de coorte e retenção
- [ ] Limites do Growth Engine configuráveis pela interface

**v2.0 — Escala**
- [ ] Migração para PostgreSQL
- [ ] Cache com Redis nos endpoints de métricas
- [ ] Agregação em SQL para volumes acima de 1M de registros
- [ ] Processamento assíncrono de importações grandes (fila)
- [ ] Dashboard em tempo real com WebSockets

---

## 🤝 Contribuição

Contribuições são muito bem-vindas! Este projeto segue o fluxo padrão de código aberto.

### Como contribuir

**1.** Faça um fork do repositório

**2.** Crie uma branch para sua alteração:

```bash
git checkout -b feat/minha-funcionalidade
```

**3.** Faça suas alterações seguindo as [boas práticas](#-boas-práticas-adotadas) do projeto

**4.** Verifique o lint antes de commitar:

```bash
cd backend  && npm run lint
cd frontend && npm run lint
```

**5.** Commit seguindo Conventional Commits:

```bash
git commit -m "feat: adiciona regra de sazonalidade ao Growth Engine"
```

**6.** Push e abra um Pull Request:

```bash
git push origin feat/minha-funcionalidade
```

### Diretrizes

| Área | Expectativa |
|---|---|
| **Camadas** | Respeite a separação: controllers não acessam o banco, services não conhecem `req`/`res` |
| **Comentários** | Explique o **porquê** das decisões, não o que o código faz linha a linha |
| **Nomenclatura** | Arquivos em `camelCase`, componentes React em `PascalCase` |
| **Regras novas** | Adicione ao arquivo da família apropriada e registre em `rules/index.js` |
| **Migrações** | Sempre versionadas; nunca edite migrações já aplicadas |
| **Escopo** | Um PR por funcionalidade — PRs menores são revisados mais rápido |

### Reportando bugs

Ao abrir uma issue, inclua: descrição do comportamento esperado vs. observado, passos para reproduzir, versão do Node (`node -v`), sistema operacional e logs relevantes do terminal.

### Sugerindo funcionalidades

Descreva o problema que a funcionalidade resolve antes da solução proposta. Contexto de uso real ajuda mais que especificação técnica.

---

## 📄 Licença

Distribuído sob a **Licença MIT**. Veja o arquivo [`LICENSE`](LICENSE) para o texto completo.

```
MIT License

Copyright (c) 2026 [Seu Nome]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Desenvolvido com foco em Clean Code, SOLID e arquitetura em camadas.**

Se este projeto foi útil, considere deixar uma ⭐

</div>
