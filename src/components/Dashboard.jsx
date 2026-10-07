import {
  Wallet, TrendingUp, TrendingDown, Clock, Target, CreditCard, Plus, Check, ChevronDown, SlidersHorizontal, ArrowLeftRight, RefreshCw, Info, Edit, Trash2, Copy, Calendar, DollarSign
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function Dashboard() {
  const {
    transactions,
    setIsPoupancaModalOpen,
    theme,
    activeTab,
    setIsModalOpen,
    setEditingTransactionId,
    categoryChartType,
    setCategoryChartType,
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
    isMonthDropdownOpen,
    setIsMonthDropdownOpen,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    setFormValor,
    setFormSubcategoria,
    setFormPoupancaTotal,
    setIsTransferModalOpen,
    categoriasValidas,
    handleVRVARecharge,
    handleVRVARevert,
    startEditTransaction,
    startDuplicateTransaction,
    handleDeleteTransaction,
    handleOpenCCModal,
    handleToggleCCGroupStatus,
    handleDeleteCCGroup,
    startEditCCGroup,
    toggleTransactionStatus,
    totalGuardado,
    motivosPoupanca,
    totalAlocado,
    saldoLivre,
    totalReceita,
    receitasPagas,
    receitasPendentes,
    receitasFelipe,
    receitasThais,
    pctReceitaFelipe,
    showReceitaSplitBar,
    totalDespesa,
    despesasPagas,
    despesasPendentes,
    despesasFelipe,
    despesasThais,
    pctDespesaFelipe,
    showDespesaSplitBar,
    reservaEmergenciaItem,
    valorAtualReserva,
    metaReservaEmergencia,
    quantoFalta,
    porcentagemReserva,
    totalBusinessDays,
    remainingBusinessDays,
    isMonthCurrent,
    dinheiroEmConta,
    saldoLiquido,
    dailyNeededTotal,
    dailyNeededRemaining,
    dinheiroEmContaFelipe,
    dinheiroEmContaThais,
    showSplitBar,
    pctFelipe,
    totalDespesasPendentes,
    dinheiroLivre,
    cargaVRVA,
    gastoVRVA,
    saldoRestanteVRVA,
    pctVRVA,
    freeMoneyData,
    formatDate,
    filteredTransactions,
    uniqueMonths,
    chartData,
    categoryChartData,
    categoryPieData,
    PIE_COLORS,
    formatCurrency,
    getCategoryIcon
  } = useFinanceContext();

  return (
    <>
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-slide-in">

            {/* Seletor de Mês de Referência */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-pink-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-pink-200 dark:border-amber-500/20">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                    className="flex items-center justify-between gap-2.5 w-full sm:w-40 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-2.5 px-4 font-bold text-pink-900 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <span>
                      {selectedMonth.split('-')[1]}/{selectedMonth.split('-')[0]}
                    </span>
                    <ChevronDown className={`h-4.5 w-4.5 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMonthDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setIsMonthDropdownOpen(false)}
                      />
                      <div className="absolute left-0 mt-2 w-full sm:w-40 bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                        {uniqueMonths.length > 0 ? (
                          uniqueMonths.map(m => {
                            const isSelected = m === selectedMonth
                            return (
                              <button
                                key={m}
                                type="button"
                                ref={isSelected ? (el) => {
                                  if (el) {
                                    setTimeout(() => {
                                      el.scrollIntoView({ block: 'nearest', behavior: 'auto' })
                                    }, 100)
                                  }
                                } : null}
                                onClick={() => {
                                  setSelectedMonth(m)
                                  setIsMonthDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {m.split('-')[1]}/{m.split('-')[0]}
                              </button>
                            )
                          })
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMonth('2026-05')
                              setIsMonthDropdownOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-pink-900 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800"
                          >
                            05/2026
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMonth(getTodayMonthStr())}
                  title="Ir para o mês atual"
                  className="px-3.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl font-bold text-pink-900 dark:text-slate-200 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer text-xs flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 text-pink-600 dark:text-amber-400 font-semibold" />
                  Mês Atual
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setEditingTransactionId(null)
                    setFormValor('')
                    setFormSubcategoria('')
                    setIsModalOpen(true)
                  }}
                  className="btn-primary"
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Lançar</span>
                </button>
              </div>
            </div>

            {/* --- Cards de Resumo Visual (KPIs) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1: Dinheiro em Conta */}
              <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Dinheiro em Conta</p>
                    <h3 className={`text-2xl font-bold mt-2 ${dinheiroEmConta >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(dinheiroEmConta)}
                    </h3>
                  </div>
                  <div className="p-3 bg-pink-100 dark:bg-slate-800 rounded-xl text-pink-600 dark:text-amber-400 shadow-inner">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-500/10 px-2 py-1 rounded-md w-fit">
                    <Check className="h-3 w-3 text-emerald-500" />
                    Saldo Líquido Pago
                  </div>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 dark:text-amber-400 dark:hover:text-amber-500 font-bold bg-pink-100 hover:bg-pink-200/60 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer active:scale-95"
                    title="Transferir saldo entre contas"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Transferir
                  </button>
                </div>

                {/* Divisor e Saldos Individuais */}
                <div className="mt-4 pt-3 border-t border-pink-200/50 dark:border-slate-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Felipe</span>
                        <span className={`text-sm font-extrabold ${dinheiroEmContaFelipe >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatCurrency(dinheiroEmContaFelipe)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 text-right">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Thaís</span>
                        <span className={`text-sm font-extrabold ${dinheiroEmContaThais >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatCurrency(dinheiroEmContaThais)}
                        </span>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0"></span>
                    </div>
                  </div>

                  {/* Barra de Proporção do Saldo */}
                  {showSplitBar && (
                    <div className="w-full bg-pink-100/50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex" title="Proporção do saldo na carteira de cada um">
                      <div
                        className="h-full bg-amber-500 dark:bg-amber-500 transition-all duration-500"
                        style={{ width: `${pctFelipe}%` }}
                        title={`Felipe: ${formatCurrency(dinheiroEmContaFelipe)} (${pctFelipe.toFixed(0)}%)`}
                      ></div>
                      <div
                        className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-500"
                        style={{ width: `${100 - pctFelipe}%` }}
                        title={`Thaís: ${formatCurrency(dinheiroEmContaThais)} (${(100 - pctFelipe).toFixed(0)}%)`}
                      ></div>
                    </div>
                  )}
                </div>

                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-pink-500/5 rounded-full blur-xl translate-x-4 translate-y-4 pointer-events-none"></div>
              </div>

              {/* Card 2: Receitas do Mês */}
              <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Receitas do Mês</p>
                      <h3 className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
                        {formatCurrency(totalReceita)}
                      </h3>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl text-green-600 dark:text-green-400 shadow-inner">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-md">
                      <Check className="h-3 w-3" />
                      Recebido: {formatCurrency(receitasPagas)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      Pendente: {formatCurrency(receitasPendentes)}
                    </div>
                  </div>

                  {/* Divisor e Receitas Individuais */}
                  <div className="mt-4 pt-3 border-t border-pink-200/50 dark:border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Felipe</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(receitasFelipe)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-right">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Thaís</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(receitasThais)}
                          </span>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0"></span>
                      </div>
                    </div>

                    {/* Barra de Proporção da Receita */}
                    {showReceitaSplitBar && (
                      <div className="w-full bg-pink-100/50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex" title="Proporção de receitas de cada um">
                        <div
                          className="h-full bg-amber-500 dark:bg-amber-500 transition-all duration-500"
                          style={{ width: `${pctReceitaFelipe}%` }}
                          title={`Felipe: ${formatCurrency(receitasFelipe)} (${pctReceitaFelipe.toFixed(0)}%)`}
                        ></div>
                        <div
                          className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-500"
                          style={{ width: `${100 - pctReceitaFelipe}%` }}
                          title={`Thaís: ${formatCurrency(receitasThais)} (${(100 - pctReceitaFelipe).toFixed(0)}%)`}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-green-500/5 rounded-full blur-xl translate-x-4 translate-y-4 pointer-events-none"></div>
              </div>

              {/* Card 3: Despesas do Mês */}
              <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Despesas do Mês</p>
                      <h3 className="text-2xl font-bold mt-2 text-red-600 dark:text-red-400">
                        {formatCurrency(totalDespesa)}
                      </h3>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400 shadow-inner">
                      <TrendingDown className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-1 rounded-md">
                      <Check className="h-3 w-3" />
                      Pago: {formatCurrency(despesasPagas)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" />
                      Pendente: {formatCurrency(despesasPendentes)}
                    </div>
                  </div>

                  {/* Divisor e Despesas Individuais */}
                  <div className="mt-4 pt-3 border-t border-pink-200/50 dark:border-slate-800/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0"></span>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Felipe</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(despesasFelipe)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-right">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block text-[10px] font-medium uppercase tracking-wider">Thaís</span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(despesasThais)}
                          </span>
                        </div>
                        <span className="h-2 w-2 rounded-full bg-pink-500 flex-shrink-0"></span>
                      </div>
                    </div>

                    {/* Barra de Proporção da Despesa */}
                    {showDespesaSplitBar && (
                      <div className="w-full bg-pink-100/50 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex" title="Proporção de despesas de cada um">
                        <div
                          className="h-full bg-amber-500 dark:bg-amber-500 transition-all duration-500"
                          style={{ width: `${pctDespesaFelipe}%` }}
                          title={`Felipe: ${formatCurrency(despesasFelipe)} (${pctDespesaFelipe.toFixed(0)}%)`}
                        ></div>
                        <div
                          className="h-full bg-pink-500 dark:bg-pink-400 transition-all duration-500"
                          style={{ width: `${100 - pctDespesaFelipe}%` }}
                          title={`Thaís: ${formatCurrency(despesasThais)} (${(100 - pctDespesaFelipe).toFixed(0)}%)`}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl translate-x-4 translate-y-4 pointer-events-none"></div>
              </div>

              {/* Card 3: Saldo do Mês */}
              <div className={`glass-panel glass-panel-hover p-6 relative overflow-hidden border-l-4 ${saldoLiquido >= 0
                ? 'border-l-green-500'
                : 'border-l-red-500'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Saldo Líquido</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Conta - Despesas Pendentes do Mês</p>
                    <h3 className={`text-2xl font-bold mt-1 ${saldoLiquido >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      {formatCurrency(saldoLiquido)}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl shadow-inner ${saldoLiquido >= 0
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                    }`}>
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold w-fit ${saldoLiquido >= 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {saldoLiquido >= 0 ? 'Superavitário' : 'Déficit no Mês'}
                  </span>
                  {saldoLiquido < 0 && (
                    <div className="mt-2 text-xs border-t border-pink-200/50 dark:border-slate-800/80 pt-2 space-y-1.5">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Meta Diária (Dias Úteis)</div>
                      {isMonthCurrent() && remainingBusinessDays > 0 ? (
                        <div className="font-bold text-pink-600 dark:text-amber-400">
                          {formatCurrency(dailyNeededRemaining)} <span className="text-[10px] font-normal text-slate-500">/ dia rest. ({remainingBusinessDays} d.ú.)</span>
                        </div>
                      ) : (
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(dailyNeededTotal)} <span className="text-[10px] font-normal text-slate-500">/ dia ({totalBusinessDays} d.ú.)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --- Layout de Gráficos e Transações Recentes --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gráfico de Barras Comparativo */}
              <div className="glass-panel p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Histórico Mensal</h3>
                    <p className="text-xs text-slate-500">Comparativo das receitas vs despesas nos últimos meses</p>
                  </div>
                  <div className="flex gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                      <span className="h-3 w-3 rounded-sm bg-green-500"></span> Receitas
                    </span>
                    <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                      <span className="h-3 w-3 rounded-sm bg-red-500"></span> Despesas
                    </span>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                      <XAxis
                        dataKey="name"
                        stroke={theme === 'dark' ? '#94a3b8' : '#64748b'}
                        tickFormatter={(v) => v.split('-')[1] + '/' + v.split('-')[0].substring(2)}
                        fontSize={11}
                        fontWeight="semibold"
                      />
                      <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} fontWeight="semibold" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#fdf2f8',
                          borderColor: theme === 'dark' ? '#475569' : '#fbcfe8',
                          color: theme === 'dark' ? '#f8fafc' : '#831843',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                        }}
                        cursor={theme === 'dark' ? { fill: 'rgba(0, 0, 0, 0.3)' } : { fill: 'rgba(251, 113, 133, 0.1)' }}
                        formatter={(val) => [formatCurrency(val)]}
                      />
                      <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                      <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Painel de Guardar Dinheiro em Evidência */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Guardar Dinheiro</h3>
                    <button
                      onClick={() => {
                        setFormPoupancaTotal(totalGuardado > 0 ? Number(totalGuardado).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                        setIsPoupancaModalOpen(true)
                      }}
                      className="p-2.5 bg-pink-100 hover:bg-pink-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-pink-600 dark:text-amber-400 shadow-inner transition-colors"
                      title="Gerenciar Guardar Dinheiro"
                    >
                      <SlidersHorizontal className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <span className="text-xs font-semibold text-slate-500">Saldo Geral Guardado</span>
                    <h4 className="text-3xl font-black mt-1 text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(totalGuardado)}
                    </h4>
                  </div>

                  {/* Barra de Distribuição de Alocação */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">Alocação por Motivos</span>
                      <span className="text-slate-500">
                        {totalGuardado > 0 ? ((totalAlocado / totalGuardado) * 100).toFixed(0) : 0}% alocado
                      </span>
                    </div>

                    <div className="w-full bg-pink-50 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
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
                            title={`${p.motivo}: ${formatCurrency(p.valor)} (${pct.toFixed(1)}%)`}
                          ></div>
                        )
                      })}
                      {saldoLivre > 0 && (
                        <div
                          className="h-full bg-slate-200 dark:bg-slate-700"
                          style={{ width: `${totalGuardado > 0 ? (saldoLivre / totalGuardado) * 100 : 100}%` }}
                          title={`Livre: ${formatCurrency(saldoLivre)} (${totalGuardado > 0 ? ((saldoLivre / totalGuardado) * 100).toFixed(1) : 100}%)`}
                        ></div>
                      )}
                    </div>
                  </div>

                  {/* Listagem de Alocações */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400">Detalhamento dos Motivos</h5>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {motivosPoupanca.length > 0 ? (
                        motivosPoupanca.map((p, idx) => {
                          const pct = totalGuardado > 0 ? (p.valor / totalGuardado) * 100 : 0
                          const colors = [
                            'bg-pink-500 dark:bg-amber-500',
                            'bg-rose-500 dark:bg-amber-600',
                            'bg-emerald-500 dark:bg-slate-600',
                            'bg-indigo-500 dark:bg-amber-400'
                          ]
                          const bulletColor = colors[idx % colors.length]
                          return (
                            <div key={p.id} className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 min-w-0 flex-1">
                                <span className={`h-2.5 w-2.5 rounded-full ${bulletColor} flex-shrink-0`}></span>
                                <span className="truncate font-semibold">{p.motivo}</span>
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-300 whitespace-nowrap ml-2">
                                {formatCurrency(p.valor)} <span className="text-[10px] text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2 text-center">Nenhum motivo específico criado.</p>
                      )}
                    </div>
                  </div>

                  {/* Reserva de Emergência Inteligência */}
                  {reservaEmergenciaItem ? (
                    <div className="mt-4 p-3.5 bg-pink-100/20 dark:bg-slate-950/40 rounded-2xl border border-pink-200/40 dark:border-slate-800/40 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-pink-900 dark:text-amber-400 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-pink-600 dark:text-amber-400" />
                          Reserva de Emergência
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold">
                          {porcentagemReserva.toFixed(0)}% • {quantoFalta > 0 ? `Faltam ${formatCurrency(quantoFalta)}` : 'Atingida!'}
                        </span>
                      </div>
                      <div className="w-full bg-pink-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 dark:from-amber-400 dark:to-amber-500 transition-all duration-500"
                          style={{ width: `${porcentagemReserva}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        Sua meta de 6 meses de custo de vida é <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(metaReservaEmergencia)}</span>. Você já tem <span className="font-bold text-slate-700 dark:text-slate-200">{formatCurrency(valorAtualReserva)}</span> guardados.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-pink-100/10 dark:bg-slate-950/20 rounded-2xl border border-dashed border-pink-200/60 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        Crie uma alocação com o nome exatamente <strong className="text-pink-900 dark:text-amber-400 font-bold">"Reserva de Emergência"</strong> para ativar a meta inteligente de 6 meses de custo de vida.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Saldo Livre (Sem destinação):</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{formatCurrency(saldoLivre)}</span>
                </div>
              </div>

            </div>

            {/* --- Novo Layout: Gráficos por Categoria --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Gráfico de Pizza por Categoria */}
              <div className="glass-panel p-6 lg:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Distribuição por Categoria</h3>
                    <p className="text-xs text-slate-500">Divisão percentual de transações por categoria no mês de referência</p>
                  </div>
                  <div className="flex bg-pink-200/40 dark:bg-slate-900 p-0.5 rounded-lg border border-pink-200/60 dark:border-amber-500/20 text-xs self-start sm:self-auto">
                    <button
                      onClick={() => setCategoryChartType('Despesa')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${categoryChartType === 'Despesa'
                        ? 'bg-pink-50 dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm font-bold'
                        : 'text-pink-700/70 hover:text-pink-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      Despesas (Gastos)
                    </button>
                    <button
                      onClick={() => setCategoryChartType('Receita')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${categoryChartType === 'Receita'
                        ? 'bg-pink-50 dark:bg-amber-500 text-pink-900 dark:text-slate-950 shadow-sm font-bold'
                        : 'text-pink-700/70 hover:text-pink-900 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                      Receitas (Entradas)
                    </button>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  {categoryPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${getCategoryIcon(name)} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          dataKey="value"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme === 'dark' ? '#1e293b' : '#fdf2f8',
                            borderColor: theme === 'dark' ? '#475569' : '#fbcfe8',
                            color: theme === 'dark' ? '#f8fafc' : '#831843',
                            borderRadius: '12px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                          }}
                          formatter={(val) => [formatCurrency(val)]}
                        />
                        <Legend
                          formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm italic">
                      Nenhuma {categoryChartType === 'Receita' ? 'receita' : 'despesa'} registrada no mês selecionado.
                    </div>
                  )}
                </div>
              </div>

              {/* Detalhamento de Categoria */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-4">Resumo do Mês</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {categoryChartData.length > 0 ? (
                      [...categoryChartData]
                        .sort((a, b) => {
                          const hasReceitasA = a.Receitas > 0
                          const hasReceitasB = b.Receitas > 0
                          if (hasReceitasA && !hasReceitasB) return -1
                          if (!hasReceitasA && hasReceitasB) return 1
                          if (hasReceitasA && hasReceitasB) {
                            return b.Receitas - a.Receitas
                          } else {
                            return b.Despesas - a.Despesas
                          }
                        })
                        .map(c => {
                          const net = c.Receitas - c.Despesas
                          return (
                            <div key={c.name} className="p-3 bg-pink-100/10 dark:bg-slate-900/50 rounded-xl border border-pink-200/30 dark:border-slate-800/30 space-y-1.5">
                              <div className="flex justify-between items-center text-sm font-semibold">
                                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                  <span className="text-base">{getCategoryIcon(c.name)}</span>
                                  {c.name}
                                </span>
                                <span className={`text-xs font-bold ${net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  {net >= 0 ? '+' : ''}{formatCurrency(net)}
                                </span>
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                <span>Entradas: {formatCurrency(c.Receitas)}</span>
                                <span>Saídas: {formatCurrency(c.Despesas)}</span>
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic py-4 text-center">Nenhum lançamento no mês selecionado.</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Categorias Ativas:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{categoryChartData.length}</span>
                </div>
              </div>

            </div>

            {/* --- Novo Layout: Dinheiro Livre, Vale Alimentação/Refeição e Progresso das Metas --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Card de Dinheiro Livre (Donut Chart) */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Disponibilidade do Saldo</h3>
                  <p className="text-xs text-slate-500 mb-6">Quanto do seu saldo em conta está livre após reservar o valor das contas pendentes do mês</p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {/* Donut Chart */}
                    <div className="h-[160px] w-[160px] flex-shrink-0 relative flex items-center justify-center">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Livre</span>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                          {formatCurrency(dinheiroLivre).split(',')[0]}
                        </span>
                      </div>
                      {freeMoneyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={freeMoneyData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {freeMoneyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#fdf2f8',
                                borderColor: theme === 'dark' ? '#475569' : '#fbcfe8',
                                color: theme === 'dark' ? '#f8fafc' : '#831843',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                              }}
                              formatter={(val) => [formatCurrency(val)]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-slate-500 italic">
                          Sem dados
                        </div>
                      )}
                    </div>

                    {/* Legenda detalhada */}
                    <div className="space-y-3 flex-1 w-full text-xs">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                          Livre para Gastar
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(dinheiroLivre)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                          Contas Pendentes
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatCurrency(totalDespesasPendentes)}
                        </span>
                      </div>
                      {dinheiroEmConta < totalDespesasPendentes && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-rose-500">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                            Déficit (Falta)
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(totalDespesasPendentes - dinheiroEmConta)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Saldo Total em Conta:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{formatCurrency(dinheiroEmConta)}</span>
                </div>
              </div>

              {/* Card de Vale Alimentação/Refeição Flexível (VA/VR) */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Alimentação & Refeição</h3>
                    <div className="p-2.5 bg-pink-100 dark:bg-orange-950/30 rounded-xl text-pink-600 dark:text-orange-400 shadow-inner">
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-xs font-semibold text-slate-500">Saldo Restante Flexível</span>
                    <h4 className={`text-3xl font-black mt-1 tracking-tight ${saldoRestanteVRVA >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatCurrency(saldoRestanteVRVA)}
                    </h4>
                  </div>

                  {/* Detalhes do Benefício */}
                  <div className="space-y-4">
                    {/* Barra de Progresso Gasto */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700 dark:text-slate-300">Uso do Limite Mensal</span>
                        <span className="text-slate-500">{pctVRVA.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-pink-50 dark:bg-orange-950/20 h-2.5 rounded-full overflow-hidden border border-pink-100/50 dark:border-orange-900/10">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-pink-600 dark:from-orange-400 dark:to-orange-600 transition-all duration-550"
                          style={{ width: `${Math.min(100, pctVRVA)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Info Geral de Gasto vs Recarga */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="p-3 bg-pink-100/10 dark:bg-slate-900/50 rounded-xl border border-pink-200/20 dark:border-slate-800/20">
                        <span className="text-[10px] text-slate-500 block">Recarregado</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatCurrency(cargaVRVA)}</span>
                      </div>
                      <div className="p-3 bg-pink-100/10 dark:bg-slate-900/50 rounded-xl border border-pink-200/20 dark:border-slate-800/20">
                        <span className="text-[10px] text-slate-500 block">Gasto Realizado</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatCurrency(gastoVRVA)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs gap-2">
                  {transactions.some(t =>
                    t.categoria === 'Vale Alimentação/Refeição' &&
                    t.tipo === 'Receita' &&
                    t.data_referencia.substring(0, 7) === selectedMonth
                  ) ? (
                    <>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Recarregado
                      </span>
                      <button
                        onClick={() => handleVRVARevert(selectedMonth)}
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-900/30 active:scale-95"
                        title="Reverter a recarga deste mês"
                      >
                        Reverter Recarga
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Pendente de recarga:</span>
                      <button
                        onClick={() => handleVRVARecharge(selectedMonth)}
                        className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-bold transition-all shadow-xs shadow-pink-200 cursor-pointer flex items-center gap-1 active:scale-95"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Recarregar R$ 1.004
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* --- Seção de Transações Recentes --- */}
            <div className="glass-panel p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Últimos Lançamentos</h3>
                  <p className="text-xs text-slate-500">Transações efetuadas para a referência {selectedMonth}</p>
                </div>

                <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Tabela Responsiva */}
              <div className="overflow-x-auto rounded-xl border border-pink-200 dark:border-amber-500/20">
                <table className="w-full min-w-[800px] text-left border-collapse table-fixed">
                  <thead>
                    <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold text-xs border-b border-pink-200 dark:border-amber-500/20">
                      <th className="px-2 py-3 w-[12%]">Data</th>
                      <th className="px-2 py-3 w-[32%]">Categoria / Descrição</th>
                      <th className="px-2 py-3 w-[14%]">Quem Pagou</th>
                      <th className="px-2 py-3 w-[13%]">Valor</th>
                      <th className="px-2 py-3 w-[13%]">Status</th>
                      <th className="px-2 py-3 w-[16%] text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40 text-xs">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-pink-200/20 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-2 py-2.5 text-slate-500 dark:text-slate-400 truncate" title={formatDate(tx.data_referencia)}>
                            {formatDate(tx.data_referencia)}
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xl p-1 bg-pink-200/50 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                {getCategoryIcon(tx.categoria)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className={`font-semibold block truncate ${tx.tipo === 'Receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} title={tx.categoria}>{tx.categoria}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate" title={tx.subcategoria}>{tx.subcategoria}</span>
                              </div>
                            </div>
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
                                  handleToggleCCGroupStatus(selectedMonth, tx.status)
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
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90 cursor-pointer"
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
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90"
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
                        <td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                          Nenhuma transação encontrada com os filtros selecionados neste mês.
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




