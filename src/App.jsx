/* eslint-disable no-unused-vars */
import { useFinanceContext } from './contexts/FinanceContext.jsx';
import { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Calendar,
  Check,
  Clock,
  Trash2,
  Edit,
  Copy,
  SlidersHorizontal,
  RefreshCw,
  Info,
  ChevronDown,
  CreditCard,
  ArrowLeftRight,
  X
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import TransactionModal from './components/TransactionModal';
import PoupancaModal from './components/PoupancaModal';
import TransferModal from './components/TransferModal';
import CCModal from './components/CCModal';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { initialTransactions, initialPoupanca } from './mockData'

export default function App() {
  const {
    transactions,
    setTransactions,
    poupancas,
    setPoupancas,
    isPoupancaModalOpen,
    setIsPoupancaModalOpen,
    theme,
    setTheme,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingTransactionId,
    setEditingTransactionId,
    isSyncing,
    setIsSyncing,
    dbStatus,
    setDbStatus,
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
    isFormCategoriaDropdownOpen,
    setIsFormCategoriaDropdownOpen,
    isFormQuemPagouDropdownOpen,
    setIsFormQuemPagouDropdownOpen,
    isFormRecorrenciaDropdownOpen,
    setIsFormRecorrenciaDropdownOpen,
    isFormTransferDeDropdownOpen,
    setIsFormTransferDeDropdownOpen,
    formValor,
    setFormValor,
    formTipo,
    setFormTipo,
    formCategoria,
    setFormCategoria,
    formSubcategoria,
    setFormSubcategoria,
    formQuemPagou,
    setFormQuemPagou,
    formStatus,
    setFormStatus,
    formRecorrencia,
    setFormRecorrencia,
    formDataReferencia,
    setFormDataReferencia,
    formPoupancaTotal,
    setFormPoupancaTotal,
    formPoupancaMotivoNome,
    setFormPoupancaMotivoNome,
    formPoupancaMotivoValor,
    setFormPoupancaMotivoValor,
    editingPoupancaId,
    setEditingPoupancaId,
    isTransferModalOpen,
    setIsTransferModalOpen,
    formTransferValor,
    setFormTransferValor,
    formTransferDe,
    setFormTransferDe,
    formTransferPara,
    setFormTransferPara,
    formTransferDesc,
    setFormTransferDesc,
    formTransferData,
    setFormTransferData,
    isCCModalOpen,
    setIsCCModalOpen,
    ccModalMonth,
    setCcModalMonth,
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
    editingCCGroupMonth,
    setEditingCCGroupMonth,
    categoriasValidas,
    checkMonthTurn,
    handleVRVARecharge,
    handleVRVARevert,
    loadLocalData,
    loadData,
    startEditTransaction,
    startDuplicateTransaction,
    addMonths,
    handleSaveTransaction,
    handleDeleteTransaction,
    handleOpenCCModal,
    handleToggleCCGroupStatus,
    handleDeleteCCGroup,
    startEditCCGroup,
    handleAddCCItem,
    startEditCCItem,
    handleSaveCCItemEdit,
    toggleCCItemStatus,
    formatCCModalMonthName,
    toggleTransactionStatus,
    handleSyncPoupancaFromTxs,
    handleSavePoupancaTotal,
    handleSavePoupancaMotivo,
    handleDeletePoupancaMotivo,
    handleSaveTransfer,
    totalGuardadoItem,
    totalGuardado,
    motivosPoupanca,
    totalAlocado,
    saldoLivre,
    activeMonthTransactions,
    activeMonthCashTransactions,
    totalReceita,
    receitasPagas,
    receitasPendentes,
    receitasFelipe,
    receitasThais,
    totalReceitasProporcao,
    pctReceitaFelipe,
    showReceitaSplitBar,
    totalDespesa,
    despesasPagas,
    despesasPendentes,
    despesasFelipe,
    despesasThais,
    totalDespesasProporcao,
    pctDespesaFelipe,
    showDespesaSplitBar,
    cleanMotivo,
    reservaEmergenciaItem,
    valorAtualReserva,
    metaReservaEmergencia,
    quantoFalta,
    porcentagemReserva,
    getHolidaysForYear,
    getBusinessDaysInfo,
    totalBusinessDays,
    remainingBusinessDays,
    isMonthCurrent,
    dinheiroEmConta,
    saldoLiquido,
    deficitAmount,
    dailyNeededTotal,
    dailyNeededRemaining,
    dinheiroEmContaFelipe,
    dinheiroEmContaThais,
    showSplitBar,
    totalCarteiras,
    pctFelipe,
    totalDespesasPendentes,
    dinheiroLivre,
    activeMonthVRVATxs,
    cargaVRVA,
    gastoVRVA,
    cumulativeCargaVRVA,
    cumulativeGastoVRVA,
    saldoRestanteVRVA,
    pctVRVA,
    getFreeMoneyData,
    freeMoneyData,
    formatDate,
    activeMonthNonCCTxs,
    ccTxs,
    groupedCCTx,
    activeMonthTransactionsWithGroupedCC,
    filteredTransactions,
    filteredReceitas,
    filteredDespesas,
    uniqueMonths,
    getChartData,
    chartData,
    getCategoryChartData,
    categoryChartData,
    getCategoryPieData,
    categoryPieData,
    PIE_COLORS,
    capitalizeWords,
    escapeRegExp,
    parseBRL,
    formatCurrency,
    getCategoryIcon
  } = useFinanceContext();

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      {/* --- Header / Navbar --- */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-pink-50/80 dark:bg-slate-900/80 border-b border-pink-200/60 dark:border-slate-800/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-pink-600 dark:bg-amber-500 p-2.5 rounded-xl text-white dark:text-slate-950 shadow-lg shadow-pink-500/20 dark:shadow-amber-500/10">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-900 via-pink-900 to-pink-900 dark:from-amber-300 dark:via-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
                Finanças dos Santanas
              </h1>
              <p className="text-xs text-pink-700/80 dark:text-slate-400 font-medium">Controle Compartilhado</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status do Supabase */}
            <div className="hidden sm:flex items-center">
              {dbStatus === 'supabase_connected' ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold border border-emerald-200/50 dark:border-emerald-900/30">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Supabase Ativo
                </span>
              ) : dbStatus === 'supabase_error' ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-full text-xs font-semibold border border-rose-200/50 dark:border-rose-900/30">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Erro Sinc. (Local)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold border border-amber-200/50 dark:border-amber-900/30" title="Altere o arquivo .env para conectar ao Supabase">
                  <Info className="h-3 w-3" />
                  Modo Local
                </span>
              )}
            </div>

            {/* Avatares Felipe / Thaís */}
            <div className="flex -space-x-2">
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold"
                title={`Espaço Felipe • Saldo: ${formatCurrency(dinheiroEmContaFelipe)}`}
              >
                F
              </span>
              <span
                className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-xs font-bold"
                title={`Espaço Thaís • Saldo: ${formatCurrency(dinheiroEmContaThais)}`}
              >
                T
              </span>
            </div>

            {/* Alternador de Tema */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2.5 rounded-xl bg-pink-200/60 hover:bg-pink-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-900 dark:text-slate-300 transition-colors"
              aria-label="Alternar Tema"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Botão de Sincronizar */}
            <button
              onClick={loadData}
              disabled={isSyncing}
              className="p-2.5 rounded-xl bg-pink-200/60 hover:bg-pink-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-900 dark:text-slate-300 transition-colors disabled:opacity-50"
              title="Sincronizar dados com o Supabase"
              aria-label="Sincronizar"
            >
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* --- Navegação Mobile/Desktop --- */}
      <nav className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex border-b border-pink-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-6 -mb-px transition-all ${activeTab === 'dashboard' ? 'tab-active' : 'tab-inactive'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('lancamentos')}
            className={`py-3 px-6 -mb-px transition-all ${activeTab === 'lancamentos' ? 'tab-active' : 'tab-inactive'
              }`}
          >
            Lançamentos
          </button>
        </div>
      </nav>

      {/* --- Conteúdo Principal --- */}
      <main className="max-w-6xl mx-auto px-4 mt-6">

        {/* Aviso de Syncing */}
        {isSyncing && (
          <div className="mb-4 flex items-center justify-center gap-2 p-2 bg-pink-100/50 dark:bg-amber-950/20 text-pink-800 dark:text-amber-400 rounded-xl text-sm border border-pink-200/50 dark:border-amber-500/20">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Sincronizando dados...
          </div>
        )}

        {/* --- Aba 1: Dashboard --- */}
        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'lancamentos' && <TransactionsList />}

      </main>

      <TransactionModal />
      <PoupancaModal />
      <TransferModal />
      <CCModal />

    </div>
  )
}


