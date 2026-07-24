// CRUD de campanhas: listagem em tabela, modal de criação/edição com
// validação vinda do backend, e exclusão com confirmação.

import { useState, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import { useApi } from '../hooks/useApi.js';
import { campaignService } from '../services/campaign.service.js';

import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Field, inputClass } from '../components/ui/Field.jsx';
import { DataTable } from '../components/ui/DataTable.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ErrorState } from '../components/ui/ErrorState.jsx';
import { formatCurrency, formatDate, formatInteger } from '../utils/formatters.js';

// Objetivos aceitos pelo backend (espelha VALID_GOALS do DTO).
const GOALS = ['Vendas', 'Leads', 'Awareness', 'Tráfego', 'Engajamento'];

const EMPTY_FORM = {
  name: '', source: '', budget: '', goal: 'Vendas', startDate: '', endDate: '',
};

export default function Campaigns() {
  const list = useApi(useCallback(() => campaignService.list(), []), []);

  // Estado do modal: null = fechado; objeto = editando; EMPTY_FORM = criando.
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /** Abre o modal em modo criação. */
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  /** Abre o modal preenchido para edição. */
  function openEdit(campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name,
      source: campaign.source,
      budget: String(campaign.budget),
      goal: campaign.goal,
      // O backend devolve ISO completo; input[type=date] exige YYYY-MM-DD.
      startDate: campaign.startDate?.slice(0, 10) ?? '',
      endDate: campaign.endDate?.slice(0, 10) ?? '',
    });
    setFieldErrors({});
    setFormError(null);
    setModalOpen(true);
  }

  /** Atualiza um campo e limpa o erro associado a ele. */
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  /** Envia o formulário (create ou update). */
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError(null);

    // endDate vazio precisa virar null para o backend limpar o campo.
    const payload = { ...form, endDate: form.endDate || null };

    try {
      if (editingId) {
        await campaignService.update(editingId, payload);
      } else {
        await campaignService.create(payload);
      }
      setModalOpen(false);
      list.refetch();
    } catch (error) {
      // O backend devolve errors: [{ field, message }] — convertemos num mapa
      // para exibir a mensagem abaixo de cada input.
      if (error.errors?.length) {
        const map = {};
        for (const item of error.errors) map[item.field] = item.message;
        setFieldErrors(map);
      }
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  /** Exclui após confirmação do usuário. */
  async function handleDelete(campaign) {
    const confirmed = window.confirm(
      `Excluir a campanha "${campaign.name}"?\n\n` +
        'Todos os registros de analytics vinculados também serão removidos.',
    );
    if (!confirmed) return;

    setDeletingId(campaign.id);
    try {
      await campaignService.remove(campaign.id);
      list.refetch();
    } catch (error) {
      window.alert(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  // Definição das colunas da tabela.
  const columns = [
    {
      key: 'name',
      header: 'Campanha',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">{row.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.source}</p>
        </div>
      ),
    },
    { key: 'goal', header: 'Objetivo', render: (row) => <Badge>{row.goal}</Badge> },
    { key: 'budget', header: 'Orçamento', align: 'right', render: (row) => formatCurrency(row.budget) },
    {
      key: 'period',
      header: 'Período',
      render: (row) => (
        <span className="text-xs">
          {formatDate(row.startDate)} — {row.endDate ? formatDate(row.endDate) : 'em aberto'}
        </span>
      ),
    },
    {
      key: 'analyticsCount',
      header: 'Registros',
      align: 'right',
      render: (row) => formatInteger(row.analyticsCount ?? 0),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)} aria-label="Editar" />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            loading={deletingId === row.id}
            onClick={() => handleDelete(row)}
            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/30"
            aria-label="Excluir"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {list.data ? `${list.data.total} campanha(s) cadastrada(s)` : ''}
        </p>
        <Button icon={Plus} onClick={openCreate}>Nova campanha</Button>
      </div>

      <Card>
        {list.loading && <Spinner />}
        {list.error && <ErrorState error={list.error} onRetry={list.refetch} />}
        {list.data && (
          <DataTable
            columns={columns}
            rows={list.data.data}
            emptyMessage="Nenhuma campanha cadastrada ainda."
          />
        )}
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar campanha' : 'Nova campanha'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome" error={fieldErrors.name}>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Black Friday 2025"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Origem" error={fieldErrors.source}>
              <input
                className={inputClass}
                value={form.source}
                onChange={(e) => handleChange('source', e.target.value)}
                placeholder="Google Ads"
              />
            </Field>

            <Field label="Objetivo" error={fieldErrors.goal}>
              <select
                className={inputClass}
                value={form.goal}
                onChange={(e) => handleChange('goal', e.target.value)}
              >
                {GOALS.map((goal) => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Orçamento (R$)" error={fieldErrors.budget}>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              value={form.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              placeholder="15000"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data de início" error={fieldErrors.startDate}>
              <input
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </Field>

            <Field label="Data de fim" error={fieldErrors.endDate} hint="Opcional">
              <input
                type="date"
                className={inputClass}
                value={form.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </Field>
          </div>

          {/* Erro geral (ex.: nome duplicado, que não é erro de campo) */}
          {formError && !Object.keys(fieldErrors).length && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              {formError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}