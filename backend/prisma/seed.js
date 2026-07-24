// Script de seed: popula o banco com dados de exemplo para desenvolvimento.
// Executado via `npx prisma db seed`. Limpa as tabelas antes de inserir,
// para que rodar o seed várias vezes não gere duplicatas.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Gera N registros diários de analytics para uma campanha, com números
// pseudoaleatórios porém plausíveis. Facilita testar gráficos com série temporal.
function buildAnalytics(campaignId, source, days) {
  const records = [];
  const today = new Date();

  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i); // vai voltando um dia por iteração

    const users = 200 + Math.floor(Math.random() * 800);
    const sessions = users + Math.floor(Math.random() * 300);
    const cost = 100 + Math.random() * 400;
    const orders = Math.floor(Math.random() * 40);
    const revenue = orders * (80 + Math.random() * 120);

    records.push({
      campaignId,
      source,
      date,
      users,
      sessions,
      pageViews: sessions * (2 + Math.floor(Math.random() * 4)),
      bounceRate: Number((0.3 + Math.random() * 0.4).toFixed(2)), // 30% a 70%
      conversionRate: Number((orders / sessions).toFixed(4)),
      revenue: Number(revenue.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      orders,
      impressions: sessions * (8 + Math.floor(Math.random() * 12)),
      clicks: sessions + Math.floor(Math.random() * 100),
    });
  }

  return records;
}

async function main() {
  console.log('🌱 Limpando tabelas...');
  // Ordem importa: apaga os filhos (analytics) antes dos pais (campaigns).
  await prisma.analytics.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.insight.deleteMany();

  console.log('🌱 Criando campanhas...');

  // Campanha 1 — Google Ads
  const black = await prisma.campaign.create({
    data: {
      name: 'Black Friday 2025',
      source: 'Google Ads',
      budget: 15000,
      goal: 'Vendas',
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-30'),
    },
  });

  // Campanha 2 — Meta Ads
  const summer = await prisma.campaign.create({
    data: {
      name: 'Summer Launch',
      source: 'Meta Ads',
      budget: 8000,
      goal: 'Leads',
      startDate: new Date('2025-12-01'),
    },
  });

  console.log('🌱 Criando registros de analytics...');
  await prisma.analytics.createMany({
    data: [
      ...buildAnalytics(black.id, 'Google Ads', 30),
      ...buildAnalytics(summer.id, 'Meta Ads', 30),
    ],
  });

  console.log('✅ Seed concluído!');
}

// Executa e garante que a conexão seja fechada mesmo em caso de erro.
main()
  .catch((error) => {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });