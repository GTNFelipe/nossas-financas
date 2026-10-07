import {
  Wallet, Plus, Check, Edit, Trash2
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function PoupancaModal() {
  const {
    isPoupancaModalOpen,
    setIsPoupancaModalOpen,
    formPoupancaTotal,
    setFormPoupancaTotal,
    formPoupancaMotivoNome,
    setFormPoupancaMotivoNome,
    formPoupancaMotivoValor,
    setFormPoupancaMotivoValor,
    editingPoupancaId,
    setEditingPoupancaId,
    handleSavePoupancaTotal,
    handleSavePoupancaMotivo,
    handleDeletePoupancaMotivo,
    totalGuardado,
    motivosPoupanca,
    totalAlocado,
    saldoLivre,
    formatCurrency
  } = useFinanceContext();

  return (
    <>
      {/* --- MODAL DE GERENCIAMENTO DE POUPANÇA (GUARDAR DINHEIRO) --- */}
      {isPoupancaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-slate-900 dark:to-slate-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-pink-100 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Gerenciar Guardar Dinheiro</h3>
                  <p className="text-[10px] text-pink-200/90 dark:text-slate-400">Edite seu saldo guardado e distribua por motivos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingPoupancaId(null)
                  setFormPoupancaMotivoNome('')
                  setFormPoupancaMotivoValor('')
                  setIsPoupancaModalOpen(false)
                }}
                className="text-white/80 hover:text-white text-sm font-bold bg-white/15 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
              >
                Fechar
              </button>
            </div>
            {/* Conteúdo rolável */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">

              {/* Formulário 1: Saldo Geral */}
              <form onSubmit={handleSavePoupancaTotal} className="space-y-3 p-4 bg-pink-200/20 dark:bg-slate-950/40 rounded-2xl border border-pink-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-pink-900 dark:text-amber-400">1. Saldo Geral Guardado</h4>
                <div className="flex gap-3 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Total Guardado (R$)</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-semibold text-xs">R$</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formPoupancaTotal}
                        onChange={(e) => {
                          const cleanDigits = e.target.value.replace(/\D/g, '');
                          if (!cleanDigits) {
                            setFormPoupancaTotal('');
                            return;
                          }
                          const cents = parseInt(cleanDigits, 10);
                          if (cents === 0) {
                            setFormPoupancaTotal('');
                            return;
                          }
                          const formatted = (cents / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                          setFormPoupancaTotal(formatted);
                        }}
                        placeholder="Ex: 15000,00"
                        className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-pink-900 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary h-[38px] px-4 py-0 flex items-center justify-center gap-1.5 text-xs text-nowrap"
                  >
                    Atualizar Saldo
                  </button>
                </div>
              </form>

              {/* Barra de Distribuição de Alocação */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Alocação por Motivos</span>
                  <span className="text-slate-500">
                    {formatCurrency(totalAlocado)} / <span className="text-slate-700 dark:text-slate-300">{formatCurrency(totalGuardado)}</span>
                  </span>
                </div>

                <div className="w-full bg-pink-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  {motivosPoupanca.map((p, idx) => {
                    const pct = totalGuardado > 0 ? (p.valor / totalGuardado) * 100 : 0
                    const colors = [
                      'bg-pink-500 dark:bg-amber-500',
                      'bg-rose-500 dark:bg-amber-600',
                      'bg-emerald-500 dark:bg-slate-600',
                      'bg-indigo-500 dark:bg-amber-400'
                    ]
                    const colorClass = colors[idx % colors.length]
                    return (
                      <div
                        key={p.id}
                        className={`h-full ${colorClass}`}
                        style={{ width: `${pct}%` }}
                        title={`${p.motivo}: ${pct.toFixed(1)}%`}
                      ></div>
                    )
                  })}
                  {saldoLivre > 0 && (
                    <div
                      className="h-full bg-slate-300 dark:bg-slate-700"
                      style={{ width: `${totalGuardado > 0 ? (saldoLivre / totalGuardado) * 100 : 100}%` }}
                      title={`Livre/Não Alocado: ${totalGuardado > 0 ? ((saldoLivre / totalGuardado) * 100).toFixed(1) : 100}%`}
                    ></div>
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-semibold italic">
                  <span>{formatCurrency(totalAlocado)} Alocados</span>
                  <span>{formatCurrency(saldoLivre)} Livres (Sem destinação)</span>
                </div>
              </div>

              {/* Formulário 2: Adicionar Motivo */}
              <form onSubmit={handleSavePoupancaMotivo} className="space-y-4 p-4 bg-pink-200/20 dark:bg-slate-950/40 rounded-2xl border border-pink-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-pink-900 dark:text-amber-400">2. Criar / Atualizar Motivo</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Motivo / Destinação</label>
                    <input
                      type="text"
                      required
                      value={formPoupancaMotivoNome}
                      onChange={(e) => setFormPoupancaMotivoNome(e.target.value)}
                      placeholder="Ex: Reserva de Emergência, Viagem..."
                      className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-pink-900 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Valor Alocado (R$)</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-semibold text-xs">R$</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formPoupancaMotivoValor}
                        onChange={(e) => {
                          const cleanDigits = e.target.value.replace(/\D/g, '');
                          if (!cleanDigits) {
                            setFormPoupancaMotivoValor('');
                            return;
                          }
                          const cents = parseInt(cleanDigits, 10);
                          if (cents === 0) {
                            setFormPoupancaMotivoValor('');
                            return;
                          }
                          const formatted = (cents / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                          setFormPoupancaMotivoValor(formatted);
                        }}
                        placeholder="Ex: 5000,00"
                        className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-pink-900 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </div>

                {totalAlocado > totalGuardado && (
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                    Aviso: O valor total alocado ({formatCurrency(totalAlocado)}) excede o saldo geral guardado ({formatCurrency(totalGuardado)}).
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="btn-primary flex-1 h-[38px] py-0 flex items-center justify-center gap-1.5 text-xs bg-gradient-to-r from-pink-600 to-rose-600 dark:from-amber-500 dark:to-amber-600 dark:text-slate-950"
                  >
                    {editingPoupancaId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingPoupancaId ? 'Atualizar Motivo' : 'Salvar Motivo / Alocação'}
                  </button>
                  {editingPoupancaId && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormPoupancaMotivoNome('')
                        setFormPoupancaMotivoValor('')
                        setEditingPoupancaId(null)
                      }}
                      className="btn-secondary h-[38px] px-3 text-xs"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              {/* Lista de Motivos Ativos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300">Motivos Cadastrados</h4>
                <div className="border border-pink-200/50 dark:border-slate-800/60 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold border-b border-pink-200 dark:border-slate-800">
                        <th className="p-3">Motivo</th>
                        <th className="p-3">Valor Alocado</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-200/30 dark:divide-slate-800/40">
                      {motivosPoupanca.length > 0 ? (
                        motivosPoupanca.map(p => (
                          <tr key={p.id} className="hover:bg-pink-200/10 dark:hover:bg-slate-900/30 transition-colors">
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] truncate" title={p.motivo}>{p.motivo}</td>
                            <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.valor)}</td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPoupancaId(p.id)
                                    setFormPoupancaMotivoNome(p.motivo)
                                    setFormPoupancaMotivoValor(Number(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                                  }}
                                  className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 transition-colors"
                                  title="Editar Motivo"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePoupancaMotivo(p)}
                                  className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 transition-colors"
                                  title="Excluir Motivo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-slate-500 italic">Nenhum motivo específico criado ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}



