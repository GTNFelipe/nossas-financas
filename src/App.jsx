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
import { supabase, isSupabaseConfigured } from './supabaseClient'
import { initialTransactions, initialPoupanca } from './mockData'

export default function App() {
  // --- Estados do Aplicativo ---
  const [transactions, setTransactions] = useState([])
  const [poupancas, setPoupancas] = useState([])
  const [isPoupancaModalOpen, setIsPoupancaModalOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'lancamentos'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransactionId, setEditingTransactionId] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [dbStatus, setDbStatus] = useState('local') // 'local' | 'supabase_connected' | 'supabase_error'
  const [categoryChartType, setCategoryChartType] = useState('Despesa') // 'Despesa' | 'Receita'

  // --- Estados de Filtro ---
  const getTodayMonthStr = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }
  const [selectedMonth, setSelectedMonth] = useState(getTodayMonthStr)
  const [filterPerson, setFilterPerson] = useState('Todos')
  const [filterType, setFilterType] = useState('Todos')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [isFormCategoriaDropdownOpen, setIsFormCategoriaDropdownOpen] = useState(false)
  const [isFormQuemPagouDropdownOpen, setIsFormQuemPagouDropdownOpen] = useState(false)
  const [isFormRecorrenciaDropdownOpen, setIsFormRecorrenciaDropdownOpen] = useState(false)
  const [isFormTransferDeDropdownOpen, setIsFormTransferDeDropdownOpen] = useState(false)

  // --- Estados do Formulário de Lançamento ---
  const [formValor, setFormValor] = useState('')
  const [formTipo, setFormTipo] = useState('Despesa') // 'Receita' | 'Despesa'
  const [formCategoria, setFormCategoria] = useState('Casa')
  const [formSubcategoria, setFormSubcategoria] = useState('')
  const [formQuemPagou, setFormQuemPagou] = useState('Felipe') // 'Felipe' | 'Thaís'
  const [formStatus, setFormStatus] = useState('Pago') // 'Pago' | 'Pendente'
  const [formRecorrencia, setFormRecorrencia] = useState(1) // Padrão 1x (Repetições/Parcelas)
  const [formDataReferencia, setFormDataReferencia] = useState(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })

  // --- Estados do Formulário de Poupança ---
  const [formPoupancaTotal, setFormPoupancaTotal] = useState('')
  const [formPoupancaMotivoNome, setFormPoupancaMotivoNome] = useState('')
  const [formPoupancaMotivoValor, setFormPoupancaMotivoValor] = useState('')
  const [editingPoupancaId, setEditingPoupancaId] = useState(null)

  // --- Estados do Formulário de Transferência ---
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [formTransferValor, setFormTransferValor] = useState('')
  const [formTransferDe, setFormTransferDe] = useState('Felipe')
  const [formTransferPara, setFormTransferPara] = useState('Thaís')
  const [formTransferDesc, setFormTransferDesc] = useState('')
  const [formTransferData, setFormTransferData] = useState(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })

  // --- Estados do Cartão de Crédito ---
  const [isCCModalOpen, setIsCCModalOpen] = useState(false)
  const [ccModalMonth, setCcModalMonth] = useState('')
  const [editingCCItemId, setEditingCCItemId] = useState(null)
  const [formCCDate, setFormCCDate] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  })
  const [formCCSubcategory, setFormCCSubcategory] = useState('')
  const [formCCValor, setFormCCValor] = useState('')
  const [formCCRecorrencia, setFormCCRecorrencia] = useState(1)

  const [editCCDate, setEditCCDate] = useState('')
  const [editCCSubcategory, setEditCCSubcategory] = useState('')
  const [editCCValor, setEditCCValor] = useState('')
  const [editCCStatus, setEditCCStatus] = useState('Pendente')
  const [editCCCategoria, setEditCCCategoria] = useState('Cartão de Crédito')
  const [editCCRecorrencia, setEditCCRecorrencia] = useState(1)
  const [editCCQuemPagou, setEditCCQuemPagou] = useState('Felipe')
  const [formCCQuemPagou, setFormCCQuemPagou] = useState('Felipe')
  const [editingCCGroupMonth, setEditingCCGroupMonth] = useState(null)

  // Categorias válidas fornecidas pelo usuário (em ordem alfabética)
  const categoriasValidas = [
    'Alimentação',
    'Cartão de Crédito',
    'Casa',
    'Despesas Pessoais',
    'Dízimo',
    'Educação',
    'Imprevistos',
    'Investimentos',
    'Lazer',
    'Renda Extra',
    'Salário',
    'Saúde',
    'Transferência',
    'Transporte',
    'Vale Alimentação/Refeição',
  ]

  useEffect(() => {
    // Aplicar tema no elemento root HTML
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isModalOpen) {
      setEditingTransactionId(null)
      setEditingCCGroupMonth(null)
    }
  }, [isModalOpen])

  // Função para verificar virada de mês e redefinir status de contas recorrentes pagas para pendente.
  // Nota: Esta lógica é complementada pelo Cron Job 'reset-recorrentes-mensal' no Supabase,
  // garantindo redundância e funcionamento tanto offline (local) quanto direto no servidor.
  const checkMonthTurn = async (loadedTxs, isSupabaseActive) => {
    const todayStr = getTodayMonthStr()
    const lastChecked = sessionStorage.getItem('financas_last_checked_month')

    if (lastChecked && lastChecked !== todayStr) {
      const recurrenceRegex = /\(\d+\/\d+\)/

      const txsToUpdate = loadedTxs.filter(t => {
        const isCurrentMonth = t.data_referencia.substring(0, 7) === todayStr
        const isRecurring = recurrenceRegex.test(t.subcategoria)
        const isPaid = t.status === 'Pago'
        return isCurrentMonth && isRecurring && isPaid
      })

      if (txsToUpdate.length > 0) {
        const updatedIds = new Set(txsToUpdate.map(t => t.id))

        // Atualizar estado
        setTransactions(prev => prev.map(t => {
          if (updatedIds.has(t.id)) {
            return { ...t, status: 'Pendente' }
          }
          return t
        }))

        // Atualizar Supabase se conectado
        if (isSupabaseActive && isSupabaseConfigured) {
          try {
            const idsArray = Array.from(updatedIds)
            const { error } = await supabase
              .from('transacoes')
              .update({ status: 'Pendente' })
              .in('id', idsArray)

            if (error) throw error
          } catch (err) {
            console.error("Erro ao atualizar status de recorrentes no Supabase:", err.message)
          }
        }
        alert(`${txsToUpdate.length} conta(s) recorrente(s) do novo mês foram redefinida(s) para Pendente automaticamente.`)
      }
    }

    sessionStorage.setItem('financas_last_checked_month', todayStr)
  }

  // Função para verificar e gerar a recarga mensal automática do Vale Alimentação/Refeição Flexível (R$ 1.004,00)
  const checkVRVARecharge = async (loadedTxs, isSupabaseActive) => {
    const currentMonth = getTodayMonthStr() // "YYYY-MM"
    const hasRecharge = loadedTxs.some(t =>
      t.categoria === 'Vale Alimentação/Refeição' &&
      t.tipo === 'Receita' &&
      t.data_referencia.substring(0, 7) === currentMonth
    )

    if (!hasRecharge) {
      const newRecharge = {
        id: 'tx-vrva-recharge-' + Date.now(),
        criado_em: new Date().toISOString(),
        data_referencia: `${currentMonth}-01`,
        tipo: 'Receita',
        categoria: 'Vale Alimentação/Refeição',
        subcategoria: 'Recarga Mensal Automática',
        valor: 1004.00,
        quem_pagou: 'Felipe',
        status: 'Pago'
      }

      if (isSupabaseActive && isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('transacoes')
            .insert([newRecharge])
            .select()

          if (!error && data && data.length > 0) {
            setTransactions(prev => [data[0], ...prev])
            return [data[0], ...loadedTxs]
          }
        } catch (err) {
          console.error("Erro ao inserir recarga automatica no Supabase:", err.message)
        }
      }

      const updatedTxs = [newRecharge, ...loadedTxs]
      setTransactions(updatedTxs)
      return updatedTxs
    }

    return loadedTxs
  }

  // Sincronizar dados locais se o Supabase não estiver ativo
  const loadLocalData = async () => {
    const loadedTxs = initialTransactions
    const loadedPoupancas = initialPoupanca

    setTransactions(loadedTxs)
    setPoupancas(loadedPoupancas)

    const txsWithRecharge = await checkVRVARecharge(loadedTxs, false)
    checkMonthTurn(txsWithRecharge, false)
  }

  async function loadData() {
    if (isSupabaseConfigured) {
      setIsSyncing(true)
      try {
        // --- 1. Busca e Atualização do Estado ---
        // Buscar transações
        const { data: txData, error: txError } = await supabase
          .from('transacoes')
          .select('*')
          .order('criado_em', { ascending: false })

        if (txError) throw txError

        setTransactions(txData || [])
        setDbStatus('supabase_connected')

        // Buscar poupanças com tratamento resiliente individual
        try {
          const { data: poupancaData, error: poupancaError } = await supabase
            .from('poupancas')
            .select('*')
          if (poupancaError) throw poupancaError
          setPoupancas(poupancaData || [])
        } catch (pPerr) {
          console.warn("Tabela 'poupancas' nao encontrada no Supabase. Carregando dados iniciais:", pPerr.message)
          setPoupancas(initialPoupanca)
        }
        const txsWithRecharge = await checkVRVARecharge(txData || [], true)
        checkMonthTurn(txsWithRecharge, true)
      } catch (err) {
        console.error("Falha ao sincronizar com o Supabase, ativando modo local:", err.message)
        setDbStatus('supabase_error')
        loadLocalData()
      } finally {
        setIsSyncing(false)
      }
    } else {
      setDbStatus('local')
      loadLocalData()
    }
  }

  // --- Função para Iniciar Edição de Transação ---
  const startEditTransaction = (tx) => {
    setEditingTransactionId(tx.id)
    setFormValor(Number(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    setFormTipo(tx.tipo)
    setFormCategoria(tx.categoria)
    setFormSubcategoria(tx.subcategoria)
    setFormQuemPagou(tx.quem_pagou)
    setFormStatus(tx.status)
    setFormDataReferencia(tx.data_referencia)
    setFormRecorrencia(1)
    setIsModalOpen(true)
  }

  // --- Função para Iniciar Duplicação (Cópia) de Transação ---
  const startDuplicateTransaction = (tx) => {
    setEditingTransactionId(null) // Novo lançamento
    setFormValor(Number(tx.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    setFormTipo(tx.tipo)
    setFormCategoria(tx.categoria)
    setFormSubcategoria(tx.subcategoria)
    if (tx.categoria === 'Cartão de Crédito') {
      setFormQuemPagou(tx.quem_pagou === 'Thaís' || tx.quem_pagou === 'Thais' ? 'Thaís' : 'Felipe')
      setFormStatus('Pendente')
    } else {
      setFormQuemPagou(tx.quem_pagou)
      setFormStatus(tx.status)
    }

    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setFormDataReferencia(`${yyyy}-${mm}-${dd}`)
    setFormRecorrencia(1)
    setIsModalOpen(true)
  }

  // Helper robusto para adicionar meses a uma data YYYY-MM-DD
  const addMonths = (dateStr, monthsToAdd) => {
    if (!dateStr) return dateStr
    const parts = dateStr.split('-')
    if (parts.length !== 3) return dateStr
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)

    // Cria data no dia 1 do mês de destino para evitar transbordamento automático
    const date = new Date(year, month - 1 + monthsToAdd, 1)

    // Obtém o número máximo de dias do mês de destino
    const maxDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const targetDay = Math.min(day, maxDay)
    date.setDate(targetDay)

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // --- Função para Adicionar ou Editar Transação ---
  const handleSaveTransaction = async (e) => {
    e.preventDefault()

    if (editingCCGroupMonth) {
      const cardItems = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === editingCCGroupMonth)
      if (cardItems.length > 0) {
        const ids = cardItems.map(item => item.id)
        const updateFields = {
          status: formStatus,
          quem_pagou: formQuemPagou
        }

        if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
          setIsSyncing(true)
          try {
            const { error } = await supabase
              .from('transacoes')
              .update(updateFields)
              .in('id', ids)

            if (error) throw error
          } catch (err) {
            console.error("Erro ao salvar fatura consolidada no Supabase:", err.message)
            alert("Erro no Supabase: " + err.message)
            setIsSyncing(false)
            return
          } finally {
            setIsSyncing(false)
          }
        }

        setTransactions(prev => prev.map(t => ids.includes(t.id) ? { ...t, ...updateFields } : t))
      }
      setEditingCCGroupMonth(null)
      setIsModalOpen(false)
      return
    }

    const valorNum = parseBRL(formValor)
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, digite um valor válido maior que zero.")
      return
    }

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    const subcategoriaCapitalized = capitalizeWords(formSubcategoria.trim()) || 'Outros'
    const dbQuemPagou = formQuemPagou

    if (editingTransactionId) {
      // Modo Edição com suporte a recorrência
      const numRecorrencias = parseInt(formRecorrencia, 10) || 1
      const firstSubcat = numRecorrencias > 1
        ? `${subcategoriaCapitalized} (1/${numRecorrencias})`
        : subcategoriaCapitalized

      const mainTxData = {
        data_referencia: formDataReferencia,
        tipo: formTipo,
        categoria: formCategoria,
        subcategoria: firstSubcat,
        valor: valorNum,
        quem_pagou: dbQuemPagou,
        status: formStatus
      }

      const extraTxsToInsert = []
      for (let i = 1; i < numRecorrencias; i++) {
        const dateRef = addMonths(formDataReferencia, i)
        const subcat = `${subcategoriaCapitalized} (${i + 1}/${numRecorrencias})`
        extraTxsToInsert.push({
          criado_em: new Date().toISOString(),
          data_referencia: dateRef,
          tipo: formTipo,
          categoria: formCategoria,
          subcategoria: subcat,
          valor: valorNum,
          quem_pagou: dbQuemPagou,
          status: formStatus
        })
      }

      setIsSyncing(true)
      try {
        const { data: updateData, error: updateError } = await supabase
          .from('transacoes')
          .update(mainTxData)
          .eq('id', editingTransactionId)
          .select()

        if (updateError) throw updateError

        let insertedData = []
        if (extraTxsToInsert.length > 0) {
          const { data: insData, error: insError } = await supabase
            .from('transacoes')
            .insert(extraTxsToInsert)
            .select()
          if (insError) throw insError
          insertedData = insData || []
        }

        if (updateData && updateData.length > 0) {
          const updatedTx = updateData[0];

          // Sync Dízimo in Supabase
          const isRendaExtra = updatedTx.categoria === 'Renda Extra' && updatedTx.tipo === 'Receita';
          const refString = `[Ref: ${editingTransactionId}]`;
          const existingDizimo = transactions.find(t => t.categoria === 'Dízimo' && t.tipo === 'Despesa' && t.subcategoria.includes(refString));

          let finalDizimo = null;
          if (isRendaExtra) {
            const targetDizimo = {
              data_referencia: updatedTx.data_referencia,
              tipo: 'Despesa',
              categoria: 'Dízimo',
              subcategoria: `Dízimo 10% - Renda Extra (${formatDate(updatedTx.data_referencia)}) ${refString}`,
              valor: updatedTx.valor * 0.1,
              quem_pagou: updatedTx.quem_pagou,
              status: updatedTx.status
            };

            if (existingDizimo) {
              const { data: dizimoData } = await supabase
                .from('transacoes')
                .update(targetDizimo)
                .eq('id', existingDizimo.id)
                .select();
              if (dizimoData && dizimoData.length > 0) {
                finalDizimo = dizimoData[0];
              }
            } else {
              const { data: dizimoData } = await supabase
                .from('transacoes')
                .insert([{ ...targetDizimo, criado_em: new Date().toISOString() }])
                .select();
              if (dizimoData && dizimoData.length > 0) {
                finalDizimo = dizimoData[0];
              }
            }
          } else {
            if (existingDizimo) {
              await supabase.from('transacoes').delete().eq('id', existingDizimo.id);
            }
          }

          setTransactions(prev => {
            let updatedList = prev.map(t => t.id === editingTransactionId ? updatedTx : t);
            if (existingDizimo) {
              if (isRendaExtra && finalDizimo) {
                updatedList = updatedList.map(t => t.id === existingDizimo.id ? finalDizimo : t);
              } else if (!isRendaExtra) {
                updatedList = updatedList.filter(t => t.id !== existingDizimo.id);
              }
            } else if (isRendaExtra && finalDizimo) {
              updatedList = [finalDizimo, ...updatedList];
            }
            return [...insertedData, ...updatedList];
          });
        } else {
          loadData()
        }
      } catch (err) {
        console.error("Erro ao atualizar no Supabase:", err.message)
        alert("Erro no Supabase: " + err.message)
      } finally {
        setIsSyncing(false)
      }
    } else {
      // Modo Criação com recorrência
      const numRecorrencias = parseInt(formRecorrencia, 10) || 1
      const txsToInsert = []

      for (let i = 0; i < numRecorrencias; i++) {
        const dateRef = addMonths(formDataReferencia, i)
        const subcat = numRecorrencias > 1
          ? `${subcategoriaCapitalized} (${i + 1}/${numRecorrencias})`
          : subcategoriaCapitalized

        txsToInsert.push({
          criado_em: new Date().toISOString(),
          data_referencia: dateRef,
          tipo: formTipo,
          categoria: formCategoria,
          subcategoria: subcat,
          valor: valorNum,
          quem_pagou: dbQuemPagou,
          status: formCategoria === 'Cartão de Crédito' ? 'Pendente' : formStatus
        })
      }

      setIsSyncing(true)
      try {
        const { data, error } = await supabase
          .from('transacoes')
          .insert(txsToInsert)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          // Generate dizimo for Supabase
          const dizimoTxs = data
            .filter(t => t.categoria === 'Renda Extra' && t.tipo === 'Receita')
            .map(t => ({
              criado_em: new Date().toISOString(),
              data_referencia: t.data_referencia,
              tipo: 'Despesa',
              categoria: 'Dízimo',
              subcategoria: `Dízimo 10% - Renda Extra (${formatDate(t.data_referencia)}) [Ref: ${t.id}]`,
              valor: t.valor * 0.1,
              quem_pagou: t.quem_pagou,
              status: t.status
            }))

          if (dizimoTxs.length > 0) {
            const { data: dizimoData, error: dizimoError } = await supabase
              .from('transacoes')
              .insert(dizimoTxs)
              .select()
            if (!dizimoError && dizimoData) {
              setTransactions(prev => [...dizimoData, ...data, ...prev])
            } else {
              setTransactions(prev => [...data, ...prev])
            }
          } else {
            setTransactions(prev => [...data, ...prev])
          }
        } else {
          loadData()
        }
      } catch (err) {
        console.error("Erro ao salvar no Supabase:", err.message)
        alert("Erro no Supabase: " + err.message)
      } finally {
        setIsSyncing(false)
      }
    }

    // Resetar Formulário
    setEditingTransactionId(null)
    setFormValor('')
    setFormSubcategoria('')
    setFormRecorrencia(1)
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    setFormDataReferencia(`${yyyy}-${mm}-${dd}`)
    setIsModalOpen(false)
  }

  // --- Função para Deletar Transação ---
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta transação?")) return

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Delete linked dízimo in Supabase
      const refString = `[Ref: ${id}]`
      const linkedDizimo = transactions.find(t => t.categoria === 'Dízimo' && t.tipo === 'Despesa' && t.subcategoria.includes(refString))
      if (linkedDizimo) {
        await supabase.from('transacoes').delete().eq('id', linkedDizimo.id)
      }

      setTransactions(prev => prev.filter(t => t.id !== id && (!linkedDizimo || t.id !== linkedDizimo.id)))
    } catch (err) {
      console.error("Erro ao excluir do Supabase:", err.message)
      alert("Erro ao excluir do Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleOpenCCModal = (month) => {
    setCcModalMonth(month)
    const today = new Date()
    const todayMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    if (todayMonthStr === month) {
      setFormCCDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
    } else {
      setFormCCDate(`${month}-01`)
    }
    setFormCCSubcategory('')
    setFormCCValor('')
    setFormCCRecorrencia(1)

    setEditingCCItemId(null)
    setIsCCModalOpen(true)
  }

  const handleToggleCCGroupStatus = async (month, currentStatus) => {
    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }
    const newStatus = currentStatus === 'Pago' ? 'Pendente' : 'Pago'
    const cardItems = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === month)
    if (cardItems.length === 0) return

    const ids = cardItems.map(item => item.id)
    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('transacoes')
        .update({ status: newStatus })
        .in('id', ids)

      if (error) throw error

      setTransactions(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error("Erro ao alternar status do cartão:", err.message)
      alert("Erro: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteCCGroup = async (month) => {
    const cardItems = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === month)
    if (cardItems.length === 0) return

    if (!window.confirm(`Deseja realmente excluir a fatura do cartão inteira (${cardItems.length} compras)?`)) return

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    const ids = cardItems.map(item => item.id)
    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('transacoes')
        .delete()
        .in('id', ids)

      if (error) throw error

      setTransactions(prev => prev.filter(t => !ids.includes(t.id)))
    } catch (err) {
      console.error("Erro ao excluir compras do cartão:", err.message)
      alert("Erro: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const startEditCCGroup = (month) => {
    setEditingCCGroupMonth(month)
    const cardItems = transactions.filter(t => t.categoria === 'Cartão de Crédito' && t.data_referencia.substring(0, 7) === month)
    const totalValor = cardItems.reduce((sum, t) => sum + t.valor, 0)
    const allPago = cardItems.every(t => t.status === 'Pago')

    // Determinar pagador da fatura consolidada
    const uniquePayers = [...new Set(cardItems.map(t => t.quem_pagou))]
    let currentPayer = 'Felipe / Thaís'
    if (uniquePayers.length === 1) {
      currentPayer = uniquePayers[0]
    }

    setEditingTransactionId(null)
    setFormValor(totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    setFormTipo('Despesa')
    setFormCategoria('Cartão de Crédito')
    setFormSubcategoria(`Fatura Consolidada (${cardItems.length} ${cardItems.length === 1 ? 'item' : 'itens'})`)
    setFormQuemPagou(currentPayer)
    setFormStatus(allPago ? 'Pago' : 'Pendente')
    setFormDataReferencia(`${month}-01`)
    setFormRecorrencia(1)
    setIsModalOpen(true)
  }

  const handleAddCCItem = async (e) => {
    e.preventDefault()
    const valorNum = parseBRL(formCCValor)
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, digite um valor válido maior que zero.")
      return
    }

    if (formCCDate.substring(0, 7) !== ccModalMonth) {
      alert(`A data selecionada deve pertencer ao mês da fatura (${formatCCModalMonthName(ccModalMonth)}).`)
      return
    }

    const subcategoriaCapitalized = capitalizeWords(formCCSubcategory.trim()) || 'Compra Cartão'

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    const numRecorrencias = parseInt(formCCRecorrencia, 10) || 1
    const txsToInsert = []

    for (let i = 0; i < numRecorrencias; i++) {
      const dateRef = addMonths(formCCDate, i)
      const subcat = numRecorrencias > 1
        ? `${subcategoriaCapitalized} (${i + 1}/${numRecorrencias})`
        : subcategoriaCapitalized

      txsToInsert.push({
        criado_em: new Date().toISOString(),
        data_referencia: dateRef,
        tipo: 'Despesa',
        categoria: 'Cartão de Crédito',
        subcategoria: subcat,
        valor: valorNum,
        quem_pagou: formCCQuemPagou,
        status: 'Pendente'
      })
    }

    setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert(txsToInsert)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTransactions(prev => [...data, ...prev])
      } else {
        loadData()
      }

      // Reset form fields
      setFormCCSubcategory('')
      setFormCCValor('')
      setFormCCRecorrencia(1)
      setFormCCQuemPagou('Felipe')

    } catch (err) {
      console.error("Erro ao adicionar item no cartão:", err.message)
      alert("Erro ao salvar no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const startEditCCItem = (item) => {
    setEditingCCItemId(item.id)
    setEditCCDate(item.data_referencia)
    setEditCCValor(Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    setEditCCStatus(item.status)
    setEditCCCategoria(item.categoria)
    setEditCCQuemPagou(item.quem_pagou === 'Thaís' || item.quem_pagou === 'Thais' ? 'Thaís' : 'Felipe')

    const match = item.subcategoria.match(/(.*?)\s*\((\d+)\/(\d+)\)/)
    if (match) {
      setEditCCSubcategory(match[1].trim())
      setEditCCRecorrencia(parseInt(match[3], 10))
    } else {
      setEditCCSubcategory(item.subcategoria)
      setEditCCRecorrencia(1)
    }
  }

  const handleSaveCCItemEdit = async (id) => {
    const item = transactions.find(t => t.id === id)
    if (!item) return

    const valorNum = parseBRL(editCCValor)
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, digite um valor válido maior que zero.")
      return
    }

    if (editCCCategoria === 'Cartão de Crédito' && editCCDate.substring(0, 7) !== ccModalMonth) {
      alert(`A data selecionada deve pertencer ao mês da fatura (${formatCCModalMonthName(ccModalMonth)}).`)
      return
    }

    const subcategoriaCapitalized = capitalizeWords(editCCSubcategory.trim()) || 'Compra Cartão'

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      // 1. Verificar se a transação tinha recorrência original e limpar futuras parcelas órfãs
      const originalMatch = item.subcategoria.match(/(.*?)\s*\((\d+)\/(\d+)\)/)
      let deletedSiblingIds = []

      if (originalMatch) {
        const cleanOrig = originalMatch[1].trim()
        const pattern = new RegExp("^" + escapeRegExp(cleanOrig) + "\\s*\\(\\d+/\\d+\\)$")

        const siblingTxs = transactions.filter(t =>
          t.categoria === 'Cartão de Crédito' &&
          t.id !== id &&
          t.data_referencia >= item.data_referencia &&
          pattern.test(t.subcategoria)
        )

        if (siblingTxs.length > 0) {
          deletedSiblingIds = siblingTxs.map(t => t.id)
          const { error: deleteError } = await supabase
            .from('transacoes')
            .delete()
            .in('id', deletedSiblingIds)

          if (deleteError) throw deleteError
        }
      }

      // 2. Gerar as novas futuras parcelas se editCCRecorrencia > 1
      const editCCRecorrenciaNum = parseInt(editCCRecorrencia, 10) || 1
      const finalSubcat = editCCRecorrenciaNum > 1
        ? `${subcategoriaCapitalized} (1/${editCCRecorrenciaNum})`
        : subcategoriaCapitalized

      const extraTxsToInsert = []
      for (let i = 1; i < editCCRecorrenciaNum; i++) {
        const dateRef = addMonths(editCCDate, i)
        const subcat = `${subcategoriaCapitalized} (${i + 1}/${editCCRecorrenciaNum})`
        extraTxsToInsert.push({
          criado_em: new Date().toISOString(),
          data_referencia: dateRef,
          tipo: 'Despesa',
          categoria: editCCCategoria,
          subcategoria: subcat,
          valor: valorNum,
          quem_pagou: editCCQuemPagou,
          status: editCCStatus
        })
      }

      // 3. Atualizar a transação principal
      const updatedFields = {
        data_referencia: editCCDate,
        subcategoria: finalSubcat,
        valor: valorNum,
        status: editCCStatus,
        categoria: editCCCategoria,
        quem_pagou: editCCQuemPagou
      }

      const { data: updateData, error: updateError } = await supabase
        .from('transacoes')
        .update(updatedFields)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      let insertedData = []
      if (extraTxsToInsert.length > 0) {
        const { data: insData, error: insError } = await supabase
          .from('transacoes')
          .insert(extraTxsToInsert)
          .select()
        if (insError) throw insError
        insertedData = insData || []
      }

      if (updateData && updateData.length > 0) {
        setTransactions(prev => {
          let filtered = prev.filter(t => !deletedSiblingIds.includes(t.id))
          filtered = filtered.map(t => t.id === id ? updateData[0] : t)
          return [...insertedData, ...filtered]
        })
      } else {
        loadData()
      }

      setEditingCCItemId(null)
    } catch (err) {
      console.error("Erro ao editar item no cartão:", err.message)
      alert("Erro ao salvar no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleCCItemStatus = async (item) => {
    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }
    const newStatus = item.status === 'Pago' ? 'Pendente' : 'Pago'
    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('transacoes')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error

      setTransactions(prev => prev.map(t => t.id === item.id ? { ...t, status: newStatus } : t))
    } catch (err) {
      console.error("Erro ao alternar status do item de cartão:", err.message)
      alert("Erro ao atualizar status: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatCCModalMonthName = (monthStr) => {
    if (!monthStr) return ''
    const parts = monthStr.split('-')
    if (parts.length < 2) return monthStr
    const [year, month] = parts
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    const idx = parseInt(month, 10) - 1
    return idx >= 0 && idx < 12 ? `${months[idx]} de ${year}` : monthStr
  }

  // --- Função para Alternar Status da Transação (Pago/Pendente) ---
  const toggleTransactionStatus = async (tx) => {
    const newStatus = tx.status === 'Pago' ? 'Pendente' : 'Pago'

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('transacoes')
        .update({ status: newStatus })
        .eq('id', tx.id)

      if (error) throw error

      // Toggle linked dízimo status in Supabase
      const refString = `[Ref: ${tx.id}]`
      const linkedDizimo = transactions.find(t => t.categoria === 'Dízimo' && t.tipo === 'Despesa' && t.subcategoria.includes(refString))
      if (linkedDizimo) {
        await supabase
          .from('transacoes')
          .update({ status: newStatus })
          .eq('id', linkedDizimo.id)
      }

      setTransactions(prev => prev.map(t => {
        if (t.id === tx.id) return { ...t, status: newStatus };
        if (linkedDizimo && t.id === linkedDizimo.id) return { ...t, status: newStatus };
        return t;
      }))
    } catch (err) {
      console.error("Erro ao alternar status no Supabase:", err.message)
      alert("Erro ao alternar status no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // --- Funções do Sistema de Poupança (Dinheiro Guardado) ---
  const handleSavePoupancaTotal = async (e) => {
    e.preventDefault()
    const valorNum = parseBRL(formPoupancaTotal)
    if (isNaN(valorNum) || valorNum < 0) {
      alert("Por favor, digite um valor de poupança total válido.")
      return
    }

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      const existing = poupancas.find(p => p.motivo === 'Total')
      if (existing) {
        const { error } = await supabase
          .from('poupancas')
          .update({ valor: valorNum })
          .eq('motivo', 'Total')
        if (error) throw error
        setPoupancas(prev => prev.map(p => p.motivo === 'Total' ? { ...p, valor: valorNum } : p))
      } else {
        const { data, error } = await supabase
          .from('poupancas')
          .insert([{ motivo: 'Total', valor: valorNum }])
          .select()
        if (error) throw error
        if (data && data.length > 0) {
          setPoupancas(prev => [...prev, data[0]])
        } else {
          loadData()
        }
      }
      alert("Saldo total guardado atualizado com sucesso!")
    } catch (err) {
      console.warn("Erro ao atualizar poupança no Supabase:", err.message)
      alert("Erro no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSavePoupancaMotivo = async (e) => {
    e.preventDefault()
    const motivoNome = formPoupancaMotivoNome.trim()
    const valorNum = parseBRL(formPoupancaMotivoValor)
    if (!motivoNome) {
      alert("Por favor, digite um motivo para o dinheiro guardado.")
      return
    }
    if (motivoNome.toLowerCase() === 'total') {
      alert("O nome 'Total' é reservado para o saldo geral.")
      return
    }
    if (isNaN(valorNum) || valorNum < 0) {
      alert("Por favor, digite um valor de alocação válido.")
      return
    }

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      let existing = null
      if (editingPoupancaId) {
        existing = poupancas.find(p => p.id === editingPoupancaId)
      } else {
        existing = poupancas.find(p => p.motivo.toLowerCase() === motivoNome.toLowerCase())
      }

      if (existing) {
        const { error } = await supabase
          .from('poupancas')
          .update({ valor: valorNum, motivo: motivoNome })
          .eq('id', existing.id)
        if (error) throw error
        setPoupancas(prev => prev.map(p => p.id === existing.id ? { ...p, valor: valorNum, motivo: motivoNome } : p))
      } else {
        const { data, error } = await supabase
          .from('poupancas')
          .insert([{ motivo: motivoNome, valor: valorNum }])
          .select()
        if (error) throw error
        if (data && data.length > 0) {
          setPoupancas(prev => [...prev, data[0]])
        } else {
          loadData()
        }
      }
      alert(`Motivo "${motivoNome}" salvo com sucesso!`)
    } catch (err) {
      console.warn("Erro ao salvar motivo de poupança no Supabase:", err.message)
      alert("Erro no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
    setFormPoupancaMotivoNome('')
    setFormPoupancaMotivoValor('')
    setEditingPoupancaId(null)
  }

  const handleDeletePoupancaMotivo = async (p) => {
    if (!window.confirm(`Deseja realmente excluir a alocação para "${p.motivo}"?`)) return

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      const { error } = await supabase
        .from('poupancas')
        .delete()
        .eq('id', p.id)
      if (error) throw error
      setPoupancas(prev => prev.filter(item => item.id !== p.id))
      alert(`Alocação para "${p.motivo}" excluída com sucesso!`)
    } catch (err) {
      console.warn("Erro ao excluir do Supabase:", err.message)
      alert("Erro ao excluir do Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // --- Função para Adicionar Transferência entre Felipe e Thaís ---
  const handleSaveTransfer = async (e) => {
    e.preventDefault()
    const valorNum = parseBRL(formTransferValor)
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, digite um valor válido maior que zero.")
      return
    }

    if (!isSupabaseConfigured || dbStatus !== 'supabase_connected') {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    const de = formTransferDe
    const para = de === 'Felipe' ? 'Thaís' : 'Felipe'
    const desc = formTransferDesc.trim() ? `: ${formTransferDesc.trim()}` : ''

    const txDe = {
      criado_em: new Date().toISOString(),
      data_referencia: formTransferData,
      tipo: 'Despesa',
      categoria: 'Transferência',
      subcategoria: `Envio para ${para}${desc}`,
      valor: valorNum,
      quem_pagou: de,
      status: 'Pago'
    }

    const txPara = {
      criado_em: new Date().toISOString(),
      data_referencia: formTransferData,
      tipo: 'Receita',
      categoria: 'Transferência',
      subcategoria: `Recebido de ${de}${desc}`,
      valor: valorNum,
      quem_pagou: para,
      status: 'Pago'
    }

    const txsToInsert = [txDe, txPara]

    setIsSyncing(true)
    try {
      const { data, error } = await supabase
        .from('transacoes')
        .insert(txsToInsert)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setTransactions(prev => [...data, ...prev])
      } else {
        loadData()
      }
      alert(`Transferência de ${formatCurrency(valorNum)} realizada com sucesso!`)
    } catch (err) {
      console.error("Erro ao transferir no Supabase:", err.message)
      alert("Erro ao conectar com o Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }

    // Resetar campos
    setFormTransferValor('')
    setFormTransferDesc('')
    setIsTransferModalOpen(false)
  }


  // --- Cálculos de Poupança (Dinheiro Guardado) ---
  const totalGuardadoItem = poupancas.find(p => p.motivo === 'Total')
  const totalGuardado = totalGuardadoItem ? totalGuardadoItem.valor : 0
  const motivosPoupanca = poupancas.filter(p => p.motivo !== 'Total')
  const totalAlocado = motivosPoupanca.reduce((sum, p) => sum + p.valor, 0)
  const saldoLivre = Math.max(0, totalGuardado - totalAlocado)

  // --- Cálculos Financeiros ---
  const activeMonthTransactions = transactions.filter(t => t.data_referencia.substring(0, 7) === selectedMonth)
  const activeMonthCashTransactions = activeMonthTransactions.filter(t => t.categoria !== 'Vale Alimentação/Refeição' && t.categoria !== 'Transferência')

  // 1. Receita Total do Mês
  const totalReceita = activeMonthCashTransactions
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0)

  // Receitas detalhadas do mês
  const receitasPagas = activeMonthCashTransactions
    .filter(t => t.tipo === 'Receita' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.valor, 0)

  const receitasPendentes = activeMonthCashTransactions
    .filter(t => t.tipo === 'Receita' && t.status === 'Pendente')
    .reduce((sum, t) => sum + t.valor, 0)

  const receitasFelipe = activeMonthCashTransactions
    .filter(t => t.tipo === 'Receita' && t.quem_pagou === 'Felipe')
    .reduce((sum, t) => sum + t.valor, 0)

  const receitasThais = activeMonthCashTransactions
    .filter(t => t.tipo === 'Receita' && (t.quem_pagou === 'Thaís' || t.quem_pagou === 'Thais'))
    .reduce((sum, t) => sum + t.valor, 0)

  const totalReceitasProporcao = receitasFelipe + receitasThais
  const pctReceitaFelipe = totalReceitasProporcao > 0 ? (receitasFelipe / totalReceitasProporcao) * 100 : 50
  const showReceitaSplitBar = receitasFelipe > 0 && receitasThais > 0

  // 2. Despesa Total do Mês
  const totalDespesa = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0)

  // Despesas detalhadas do mês
  const despesasPagas = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa' && t.status === 'Pago')
    .reduce((sum, t) => sum + t.valor, 0)

  const despesasPendentes = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa' && t.status === 'Pendente')
    .reduce((sum, t) => sum + t.valor, 0)

  const despesasFelipe = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => {
      if (t.categoria === 'Cartão de Crédito') {
        return sum + (t.valor / 2)
      }
      if (t.quem_pagou === 'Felipe') {
        return sum + t.valor
      }
      return sum
    }, 0)

  const despesasThais = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => {
      if (t.categoria === 'Cartão de Crédito') {
        return sum + (t.valor / 2)
      }
      if (t.quem_pagou === 'Thaís' || t.quem_pagou === 'Thais') {
        return sum + t.valor
      }
      return sum
    }, 0)

  const totalDespesasProporcao = despesasFelipe + despesasThais
  const pctDespesaFelipe = totalDespesasProporcao > 0 ? (despesasFelipe / totalDespesasProporcao) * 100 : 50
  const showDespesaSplitBar = despesasFelipe > 0 && despesasThais > 0

  // Reserva de Emergência Inteligência
  const cleanMotivo = (name) => {
    if (!name) return ''
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
  }
  const reservaEmergenciaItem = motivosPoupanca.find(p => cleanMotivo(p.motivo) === 'reserva de emergencia')
  const valorAtualReserva = reservaEmergenciaItem ? reservaEmergenciaItem.valor : 0
  const metaReservaEmergencia = totalDespesa * 6
  const quantoFalta = Math.max(0, metaReservaEmergencia - valorAtualReserva)
  const porcentagemReserva = metaReservaEmergencia > 0 ? Math.min(100, (valorAtualReserva / metaReservaEmergencia) * 100) : 0

  // 3. Saldo do Mês
  const saldoLiquido = totalReceita - totalDespesa

  // --- Cálculo de Faturamento Diário Necessário (Dias Úteis / Feriados) ---
  const getHolidaysForYear = (year) => {
    const holidays = [
      `${year}-01-01`, // Confraternização Universal
      `${year}-01-20`, // São Sebastião (Rio de Janeiro)
      `${year}-01-25`, // Aniversário de São Paulo
      `${year}-04-21`, // Tiradentes
      `${year}-04-23`, // São Jorge (Rio de Janeiro)
      `${year}-05-01`, // Dia do Trabalho
      `${year}-07-09`, // Revolução Constitucionalista (São Paulo)
      `${year}-09-07`, // Independência
      `${year}-10-12`, // Nossa Senhora Aparecida
      `${year}-11-02`, // Finados
      `${year}-11-15`, // Proclamação da República
      `${year}-11-20`, // Consciência Negra
      `${year}-12-25`  // Natal
    ];

    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const easterMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
    const easter = new Date(year, easterMonth, easterDay);

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const sextaSanta = new Date(easter);
    sextaSanta.setDate(easter.getDate() - 2);
    holidays.push(formatDate(sextaSanta));

    const carnavalTerca = new Date(easter);
    carnavalTerca.setDate(easter.getDate() - 47);
    holidays.push(formatDate(carnavalTerca));

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    holidays.push(formatDate(corpusChristi));

    return holidays;
  };

  const getBusinessDaysInfo = (monthStr) => {
    if (!monthStr) return { total: 0, remaining: 0 };
    const parts = monthStr.split('-');
    if (parts.length !== 2) return { total: 0, remaining: 0 };
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const yearHolidays = getHolidaysForYear(year);

    let total = 0;
    let remaining = 0;

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(year, month, d);
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isHoliday = yearHolidays.includes(dateStr);

      if (!isWeekend && !isHoliday) {
        total++;
        if (year === todayYear && month === todayMonth) {
          if (d >= todayDate) {
            remaining++;
          }
        } else if (year > todayYear || (year === todayYear && month > todayMonth)) {
          remaining++;
        }
      }
    }

    return { total, remaining };
  };

  const { total: totalBusinessDays, remaining: remainingBusinessDays } = getBusinessDaysInfo(selectedMonth);
  const isMonthCurrent = () => {
    if (!selectedMonth) return false;
    const [y, m] = selectedMonth.split('-').map(Number);
    const today = new Date();
    return y === today.getFullYear() && m === (today.getMonth() + 1);
  };

  const deficitAmount = Math.max(0, totalDespesa - totalReceita);
  const dailyNeededTotal = totalBusinessDays > 0 ? deficitAmount / totalBusinessDays : 0;
  const dailyNeededRemaining = remainingBusinessDays > 0 ? deficitAmount / remainingBusinessDays : 0;

  // 4. Dinheiro em Conta (Saldo Pago Acumulado de Todo o Histórico)
  const dinheiroEmConta = transactions
    .filter(t => t.status === 'Pago' && t.categoria !== 'Vale Alimentação/Refeição')
    .reduce((sum, t) => {
      if (t.tipo === 'Receita') {
        return sum + t.valor
      } else {
        return sum - t.valor
      }
    }, 0)

  // Saldo em Carteira Individual
  const dinheiroEmContaFelipe = transactions
    .filter(t => t.status === 'Pago' && t.categoria !== 'Vale Alimentação/Refeição' && t.quem_pagou === 'Felipe')
    .reduce((sum, t) => {
      if (t.tipo === 'Receita') {
        return sum + t.valor
      } else {
        return sum - t.valor
      }
    }, 0)

  const dinheiroEmContaThais = transactions
    .filter(t => t.status === 'Pago' && t.categoria !== 'Vale Alimentação/Refeição' && (t.quem_pagou === 'Thaís' || t.quem_pagou === 'Thais'))
    .reduce((sum, t) => {
      if (t.tipo === 'Receita') {
        return sum + t.valor
      } else {
        return sum - t.valor
      }
    }, 0)

  const showSplitBar = dinheiroEmContaFelipe > 0 && dinheiroEmContaThais > 0
  const totalCarteiras = Math.abs(dinheiroEmContaFelipe) + Math.abs(dinheiroEmContaThais)
  const pctFelipe = totalCarteiras > 0 ? (Math.max(0, dinheiroEmContaFelipe) / totalCarteiras) * 100 : 50

  // 5. Cálculos de Disponibilidade de Saldo (Dinheiro Livre para Gastar)
  const totalDespesasPendentes = activeMonthCashTransactions
    .filter(t => t.tipo === 'Despesa' && t.status === 'Pendente')
    .reduce((sum, t) => sum + t.valor, 0)

  const dinheiroLivre = Math.max(0, dinheiroEmConta - totalDespesasPendentes)

  // --- Cálculos do Vale Alimentação/Refeição Flexível (VA/VR) ---
  const activeMonthVRVATxs = activeMonthTransactions.filter(t => t.categoria === 'Vale Alimentação/Refeição')
  const cargaVRVA = activeMonthVRVATxs
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0)
  const gastoVRVA = activeMonthVRVATxs
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0)
  const saldoRestanteVRVA = cargaVRVA - gastoVRVA
  const pctVRVA = cargaVRVA > 0 ? (gastoVRVA / cargaVRVA) * 100 : 0

  const getFreeMoneyData = () => {
    if (dinheiroEmConta >= totalDespesasPendentes) {
      return [
        { name: 'Livre para Gastar', value: dinheiroEmConta - totalDespesasPendentes, color: '#10b981' },
        { name: 'Comprometido (Pendente)', value: totalDespesasPendentes, color: '#f59e0b' }
      ].filter(d => d.value > 0)
    } else {
      return [
        { name: 'Saldo em Conta', value: dinheiroEmConta, color: '#f59e0b' },
        { name: 'Déficit (Falta no Saldo)', value: totalDespesasPendentes - dinheiroEmConta, color: '#ef4444' }
      ].filter(d => d.value > 0)
    }
  }

  const freeMoneyData = getFreeMoneyData()

  // Formatação de Data DD/MM/AAAA
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    if (parts.length === 2) {
      const [year, month] = parts;
      return `01/${month}/${year}`;
    }
    return dateStr;
  }

  // --- Filtragem de Transações para a Tabela com Cartão de Crédito Consolidado ---
  const activeMonthNonCCTxs = activeMonthTransactions.filter(t => t.categoria !== 'Cartão de Crédito')
  const ccTxs = activeMonthTransactions.filter(t => t.categoria === 'Cartão de Crédito')

  const groupedCCTx = (() => {
    if (ccTxs.length === 0) return null
    const totalValor = ccTxs.reduce((sum, t) => sum + t.valor, 0)
    const allPago = ccTxs.every(t => t.status === 'Pago')
    const createdDate = ccTxs.length > 0 ? ccTxs[ccTxs.length - 1].criado_em : `${selectedMonth}-01T00:00:00Z`

    // Determinar pagador da fatura consolidada
    const uniquePayers = [...new Set(ccTxs.map(t => t.quem_pagou))]
    let invoicePayer = 'Felipe / Thaís'
    if (uniquePayers.length === 1) {
      invoicePayer = uniquePayers[0]
    }

    return {
      id: `cc-${selectedMonth}`,
      criado_em: createdDate,
      data_referencia: `${selectedMonth}-01`,
      tipo: 'Despesa',
      categoria: 'Cartão de Crédito',
      subcategoria: `Fatura Consolidada (${ccTxs.length} ${ccTxs.length === 1 ? 'item' : 'itens'})`,
      valor: totalValor,
      quem_pagou: invoicePayer,
      status: allPago ? 'Pago' : 'Pendente',
      isGroupedCC: true
    }
  })()

  const activeMonthTransactionsWithGroupedCC = groupedCCTx
    ? [groupedCCTx, ...activeMonthNonCCTxs]
    : activeMonthNonCCTxs

  const filteredTransactions = activeMonthTransactionsWithGroupedCC.filter(t => {
    const matchPerson = filterPerson === 'Todos' || t.quem_pagou === filterPerson || (t.categoria === 'Cartão de Crédito' && (filterPerson === 'Felipe' || filterPerson === 'Thaís'))
    const matchType = filterType === 'Todos' || t.tipo === filterType
    const matchStatus = filterStatus === 'Todos' || t.status === filterStatus
    const matchCategory = filterCategory === 'Todas' || t.categoria === filterCategory
    return matchPerson && matchType && matchStatus && matchCategory
  })

  // Módulos de meses únicos para filtros
  const uniqueMonths = [...new Set([getTodayMonthStr(), ...transactions.map(t => t.data_referencia.substring(0, 7))])].sort((a, b) => b.localeCompare(a))

  // --- Formatação para o Gráfico Recharts ---
  const getChartData = () => {
    const monthsData = {}
    const [yearStr, monthStr] = selectedMonth.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)

    const monthsToShow = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(year, month - 1 - i, 1)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      monthsToShow.push(`${y}-${m}`)
    }

    monthsToShow.forEach(m => {
      monthsData[m] = { name: m, Receitas: 0, Despesas: 0 }
    })

    transactions.filter(t => t.categoria !== 'Vale Alimentação/Refeição' && t.categoria !== 'Transferência').forEach(t => {
      const m = t.data_referencia.substring(0, 7)
      if (monthsData[m]) {
        if (t.tipo === 'Receita') {
          monthsData[m].Receitas += t.valor
        } else {
          monthsData[m].Despesas += t.valor
        }
      }
    })

    return monthsToShow.map(m => monthsData[m])
  }

  const chartData = getChartData()

  // --- Formatação para o Gráfico de Categorias do Mês ---
  const getCategoryChartData = () => {
    const categoryMap = {}
    activeMonthCashTransactions.forEach(t => {
      const cat = t.categoria
      if (!categoryMap[cat]) {
        categoryMap[cat] = { name: cat, Receitas: 0, Despesas: 0 }
      }
      if (t.tipo === 'Receita') {
        categoryMap[cat].Receitas += t.valor
      } else if (t.tipo === 'Despesa') {
        categoryMap[cat].Despesas += t.valor
      }
    })
    // Retorna apenas categorias que tiveram movimento no mês atual
    return Object.values(categoryMap).filter(item => item.Receitas > 0 || item.Despesas > 0)
  }

  const categoryChartData = getCategoryChartData()

  // Formata os dados para o gráfico de pizza dependendo do tipo selecionado (Receita / Despesa)
  const getCategoryPieData = () => {
    return categoryChartData
      .filter(c => categoryChartType === 'Receita' ? c.Receitas > 0 : c.Despesas > 0)
      .map(c => ({
        name: c.name,
        value: categoryChartType === 'Receita' ? c.Receitas : c.Despesas
      }))
  }

  const categoryPieData = getCategoryPieData()

  const PIE_COLORS = [
    '#ec4899', // Rosa
    '#f59e0b', // Âmbar
    '#10b981', // Esmeralda
    '#3b82f6', // Azul
    '#8b5cf6', // Roxo
    '#f43f5e', // Rose
    '#06b6d4', // Ciano
    '#14b8a6', // Teal
    '#6366f1', // Indigo
    '#f97316'  // Laranja
  ]

  // Função para capitalizar a primeira letra de cada palavra e manter o resto em minúsculo
  const capitalizeWords = (str) => {
    if (!str) return ''
    return str
      .split(' ')
      .map(word => {
        if (word.length === 0) return ''
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ')
  }

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // Função para converter strings formatadas em pt-BR (ex: "1.234,56" ou "1234,56") para número (float)
  const parseBRL = (valueString) => {
    if (valueString === null || valueString === undefined) return 0;
    if (typeof valueString === 'number') return valueString;
    // Remove pontos de milhares e converte vírgula decimal para ponto
    const limpo = valueString.toString().replace(/\./g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
  }

  // Formatação de Dinheiro em R$
  const formatCurrency = (val) => {
    const num = typeof val === 'string' ? parseFloat(val) || 0 : val;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num || 0)
  }

  // Mapear ícones das categorias
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Casa': return '🏠';
      case 'Saúde': return '🩺';
      case 'Dízimo': return '🙏';
      case 'Transporte': return '🚗';
      case 'Despesas Pessoais': return '👤';
      case 'Lazer': return '🍿';
      case 'Investimentos': return '📈';
      case 'Alimentação': return '🍲';
      case 'Educação': return '📚';
      case 'Imprevistos': return '⚠️';
      case 'Salário': return '💵';
      case 'Renda Extra': return '💸';
      case 'Vale Alimentação/Refeição': return '🍔';
      case 'Transferência': return '🔄';
      case 'Cartão de Crédito': return '💳';
      default: return '💰';
    }
  }

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
                    <h3 className={`text-2xl font-bold mt-2 ${saldoLiquido >= 0
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

              {/* Painel de Dinheiro Guardado em Evidência */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Dinheiro Guardado</h3>
                    <button
                      onClick={() => {
                        setFormPoupancaTotal(totalGuardado > 0 ? Number(totalGuardado).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '')
                        setIsPoupancaModalOpen(true)
                      }}
                      className="p-2.5 bg-pink-100 hover:bg-pink-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-pink-600 dark:text-amber-400 shadow-inner transition-colors"
                      title="Gerenciar Dinheiro Guardado"
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

                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Recarga automática:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">Todo dia 01</span>
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
                        className="flex items-center justify-between gap-2.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-1.5 px-3 font-semibold text-xs text-pink-900 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all text-left"
                      >
                        <span>
                          {filterCategory === 'Todas' ? '🔍 Todas' : `${getCategoryIcon(filterCategory)} ${filterCategory}`}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
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
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
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

                {/* Filtro de pessoas & tipos */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Categoria */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500">Cat:</span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="flex items-center justify-between gap-2.5 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-1.5 px-3 font-semibold text-xs text-pink-900 dark:text-slate-200 outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all text-left"
                      >
                        <span>
                          {filterCategory === 'Todas' ? '🔍 Todas' : `${getCategoryIcon(filterCategory)} ${filterCategory}`}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
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

      </main>

      {/* --- FORMULÁRIO DE LANÇAMENTO RÁPIDO: MODAL FLUTUANTE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-600 dark:from-slate-900 dark:to-slate-950 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{editingCCGroupMonth ? 'Editar Fatura Consolidada' : editingTransactionId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                <p className="text-xs text-pink-100/90">{editingCCGroupMonth ? 'Ajuste quem pagou ou o status da fatura' : editingTransactionId ? 'Altere as informações do registro' : 'Lance receitas ou despesas rapidamente'}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">

              {/* Valor e Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 bg-pink-200/50 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={!!editingCCGroupMonth}
                      onClick={() => setFormTipo('Despesa')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formTipo === 'Despesa'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-pink-800 dark:text-slate-400 hover:text-slate-700'
                        } ${editingCCGroupMonth ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      disabled={!!editingCCGroupMonth}
                      onClick={() => setFormTipo('Receita')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formTipo === 'Receita'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-pink-800 dark:text-slate-400 hover:text-slate-700'
                        } ${editingCCGroupMonth ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      Receita
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCCGroupMonth}
                    readOnly={!!editingCCGroupMonth}
                    value={formValor}
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/\D/g, '');
                      if (!cleanDigits) {
                        setFormValor('');
                        return;
                      }
                      const cents = parseInt(cleanDigits, 10);
                      if (cents === 0) {
                        setFormValor('');
                        return;
                      }
                      const formatted = (cents / 100).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      });
                      setFormValor(formatted);
                    }}
                    placeholder="0,00"
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:ring-2 transition-all ${editingCCGroupMonth
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-pink-50 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-900 dark:text-white focus:border-pink-500 dark:focus:border-amber-500 focus:ring-pink-500/20 dark:focus:ring-amber-500/20'
                      }`}
                  />
                </div>
              </div>

              {/* Categorias e Subcategoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Categoria</label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={!!editingCCGroupMonth}
                      onClick={() => setIsFormCategoriaDropdownOpen(!isFormCategoriaDropdownOpen)}
                      className={`flex items-center justify-between gap-2.5 w-full border rounded-xl py-2.5 px-3 text-sm font-semibold outline-none transition-all text-left ${editingCCGroupMonth
                          ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-pink-50 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-900 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span>
                        {getCategoryIcon(formCategoria)} {formCategoria}
                      </span>
                      {!editingCCGroupMonth && (
                        <ChevronDown className={`h-4.5 w-4.5 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isFormCategoriaDropdownOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {isFormCategoriaDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFormCategoriaDropdownOpen(false)}
                        />
                        <div className="absolute left-0 mt-2 w-full bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                          {categoriasValidas.filter(c => c !== 'Transferência').map(c => {
                            const isSelected = c === formCategoria
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setFormCategoria(c)
                                  if (c === 'Cartão de Crédito') {
                                    if (!editingTransactionId) {
                                      setFormStatus('Pendente')
                                    }
                                  }
                                  if (formQuemPagou === 'Felipe / Thaís') {
                                    setFormQuemPagou('Felipe')
                                  }
                                  setIsFormCategoriaDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {getCategoryIcon(c)} {c}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Subcategoria / Detalhe</label>
                  <input
                    type="text"
                    disabled={!!editingCCGroupMonth}
                    readOnly={!!editingCCGroupMonth}
                    value={formSubcategoria}
                    onChange={(e) => setFormSubcategoria(capitalizeWords(e.target.value))}
                    placeholder="Ex: Cinema, Supermercado"
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 transition-all ${editingCCGroupMonth
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-pink-50 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-900 dark:text-white focus:border-pink-500 dark:focus:border-amber-500 focus:ring-pink-500/20 dark:focus:ring-amber-500/20'
                      }`}
                  />
                </div>
              </div>

              {/* Quem Pagou, Data Referência e Recorrência */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Quem Pagou / Recebeu</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFormQuemPagouDropdownOpen(!isFormQuemPagouDropdownOpen)}
                      className="flex items-center justify-between gap-2.5 w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-pink-900 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 rounded-xl py-2.5 px-3 text-sm font-semibold outline-none transition-all text-left"
                    >
                      <span>{formQuemPagou}</span>
                      <ChevronDown className={`h-4.5 w-4.5 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isFormQuemPagouDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFormQuemPagouDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFormQuemPagouDropdownOpen(false)}
                        />
                        <div className="absolute left-0 mt-2 w-full bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                          {(editingCCGroupMonth ? ['Felipe', 'Thaís', 'Felipe / Thaís'] : ['Felipe', 'Thaís']).map(p => {
                            const isSelected = p === formQuemPagou
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setFormQuemPagou(p)
                                  setIsFormQuemPagouDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {p}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Data do Lançamento</label>
                  <input
                    type="date"
                    required
                    disabled={!!editingCCGroupMonth}
                    readOnly={!!editingCCGroupMonth}
                    value={formDataReferencia}
                    onChange={(e) => setFormDataReferencia(e.target.value)}
                    className={`w-full border rounded-xl py-2.5 px-3 text-sm outline-none focus:ring-2 transition-all ${editingCCGroupMonth
                        ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                        : 'bg-pink-50 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-900 dark:text-slate-200 focus:border-pink-500 dark:focus:border-amber-500 focus:ring-pink-500/20 dark:focus:ring-amber-500/20'
                      }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Recorrência</label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={!!editingCCGroupMonth}
                      onClick={() => setIsFormRecorrenciaDropdownOpen(!isFormRecorrenciaDropdownOpen)}
                      className={`flex items-center justify-between gap-2.5 w-full border rounded-xl py-2.5 px-3 text-sm font-bold outline-none transition-all text-left ${editingCCGroupMonth
                          ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-pink-50 dark:bg-slate-800 border-pink-200 dark:border-slate-700 text-pink-900 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800'
                        }`}
                    >
                      <span>
                        {formRecorrencia === 1 ? '1x (Única)' : formRecorrencia === 12 ? '12x (Recorrência Anual)' : `${formRecorrencia}x`}
                      </span>
                      {!editingCCGroupMonth && (
                        <ChevronDown className={`h-4.5 w-4.5 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isFormRecorrenciaDropdownOpen ? 'rotate-180' : ''}`} />
                      )}
                    </button>

                    {isFormRecorrenciaDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFormRecorrenciaDropdownOpen(false)}
                        />
                        <div className="absolute left-0 mt-2 w-full bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(r => {
                            const isSelected = r === formRecorrencia
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => {
                                  setFormRecorrencia(r)
                                  setIsFormRecorrenciaDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-950 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {r === 1 ? '1x (Única)' : r === 12 ? '12x (Recorrência Anual)' : `${r}x`}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Status do Pagamento</label>
                <div className="grid grid-cols-2 gap-2 bg-pink-200/50 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    disabled={formCategoria === 'Cartão de Crédito' && !editingTransactionId}
                    onClick={() => setFormStatus('Pago')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formStatus === 'Pago'
                      ? 'bg-pink-50 dark:bg-slate-700 text-pink-900 dark:text-white shadow-md'
                      : 'text-pink-800 dark:text-slate-400 hover:text-pink-900'
                      } ${formCategoria === 'Cartão de Crédito' && !editingTransactionId
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'
                      }`}
                  >
                    Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Pendente')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formStatus === 'Pendente'
                      ? 'bg-pink-50 dark:bg-slate-700 text-pink-900 dark:text-white shadow-md'
                      : 'text-pink-800 dark:text-slate-400 hover:text-pink-900'
                      }`}
                  >
                    Pendente
                  </button>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 pt-4 border-t border-pink-200/60 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-amber-500 dark:to-amber-600 dark:text-slate-950"
                >
                  {editingTransactionId ? 'Salvar Alterações' : 'Salvar Lançamento'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE GERENCIAMENTO DE POUPANÇA (DINHEIRO GUARDADO) --- */}
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
                  <h3 className="font-bold text-base">Gerenciar Dinheiro Guardado</h3>
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

      {/* --- MODAL DE TRANSFERÊNCIA DE SALDO ENTRE CONTAS --- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-slate-900 dark:to-slate-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ArrowLeftRight className="h-5 w-5 text-pink-100 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Transferência entre Contas</h3>
                  <p className="text-[10px] text-pink-200/90 dark:text-slate-400">Ajuste o saldo do Felipe e da Thaís</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFormTransferValor('')
                  setFormTransferDesc('')
                  setIsTransferModalOpen(false)
                }}
                className="text-white/85 hover:text-white text-sm font-bold bg-white/15 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo do Formulário */}
            <form onSubmit={handleSaveTransfer} className="p-6 space-y-4">

              {/* De / Para */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">De (Origem)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsFormTransferDeDropdownOpen(!isFormTransferDeDropdownOpen)}
                      className="flex items-center justify-between gap-2.5 w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 font-semibold outline-none cursor-pointer focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 hover:bg-pink-100/50 dark:hover:bg-slate-800 transition-all text-left"
                    >
                      <span>{formTransferDe}</span>
                      <ChevronDown className={`h-4.5 w-4.5 text-pink-600 dark:text-amber-400 transition-transform duration-200 ${isFormTransferDeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isFormTransferDeDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setIsFormTransferDeDropdownOpen(false)}
                        />
                        <div className="absolute left-0 mt-2 w-full bg-pink-50/95 dark:bg-slate-900/95 backdrop-blur-md border border-pink-200 dark:border-amber-500/25 rounded-2xl shadow-xl py-1.5 z-30 max-h-60 overflow-y-auto animate-slide-up">
                          {['Felipe', 'Thaís'].map(p => {
                            const isSelected = p === formTransferDe
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  setFormTransferDe(p)
                                  setFormTransferPara(p === 'Felipe' ? 'Thaís' : 'Felipe')
                                  setIsFormTransferDeDropdownOpen(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${isSelected
                                  ? 'bg-pink-200/80 dark:bg-amber-500/25 text-pink-900 dark:text-amber-400 font-bold'
                                  : 'text-pink-900 dark:text-slate-200 hover:bg-pink-200/40 dark:hover:bg-slate-800'
                                  }`}
                              >
                                {p}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Para (Destino)</label>
                  <div className="w-full bg-pink-100/50 dark:bg-slate-800/40 border border-pink-200/50 dark:border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-500 dark:text-slate-400 font-bold select-none">
                    {formTransferPara}
                  </div>
                </div>
              </div>

              {/* Valor (R$) e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Valor (R$)</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-semibold text-xs">R$</span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formTransferValor}
                      onChange={(e) => {
                        const cleanDigits = e.target.value.replace(/\D/g, '');
                        if (!cleanDigits) {
                          setFormTransferValor('');
                          return;
                        }
                        const cents = parseInt(cleanDigits, 10);
                        if (cents === 0) {
                          setFormTransferValor('');
                          return;
                        }
                        const formatted = (cents / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        });
                        setFormTransferValor(formatted);
                      }}
                      placeholder="0,00"
                      className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-pink-900 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Data</label>
                  <input
                    type="date"
                    required
                    value={formTransferData}
                    onChange={(e) => setFormTransferData(e.target.value)}
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Descrição / Motivo */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Descrição (Opcional)</label>
                <input
                  type="text"
                  value={formTransferDesc}
                  onChange={(e) => setFormTransferDesc(capitalizeWords(e.target.value))}
                  placeholder="Ex: Reembolso, acerto..."
                  className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-pink-900 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                />
              </div>

              {/* Botões do Modal */}
              <div className="flex gap-3 pt-4 border-t border-pink-200/60 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setFormTransferValor('')
                    setFormTransferDesc('')
                    setIsTransferModalOpen(false)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-amber-500 dark:to-amber-600 dark:text-slate-950 font-bold flex items-center justify-center gap-1.5"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Confirmar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

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

    </div>
  )
}

