// Importação de CSV: área de arrastar-e-soltar, barra de progresso e
// relatório detalhado do resultado devolvido pelo backend.

import { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, Copy } from 'lucide-react';

import { analyticsService } from '../services/analytics.service.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatInteger } from '../utils/formatters.js';

// Modelo de CSV exibido como referência ao usuário.
const CSV_TEMPLATE =
  'Date,Users,Sessions,Revenue,Orders,Source,Campaign\n' +
  '2025-11-01,500,650,4200.50,32,Google Ads,Black Friday 2025';

export default function Import() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  /** Valida a extensão antes de aceitar o arquivo (o backend revalida). */
  function selectFile(selected) {
    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.csv')) {
      setError({ message: 'Formato inválido. Selecione um arquivo .csv.' });
      return;
    }
    setFile(selected);
    setError(null);
    setReport(null);
    setProgress(0);
  }

  // ── Handlers de arrastar-e-soltar ──
  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);
    setReport(null);

    try {
      const result = await analyticsService.importCsv(file, setProgress);
      setReport(result.report);
      setFile(null);
      if (inputRef.current) inputRef.current.value = ''; // permite reenviar o mesmo arquivo
    } catch (err) {
      setError(err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {/* ── Coluna principal: upload ── */}
      <div className="space-y-5 lg:col-span-2">
        <Card title="Enviar arquivo" subtitle="Formato CSV exportado do Google Analytics">
          {/* Área de drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition
              ${isDragging
                ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'}`}
          >
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Arraste o arquivo aqui ou clique para selecionar
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apenas .csv, até 5 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
          </div>

          {/* Arquivo selecionado */}
          {file && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button onClick={handleUpload} loading={uploading}>Importar</Button>
            </div>
          )}

          {/* Progresso do upload */}
          {uploading && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-brand-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enviando... {progress}%
              </p>
            </div>
          )}

          {/* Erro de upload */}
          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 dark:bg-rose-900/30">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <p className="text-xs text-rose-700 dark:text-rose-300">{error.message}</p>
            </div>
          )}
        </Card>

        {/* ── Relatório da importação ── */}
        {report && (
          <Card title="Relatório da importação">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ReportStat label="Linhas lidas" value={report.totalRows} tone="neutral" />
              <ReportStat label="Importadas" value={report.imported} tone="success" icon={CheckCircle2} />
              <ReportStat label="Duplicadas" value={report.skippedDuplicates} tone="warning" icon={AlertTriangle} />
              <ReportStat label="Com erro" value={report.failed} tone="danger" icon={XCircle} />
            </div>

            {/* Detalhamento linha a linha dos problemas */}
            {report.errors?.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Detalhes dos erros
                </p>
                <ul className="max-h-56 space-y-1.5 overflow-y-auto">
                  {report.errors.map((item) => (
                    <li
                      key={item.line}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/50"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        Linha {item.line}:
                      </span>{' '}
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.issues.join('; ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ── Coluna lateral: instruções ── */}
      <div className="space-y-5">
        <Card title="Formato esperado">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            O arquivo precisa conter exatamente estas colunas no cabeçalho:
          </p>
          <ul className="mt-3 space-y-1.5">
            {['Date', 'Users', 'Sessions', 'Revenue', 'Orders', 'Source', 'Campaign'].map((col) => (
              <li key={col} className="flex items-center gap-2 text-xs">
                <span className="h-1 w-1 rounded-full bg-brand-500" />
                <code className="text-slate-700 dark:text-slate-200">{col}</code>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Exemplo</span>
              <button
                onClick={() => navigator.clipboard.writeText(CSV_TEMPLATE)}
                className="text-slate-400 hover:text-brand-500"
                title="Copiar"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <pre className="overflow-x-auto text-[10px] leading-relaxed text-slate-600 dark:text-slate-400">
              {CSV_TEMPLATE}
            </pre>
          </div>
        </Card>

        <Card title="Como funciona">
          <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
            <li>
              A coluna <code className="text-slate-700 dark:text-slate-300">Campaign</code> precisa
              conter o nome <strong>exato</strong> de uma campanha já cadastrada.
            </li>
            <li>
              Linhas com a mesma combinação de campanha, data e origem são identificadas como
              duplicadas e ignoradas.
            </li>
            <li>
              Linhas com erro não interrompem a importação — as válidas são salvas e as demais
              aparecem no relatório.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

// ── Componente auxiliar do relatório ──
const TONES = {
  neutral: 'text-slate-600 dark:text-slate-300',
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-600 dark:text-rose-400',
};

function ReportStat({ label, value, tone, icon: Icon }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={`h-3.5 w-3.5 ${TONES[tone]}`} />}
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className={`mt-1 text-xl font-semibold ${TONES[tone]}`}>{formatInteger(value)}</p>
    </div>
  );
}