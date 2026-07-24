// Configurações: aparência, status da conexão com a API e documentação
// dos limites usados pelo Growth Engine.

import { useCallback } from 'react';
import { Sun, Moon, CheckCircle2, XCircle, Monitor } from 'lucide-react';

import { useTheme } from '../hooks/useTheme.js';
import { useApi } from '../hooks/useApi.js';
import { metricsService } from '../services/metrics.service.js';

import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';

// Espelha os valores de growthThresholds.js no backend. Documentação para o
// usuário — alterar de fato exige mudar o arquivo do servidor.
const THRESHOLDS = [
  { metric: 'ROAS', warning: 'abaixo de 2,0x', critical: 'abaixo de 1,0x' },
  { metric: 'CTR', warning: 'abaixo de 3%', critical: 'abaixo de 1%' },
  { metric: 'Taxa de rejeição', warning: 'acima de 70%', critical: 'acima de 85%' },
  { metric: 'Razão LTV/CAC', warning: 'abaixo de 3,0x', critical: 'abaixo de 1,0x' },
  { metric: 'Queda de conversão', warning: 'acima de 10%', critical: 'acima de 25%' },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Testa a conexão chamando um endpoint leve da API.
  const health = useApi(useCallback(() => metricsService.getFilters(), []), []);

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ── Aparência ── */}
      <Card title="Aparência" subtitle="Escolha o tema da interface">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'light', label: 'Claro', icon: Sun },
            { id: 'dark', label: 'Escuro', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
                theme === id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${theme === id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Na primeira visita, o tema segue a preferência do seu sistema operacional. Depois disso,
          sua escolha fica salva neste navegador.
        </p>
      </Card>

      {/* ── Conexão ── */}
      <Card title="Conexão com a API" subtitle="Status do servidor backend">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Endereço</span>
            <code className="text-xs text-slate-700 dark:text-slate-200">{apiUrl}</code>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
            {health.loading && <span className="text-xs text-slate-400">verificando...</span>}
            {health.error && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                <XCircle className="h-3.5 w-3.5" />
                Offline
              </span>
            )}
            {health.data && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conectado
              </span>
            )}
          </div>

          {/* Canais detectados no banco */}
          {health.data?.sources?.length > 0 && (
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                Canais detectados nos dados
              </p>
              <div className="flex flex-wrap gap-1.5">
                {health.data.sources.map((source) => (
                  <Badge key={source}>{source}</Badge>
                ))}
              </div>
            </div>
          )}

          {health.error && (
            <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              Verifique se o backend está rodando com <code>npm run dev</code> na pasta{' '}
              <code>backend</code>.
            </p>
          )}
        </div>
      </Card>

      {/* ── Limites do Growth Engine ── */}
      <Card
        title="Limites do Growth Engine"
        subtitle="Parâmetros que disparam os insights automáticos"
        className="lg:col-span-2"
      >
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Métrica
                </th>
                <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Atenção
                </th>
                <th className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Crítico
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {THRESHOLDS.map((row) => (
                <tr key={row.metric}>
                  <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200">{row.metric}</td>
                  <td className="py-2.5 text-amber-600 dark:text-amber-400">{row.warning}</td>
                  <td className="py-2.5 text-rose-600 dark:text-rose-400">{row.critical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Estes valores são definidos no arquivo{' '}
          <code className="text-slate-700 dark:text-slate-300">
            backend/src/config/growthThresholds.js
          </code>
          . Ajustá-los altera a sensibilidade de todas as regras sem exigir mudança na lógica do motor.
        </p>
      </Card>
    </div>
  );
}