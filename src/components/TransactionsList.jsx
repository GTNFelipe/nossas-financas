import {
  Plus, ChevronDown, TrendingUp, TrendingDown, Wallet, Edit, Trash2, Copy, Check, Clock, Info
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function TransactionsList() {
  const {
    activeTab,
    setIsModalOpen,
    setEditingTransactionId,
    getTodayMonthStr,
    selectedMonth,
    setSelectedMonth,
    filterPerson,
    setFilterPerson,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    setFormValor,
    setFormSubcategoria,
    categoriasValidas,
    startEditTransaction,
    startDuplicateTransaction,
    handleDeleteTransaction,
    handleOpenCCModal,
    handleToggleCCGroupStatus,
    handleDeleteCCGroup,
    startEditCCGroup,
    toggleTransactionStatus,
    filteredTransactions,
    filteredReceitas,
    filteredDespesas,
    uniqueMonths,
    formatCurrency,
    getCategoryIcon
  } = useFinanceContext();

  return (
    <>
        {/* --- Aba 2: Lançamentos --- */}
        {activeTab === 'lancamentos' && (
          <div className="space-y-6 animate-slide-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-pink-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-pink-200 dark:border-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Controle Detalhado de Lançamentos</h2>
                <p className="text-sm text-slate-500">Adicione novos registros ou audite a lista completa de despesas e receitas</p>
              </div>
              <button
                onClick={() => {
                  setEditingTransactionId(null)
                  setFormValor('')
                  setFormSubcategoria('')
                  setIsModalOpen(true)
                }}
                className="btn-primary w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                Novo Lançamento
              </button>
            </div>

             {/* Repete a tabela completa com mais destaque */}
            <div className="glass-panel p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Seleção do mês */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Mês:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-1.5 px-3 font-semibold text-xs text-pink-900 dark:text-slate-200 outline-none"
                  >
                    {uniqueMonths.map(m => (
                      <option key={m} value={m}>{m.split('-')[1]}/{m.split('-')[0]}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(getTodayMonthStr())}
                    title="Ir para o mês atual"
                    className="flex items-center justify-center py-1.5 px-3 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl font-bold text-pink-900 dark:text-slate-200 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer text-xs gap-1"
                  >
                    Mês Atual
                  </button>
                </div>

                {/* Categoria */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Cat:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className="w-36 flex items-center justify-between gap-2.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-1.5 px-3 font-semibold text-xs text-pink-900 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <span className="truncate mr-1">
                        {filterCategory === 'Todas' ? '🔍 Todas' : `${getCategoryIcon(filterCategory)} ${filterCategory}`}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-pink-600 dark:text-amber-400 flex-shrink-0 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        />
                        <div className="absolute left-0 mt-2 w-52 bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                          <button
                            type="button"
                            onClick={() => {
                              setFilterCategory('Todas')
                              setIsCategoryDropdownOpen(false)
                            }}
                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${filterCategory === 'Todas'
                              ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                              : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                              }`}
                          >
                            🔍 Todas
                          </button>
                          {categoriasValidas.map(cat => {
                            const isSelected = cat === filterCategory
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setFilterCategory(cat)
                                  setIsCategoryDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {getCategoryIcon(cat)} {cat}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quem Pagou */}
                <div className="flex bg-pink-200/40 dark:bg-slate-900 p-0.5 rounded-lg border border-pink-200/60 dark:border-amber-500/20 text-xs">
                  {['Todos', 'Felipe', 'Thaís'].map(p => (
                    <button
                      key={p}
                      onClick={() => setFilterPerson(p)}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filterPerson === p
                        ? 'bg-pink-50 dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm font-bold'
                        : 'text-pink-700/70 hover:text-pink-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Tipo */}
                <div className="flex bg-pink-200/40 dark:bg-slate-900 p-0.5 rounded-lg border border-pink-200/60 dark:border-amber-500/20 text-xs">
                  {['Todos', 'Receita', 'Despesa'].map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all ${filterType === t
                        ? 'bg-pink-50 dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm font-bold'
                        : 'text-pink-700/70 hover:text-pink-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Status */}
                <div className="flex bg-pink-200/40 dark:bg-slate-900 p-0.5 rounded-lg border border-pink-200/60 dark:border-amber-500/20 text-xs">
                  {['Todos', 'Pago', 'Pendente'].map(s => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${filterStatus === s
                        ? 'bg-pink-50 dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm font-bold'
                        : 'text-pink-700/70 hover:text-pink-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      {s === 'Todos' ? 'Todos' : s === 'Pago' ? 'Pagas' : 'Pendentes'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumo de Totais Filtrados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Card Ganhos */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-white dark:text-slate-950 rounded-xl">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total de Ganhos</span>
                    <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(filteredReceitas)}</h4>
                  </div>
                </div>

                {/* Card Gastos */}
                <div className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 dark:border-rose-500/10 flex items-center gap-3">
                  <div className="p-2 bg-rose-500 text-white dark:text-slate-950 rounded-xl">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total de Gastos</span>
                    <h4 className="text-base font-black text-rose-600 dark:text-rose-400">{formatCurrency(filteredDespesas)}</h4>
                  </div>
                </div>

                {/* Card Saldo Filtrado */}
                <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  (filteredReceitas - filteredDespesas) >= 0
                    ? 'bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/20 dark:border-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20 dark:border-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  <div className={`p-2 rounded-xl text-white dark:text-slate-950 ${
                    (filteredReceitas - filteredDespesas) >= 0 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}>
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Saldo Líquido</span>
                    <h4 className="text-base font-black">{formatCurrency(filteredReceitas - filteredDespesas)}</h4>
                  </div>
                </div>
              </div>

              {/* Tabela de Transações */}
              <div className="overflow-x-auto rounded-xl border border-pink-200 dark:border-amber-500/20">
                <table className="w-full min-w-[850px] text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold text-xs border-b border-pink-200 dark:border-amber-500/20">
                      <th className="px-2 py-3 w-[11%]">Criado em</th>
                      <th className="px-2 py-3 w-[8%]">Referência</th>
                      <th className="px-2 py-3 w-[16%]">Categoria</th>
                      <th className="px-2 py-3 w-[18%]">Subcategoria</th>
                      <th className="px-2 py-3 w-[12%]">Quem Pagou</th>
                      <th className="px-2 py-3 w-[12%]">Valor</th>
                      <th className="px-2 py-3 w-[11%]">Status</th>
                      <th className="px-2 py-3 w-[12%] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40 text-xs">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-pink-200/20 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400 truncate text-center" title={`${new Date(tx.criado_em).toLocaleDateString('pt-BR')} ${new Date(tx.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}>
                            <div className="font-semibold">{new Date(tx.criado_em).toLocaleDateString('pt-BR')}</div>
                            <div className="text-[10px] opacity-75">{new Date(tx.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-2 py-2.5 font-semibold text-slate-700 dark:text-slate-200 truncate">
                            {(() => {
                              const [y, m] = tx.data_referencia.split('-').map(Number);
                              const date = new Date(y, m - 1);
                              if (tx.categoria === 'Cartão de Crédito') {
                                date.setMonth(date.getMonth() + 1);
                              }
                              return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                            })()}
                          </td>
                          <td className="px-2 py-2.5">
                            <div className={`flex items-center gap-1 font-bold truncate ${tx.tipo === 'Receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} title={tx.categoria}>
                              <span className="flex-shrink-0">{getCategoryIcon(tx.categoria)}</span>
                              <span className="truncate">{tx.categoria}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400 truncate" title={tx.subcategoria}>
                            {tx.subcategoria}
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="truncate">
                              {tx.quem_pagou === 'Felipe / Thaís' ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-100 to-pink-100 text-slate-800 dark:from-amber-950/40 dark:to-pink-950/40 dark:text-slate-200 max-w-full truncate" title="Felipe / Thaís">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 -ml-0.5 flex-shrink-0"></span>
                                  <span className="truncate ml-0.5">Felipe / Thaís</span>
                                </span>
                              ) : (
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold max-w-full truncate ${tx.quem_pagou === 'Felipe'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                                  }`} title={tx.quem_pagou}>
                                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${tx.quem_pagou === 'Felipe' ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
                                  <span className="truncate">{tx.quem_pagou}</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className={`px-2 py-2.5 font-bold truncate ${tx.tipo === 'Receita'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                            }`} title={`${tx.tipo === 'Receita' ? '+' : '-'} ${formatCurrency(tx.valor)}`}>
                            {tx.tipo === 'Receita' ? '+' : '-'} {formatCurrency(tx.valor)}
                          </td>
                          <td className="px-2 py-2.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (tx.categoria === 'Cartão de Crédito') {
                                  handleToggleCCGroupStatus(tx.data_referencia.substring(0, 7), tx.status)
                                } else {
                                  toggleTransactionStatus(tx)
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold cursor-pointer transition-all active:scale-95 hover:opacity-85 max-w-full truncate ${tx.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/35 dark:text-rose-450'
                                }`}
                              title="Clique para alternar status"
                            >
                              {tx.status === 'Pago' ? (
                                <>
                                  <Check className="h-3 w-3 flex-shrink-0" /> <span className="truncate">Pago</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 flex-shrink-0" /> <span className="truncate">Pendente</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {tx.categoria === 'Cartão de Crédito' ? (
                                <>
                                  <button
                                    onClick={() => handleOpenCCModal(tx.data_referencia.substring(0, 7))}
                                    className="p-1 text-pink-600 hover:text-pink-800 dark:text-amber-400 dark:hover:text-amber-500 rounded hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
                                    title="Ver Itens do Cartão"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => startEditCCGroup(tx.data_referencia.substring(0, 7))}
                                    className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 rounded hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90 cursor-pointer"
                                    title="Editar Fatura"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCCGroup(tx.data_referencia.substring(0, 7))}
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90 cursor-pointer"
                                    title="Excluir Fatura Completa"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditTransaction(tx)}
                                    className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 rounded hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90"
                                    title="Editar Lançamento"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => startDuplicateTransaction(tx)}
                                    className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 rounded hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90"
                                    title="Copiar Lançamento"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(tx.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90"
                                    title="Excluir Lançamento"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-500">
                          Nenhuma transação cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
    </>
  );
}





