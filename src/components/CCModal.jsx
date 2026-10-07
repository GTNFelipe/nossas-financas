import {
  Clock, CreditCard, Plus, Check, Edit, Trash2, X
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function CCModal() {
  const {
    transactions,
    isCCModalOpen,
    setIsCCModalOpen,
    ccModalMonth,
    editingCCItemId,
    setEditingCCItemId,
    formCCDate,
    setFormCCDate,
    formCCSubcategory,
    setFormCCSubcategory,
    formCCValor,
    setFormCCValor,
    formCCRecorrencia,
    setFormCCRecorrencia,
    editCCDate,
    setEditCCDate,
    editCCSubcategory,
    setEditCCSubcategory,
    editCCValor,
    setEditCCValor,
    editCCStatus,
    setEditCCStatus,
    editCCCategoria,
    setEditCCCategoria,
    editCCRecorrencia,
    setEditCCRecorrencia,
    editCCQuemPagou,
    setEditCCQuemPagou,
    formCCQuemPagou,
    setFormCCQuemPagou,
    categoriasValidas,
    handleDeleteTransaction,
    handleAddCCItem,
    startEditCCItem,
    handleSaveCCItemEdit,
    toggleCCItemStatus,
    formatCCModalMonthName,
    formatDate,
    capitalizeWords,
    formatCurrency,
    getCategoryIcon
  } = useFinanceContext();

  return (
    <>
      {/* --- MODAL DE DETALHES DO CARTÃO DE CRÉDITO --- */}
      {isCCModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-4xl bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-slate-900 dark:to-slate-950 text-white flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-pink-100 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Fatura de {formatCCModalMonthName(ccModalMonth)}</h3>
                  <p className="text-[10px] text-pink-200/90 dark:text-slate-400">Compras no Cartão de Crédito (Compartilhado Felipe / Thaís)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCCModalOpen(false)
                  setEditingCCItemId(null)
                }}
                className="text-white/85 hover:text-white text-sm font-bold bg-white/15 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo Principal (Scrollable) */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              {/* Cards de Resumo */}
              {(() => {
                const items = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === ccModalMonth);
                const total = items.reduce((sum, item) => sum + item.valor, 0);
                const pago = items.filter(item => item.status === 'Pago').reduce((sum, item) => sum + item.valor, 0);
                const pendente = items.filter(item => item.status === 'Pendente').reduce((sum, item) => sum + item.valor, 0);

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Card Total */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-pink-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total da Fatura</span>
                        <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">{formatCurrency(total)}</h4>
                      </div>
                      <div className="p-2.5 bg-pink-100/50 dark:bg-slate-900 rounded-xl">
                        <CreditCard className="h-5 w-5 text-pink-600 dark:text-amber-400" />
                      </div>
                    </div>

                    {/* Card Pago */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-pink-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Pago</span>
                        <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(pago)}</h4>
                      </div>
                      <div className="p-2.5 bg-emerald-50 dark:bg-slate-900 rounded-xl">
                        <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>

                    {/* Card Pendente */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-pink-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">A Pagar (Pendente)</span>
                        <h4 className="text-xl font-extrabold text-amber-500 dark:text-amber-400 mt-1">{formatCurrency(pendente)}</h4>
                      </div>
                      <div className="p-2.5 bg-amber-50 dark:bg-slate-900 rounded-xl">
                        <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Formulário de Adição Rápida */}
              <div className="bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-pink-100 dark:border-slate-800">
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wider">Adicionar Nova Compra</h4>
                <form onSubmit={handleAddCCItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">

                  {/* Data */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Data</label>
                    <input
                      type="date"
                      required
                      value={formCCDate}
                      onChange={(e) => setFormCCDate(e.target.value)}
                      className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-pink-900 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Descrição */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Descrição</label>
                    <input
                      type="text"
                      required
                      value={formCCSubcategory}
                      onChange={(e) => setFormCCSubcategory(capitalizeWords(e.target.value))}
                      placeholder="Ex: Assinatura Netflix, Farmácia..."
                      className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-pink-900 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    />
                  </div>

                  {/* Valor */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Valor (R$)</label>
                    <div className="relative rounded-xl shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-semibold text-[10px]">R$</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={formCCValor}
                        onChange={(e) => {
                          const cleanDigits = e.target.value.replace(/\D/g, '');
                          if (!cleanDigits) {
                            setFormCCValor('');
                            return;
                          }
                          const cents = parseInt(cleanDigits, 10);
                          if (cents === 0) {
                            setFormCCValor('');
                            return;
                          }
                          const formatted = (cents / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          });
                          setFormCCValor(formatted);
                        }}
                        placeholder="0,00"
                        className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-pink-900 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  {/* Recorrência / Parcelas */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Parcelas</label>
                    <select
                      value={formCCRecorrencia}
                      onChange={(e) => setFormCCRecorrencia(parseInt(e.target.value, 10))}
                      className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-pink-900 dark:text-slate-200 font-bold outline-none cursor-pointer focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((r) => (
                        <option key={r} value={r}>
                          {r === 1 ? '1x (À vista)' : `${r}x`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quem Pagou */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Quem Pagou</label>
                    <div className="flex bg-pink-100/60 dark:bg-slate-800 p-0.5 rounded-xl border border-pink-200 dark:border-slate-700">
                      {['Felipe', 'Thaís'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormCCQuemPagou(p)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${formCCQuemPagou === p
                            ? 'bg-white dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                            }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Status</label>
                    <select
                      disabled
                      value="Pendente"
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-450 dark:text-slate-500 font-bold outline-none cursor-not-allowed"
                    >
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>

                  {/* Botão de Adicionar */}
                  <div className="md:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 dark:from-amber-500 dark:to-amber-600 hover:opacity-90 dark:text-slate-950 font-bold py-2 px-3 rounded-xl transition-all active:scale-95 text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Tabela de Compras */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Itens da Fatura</h4>

                <div className="overflow-x-auto rounded-xl border border-pink-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold border-b border-pink-200 dark:border-slate-800">
                        <th className="p-3 w-[9%]">Data</th>
                        <th className="p-3 w-[25%]">Descrição</th>
                        <th className="p-3 w-[13%]">Categoria</th>
                        <th className="p-3 w-[9%]">Parcelas</th>
                        <th className="p-3 w-[10%]">Valor</th>
                        <th className="p-3 w-[9%]">Quem</th>
                        <th className="p-3 w-[10%]">Status</th>
                        <th className="p-3 w-[10%] text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40">
                      {(() => {
                        const items = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === ccModalMonth);

                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan="7" className="p-6 text-center text-slate-400 dark:text-slate-500 font-medium">
                                Nenhuma compra lançada nesta fatura.
                              </td>
                            </tr>
                          );
                        }

                        // Ordenar itens da fatura por data de referência decrescente
                        const sortedItems = [...items].sort((a, b) => b.data_referencia.localeCompare(a.data_referencia) || b.criado_em.localeCompare(a.criado_em));

                        return sortedItems.map(item => {
                          const isEditing = editingCCItemId === item.id;

                          if (isEditing) {
                            return (
                              <tr key={item.id} className="bg-pink-100/30 dark:bg-slate-800/60">
                                {/* Edit Date */}
                                <td className="p-2">
                                  <input
                                    type="date"
                                    required
                                    value={editCCDate}
                                    onChange={(e) => setEditCCDate(e.target.value)}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-slate-200 outline-none"
                                  />
                                </td>

                                {/* Edit Description */}
                                <td className="p-2">
                                  <input
                                    type="text"
                                    required
                                    value={editCCSubcategory}
                                    onChange={(e) => setEditCCSubcategory(capitalizeWords(e.target.value))}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-white outline-none"
                                  />
                                </td>

                                {/* Edit Categoria */}
                                <td className="p-2">
                                  <select
                                    value={editCCCategoria}
                                    onChange={(e) => setEditCCCategoria(e.target.value)}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-slate-200 font-bold outline-none cursor-pointer"
                                  >
                                    {categoriasValidas.filter(c => c !== 'Transferência').map(c => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </td>

                                {/* Edit Parcelas */}
                                <td className="p-2">
                                  <select
                                    value={editCCRecorrencia}
                                    onChange={(e) => setEditCCRecorrencia(parseInt(e.target.value, 10))}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-slate-200 font-bold outline-none cursor-pointer"
                                  >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((r) => (
                                      <option key={r} value={r}>
                                        {r === 1 ? '1x' : `${r}x`}
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Edit Value */}
                                <td className="p-2">
                                  <input
                                    type="text"
                                    required
                                    value={editCCValor}
                                    onChange={(e) => {
                                      const cleanDigits = e.target.value.replace(/\D/g, '');
                                      if (!cleanDigits) {
                                        setEditCCValor('');
                                        return;
                                      }
                                      const cents = parseInt(cleanDigits, 10);
                                      if (cents === 0) {
                                        setEditCCValor('');
                                        return;
                                      }
                                      const formatted = (cents / 100).toLocaleString('pt-BR', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                      });
                                      setEditCCValor(formatted);
                                    }}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-white font-bold outline-none"
                                  />
                                </td>

                                {/* Edit Quem Pagou */}
                                <td className="p-2">
                                  <select
                                    value={editCCQuemPagou}
                                    onChange={(e) => setEditCCQuemPagou(e.target.value)}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-slate-200 font-bold outline-none cursor-pointer"
                                  >
                                    <option value="Felipe">Felipe</option>
                                    <option value="Thaís">Thaís</option>
                                  </select>
                                </td>

                                {/* Edit Status */}
                                <td className="p-2">
                                  <select
                                    value={editCCStatus}
                                    onChange={(e) => setEditCCStatus(e.target.value)}
                                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-lg py-1 px-2 text-[11px] text-pink-900 dark:text-slate-200 font-bold outline-none cursor-pointer"
                                  >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                  </select>
                                </td>

                                {/* Edit Actions */}
                                <td className="p-2 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleSaveCCItemEdit(item.id)}
                                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                                      title="Salvar Alterações"
                                    >
                                      <Check className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingCCItemId(null)}
                                      className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                                      title="Cancelar"
                                    >
                                      <X className="h-4.5 w-4.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={item.id} className="hover:bg-pink-100/20 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="p-3 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                {formatDate(item.data_referencia)}
                              </td>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-200 break-all">
                                {item.subcategoria}
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                                {getCategoryIcon(item.categoria)} {item.categoria}
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                                {(() => {
                                  const match = item.subcategoria.match(/\((\d+)\/(\d+)\)/);
                                  return match ? `${match[1]} de ${match[2]}` : '1x (À vista)';
                                })()}
                              </td>
                              <td className="p-3 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                {formatCurrency(item.valor)}
                              </td>
                              {/* Quem */}
                              <td className="p-3 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${item.quem_pagou === 'Felipe'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                                  }`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${item.quem_pagou === 'Felipe' ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
                                  {item.quem_pagou}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span
                                  onClick={() => toggleCCItemStatus(item)}
                                  className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full font-bold text-xs cursor-pointer hover:opacity-85 select-none transition-all active:scale-95 ${item.status === 'Pago'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                    }`}
                                  title="Clique para alternar status"
                                >
                                  {item.status === 'Pago' ? (
                                    <>
                                      <Check className="h-3 w-3" /> Pago
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3" /> Pendente
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => startEditCCItem(item)}
                                    className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 rounded hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
                                    title="Editar Item"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(item.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90 cursor-pointer"
                                    title="Excluir Item"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
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



