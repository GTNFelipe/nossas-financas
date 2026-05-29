import React, { useState, useEffect } from 'react'
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
  User,
  Check,
  Clock,
  Trash2,
  Edit,
  SlidersHorizontal,
  RefreshCw,
  Info,
  ChevronRight,
  TrendingUp as ProfitIcon
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
import { initialTransactions, initialMetas, initialPoupanca } from './mockData'

export default function App() {
  // --- Estados do Aplicativo ---
  const [transactions, setTransactions] = useState([])
  const [metas, setMetas] = useState([])
  const [poupancas, setPoupancas] = useState([])
  const [isPoupancaModalOpen, setIsPoupancaModalOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('financas_theme')
    if (savedTheme) return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'lancamentos' | 'metas'
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

  // --- Estados do Formulário de Meta ---
  const [formMetaCategoria, setFormMetaCategoria] = useState('Casa')
  const [formMetaValor, setFormMetaValor] = useState('')
  const [formMetaDescricao, setFormMetaDescricao] = useState('')

  // --- Estados do Formulário de Poupança ---
  const [formPoupancaTotal, setFormPoupancaTotal] = useState('')
  const [formPoupancaMotivoNome, setFormPoupancaMotivoNome] = useState('')
  const [formPoupancaMotivoValor, setFormPoupancaMotivoValor] = useState('')
  const [editingPoupancaId, setEditingPoupancaId] = useState(null)

  // Categorias válidas fornecidas pelo usuário
  const categoriasValidas = [
    'Casa',
    'Saúde',
    'Dízimo',
    'Transporte',
    'Despesas Pessoais',
    'Lazer',
    'Investimentos',
    'Alimentação',
    'Educação',
    'Imprevistos'
  ]

  // --- Efeito para Carregar Dados e Aplicar Tema ---
  useEffect(() => {
    // Aplicar tema no elemento root HTML
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('financas_theme', theme)
  }, [theme])

  useEffect(() => {
    loadData()
  }, [])

  // Função para verificar virada de mês e redefinir status de contas recorrentes pagas para pendente.
  // Nota: Esta lógica é complementada pelo Cron Job 'reset-recorrentes-mensal' no Supabase,
  // garantindo redundância e funcionamento tanto offline (local) quanto direto no servidor.
  const checkMonthTurn = async (loadedTxs, isSupabaseActive) => {
    const todayStr = getTodayMonthStr()
    const lastChecked = localStorage.getItem('financas_last_checked_month')

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

        // Atualizar localStorage
        const savedTxsStr = localStorage.getItem('financas_transactions')
        if (savedTxsStr) {
          const localList = JSON.parse(savedTxsStr)
          const updatedLocal = localList.map(t => {
            if (updatedIds.has(t.id)) {
              return { ...t, status: 'Pendente' }
            }
            return t
          })
          localStorage.setItem('financas_transactions', JSON.stringify(updatedLocal))
        }

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

    localStorage.setItem('financas_last_checked_month', todayStr)
  }

  // Sincronizar dados locais se o Supabase não estiver ativo
  const loadLocalData = () => {
    const savedTxs = localStorage.getItem('financas_transactions')
    const savedMetas = localStorage.getItem('financas_metas')
    const savedPoupancas = localStorage.getItem('financas_poupanca')

    let loadedTxs = []
    let loadedMetas = []
    let loadedPoupancas = []

    if (savedTxs) {
      loadedTxs = JSON.parse(savedTxs)
    } else {
      loadedTxs = initialTransactions
      localStorage.setItem('financas_transactions', JSON.stringify(initialTransactions))
    }

    if (savedMetas) {
      loadedMetas = JSON.parse(savedMetas)
    } else {
      loadedMetas = initialMetas
      localStorage.setItem('financas_metas', JSON.stringify(initialMetas))
    }

    if (savedPoupancas) {
      loadedPoupancas = JSON.parse(savedPoupancas)
    } else {
      loadedPoupancas = initialPoupanca
      localStorage.setItem('financas_poupanca', JSON.stringify(initialPoupanca))
    }

    setTransactions(loadedTxs)
    setMetas(loadedMetas)
    setPoupancas(loadedPoupancas)
    checkMonthTurn(loadedTxs, false)
  }

  const loadData = async () => {
    if (isSupabaseConfigured) {
      setIsSyncing(true)
      try {
        // Buscar transações
        const { data: txData, error: txError } = await supabase
          .from('transacoes')
          .select('*')
          .order('criado_em', { ascending: false })

        if (txError) throw txError

        // Buscar metas
        const { data: metasData, error: metasError } = await supabase
          .from('metas')
          .select('*')

        if (metasError) throw metasError

        setTransactions(txData || [])
        setMetas(metasData || [])
        setDbStatus('supabase_connected')

        // Buscar poupanças com tratamento resiliente individual
        try {
          const { data: poupancaData, error: poupancaError } = await supabase
            .from('poupancas')
            .select('*')
          if (poupancaError) throw poupancaError
          setPoupancas(poupancaData || [])
        } catch (pPerr) {
          console.warn("Tabela 'poupancas' nao encontrada no Supabase. Carregando dados locais:", pPerr.message)
          const savedPoupancas = localStorage.getItem('financas_poupanca')
          if (savedPoupancas) {
            setPoupancas(JSON.parse(savedPoupancas))
          } else {
            setPoupancas(initialPoupanca)
            localStorage.setItem('financas_poupanca', JSON.stringify(initialPoupanca))
          }
        }
        checkMonthTurn(txData || [], true)
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
    setFormValor(tx.valor.toString().replace('.', ','))
    setFormTipo(tx.tipo)
    setFormCategoria(tx.categoria)
    setFormSubcategoria(tx.subcategoria)
    setFormQuemPagou(tx.quem_pagou)
    setFormStatus(tx.status)
    setFormDataReferencia(tx.data_referencia)
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
    const valorNum = parseBRL(formValor)
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, digite um valor válido maior que zero.")
      return
    }

    const txData = {
      data_referencia: formDataReferencia,
      tipo: formTipo,
      categoria: formCategoria,
      subcategoria: formSubcategoria.trim() || 'Outros',
      valor: valorNum,
      quem_pagou: formQuemPagou,
      status: formStatus
    }

    if (editingTransactionId) {
      // Modo Edição com suporte a recorrência
      const numRecorrencias = parseInt(formRecorrencia, 10) || 1
      const firstSubcat = numRecorrencias > 1
        ? `${formSubcategoria.trim() || 'Outros'} (1/${numRecorrencias})`
        : (formSubcategoria.trim() || 'Outros')

      const mainTxData = {
        data_referencia: formDataReferencia,
        tipo: formTipo,
        categoria: formCategoria,
        subcategoria: firstSubcat,
        valor: valorNum,
        quem_pagou: formQuemPagou,
        status: formStatus
      }

      const extraTxsToInsert = []
      for (let i = 1; i < numRecorrencias; i++) {
        const dateRef = addMonths(formDataReferencia, i)
        const subcat = `${formSubcategoria.trim() || 'Outros'} (${i + 1}/${numRecorrencias})`
        extraTxsToInsert.push({
          criado_em: new Date().toISOString(),
          data_referencia: dateRef,
          tipo: formTipo,
          categoria: formCategoria,
          subcategoria: subcat,
          valor: valorNum,
          quem_pagou: formQuemPagou,
          status: formStatus
        })
      }

      if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
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
            setTransactions(prev => {
              const updatedList = prev.map(t => t.id === editingTransactionId ? updateData[0] : t)
              return [...insertedData, ...updatedList]
            })
          } else {
            loadData()
          }
          alert("Lançamento atualizado com sucesso!")
        } catch (err) {
          console.error("Erro ao atualizar no Supabase, atualizando localmente:", err.message)
          alert("Erro no Supabase. Lançamento atualizado localmente.")
          const localTxs = extraTxsToInsert.map((tx, idx) => ({ ...tx, id: 'tx-' + (Date.now() + idx + 1) }))
          const updated = transactions.map(t => t.id === editingTransactionId ? { ...t, ...mainTxData } : t)
          const finalTxs = [...localTxs, ...updated]
          setTransactions(finalTxs)
          localStorage.setItem('financas_transactions', JSON.stringify(finalTxs))
        } finally {
          setIsSyncing(false)
        }
      } else {
        const localTxs = extraTxsToInsert.map((tx, idx) => ({ ...tx, id: 'tx-' + (Date.now() + idx + 1) }))
        const updated = transactions.map(t => t.id === editingTransactionId ? { ...t, ...mainTxData } : t)
        const finalTxs = [...localTxs, ...updated]
        setTransactions(finalTxs)
        localStorage.setItem('financas_transactions', JSON.stringify(finalTxs))
        alert("Lançamento atualizado localmente!")
      }
    } else {
      // Modo Criação com recorrência
      const numRecorrencias = parseInt(formRecorrencia, 10) || 1
      const txsToInsert = []

      for (let i = 0; i < numRecorrencias; i++) {
        const dateRef = addMonths(formDataReferencia, i)
        const subcat = numRecorrencias > 1
          ? `${formSubcategoria.trim() || 'Outros'} (${i + 1}/${numRecorrencias})`
          : (formSubcategoria.trim() || 'Outros')

        txsToInsert.push({
          criado_em: new Date().toISOString(),
          data_referencia: dateRef,
          tipo: formTipo,
          categoria: formCategoria,
          subcategoria: subcat,
          valor: valorNum,
          quem_pagou: formQuemPagou,
          status: formStatus
        })
      }

      if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
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
        } catch (err) {
          console.error("Erro ao salvar no Supabase, gravando localmente:", err.message)
          alert("Erro ao conectar com o Supabase. Lançamento(s) salvo(s) localmente no navegador.")
          saveTxsLocal(txsToInsert)
        } finally {
          setIsSyncing(false)
        }
      } else {
        saveTxsLocal(txsToInsert)
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

  const saveTxsLocal = (newTxs) => {
    const localTxs = newTxs.map((tx, idx) => ({ ...tx, id: 'tx-' + (Date.now() + idx) }))
    const updated = [...localTxs, ...transactions]
    setTransactions(updated)
    localStorage.setItem('financas_transactions', JSON.stringify(updated))
  }

  const updateTxLocal = (id, txData) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...txData } : t)
    setTransactions(updated)
    localStorage.setItem('financas_transactions', JSON.stringify(updated))
  }

  // --- Função para Deletar Transação ---
  const handleDeleteTransaction = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta transação?")) return

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
      setIsSyncing(true)
      try {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', id)

        if (error) throw error
        setTransactions(prev => prev.filter(t => t.id !== id))
      } catch (err) {
        console.error("Erro ao excluir do Supabase, excluindo localmente:", err.message)
        deleteTxLocal(id)
      } finally {
        setIsSyncing(false)
      }
    } else {
      deleteTxLocal(id)
    }
  }

  const deleteTxLocal = (id) => {
    const updated = transactions.filter(t => t.id !== id)
    setTransactions(updated)
    localStorage.setItem('financas_transactions', JSON.stringify(updated))
  }

  // --- Função para Alternar Status da Transação (Pago/Pendente) ---
  const toggleTransactionStatus = async (tx) => {
    const newStatus = tx.status === 'Pago' ? 'Pendente' : 'Pago'

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
      setIsSyncing(true)
      try {
        const { error } = await supabase
          .from('transacoes')
          .update({ status: newStatus })
          .eq('id', tx.id)

        if (error) throw error

        setTransactions(prev => prev.map(t => t.id === tx.id ? { ...t, status: newStatus } : t))
      } catch (err) {
        console.error("Erro ao alternar status no Supabase, alterando localmente:", err.message)
        toggleTxStatusLocal(tx.id, newStatus)
      } finally {
        setIsSyncing(false)
      }
    } else {
      toggleTxStatusLocal(tx.id, newStatus)
    }
  }

  const toggleTxStatusLocal = (id, newStatus) => {
    const updated = transactions.map(t => t.id === id ? { ...t, status: newStatus } : t)
    setTransactions(updated)
    localStorage.setItem('financas_transactions', JSON.stringify(updated))
  }

  // --- Funções do Sistema de Metas ---
  const handleSaveMeta = async (e) => {
    e.preventDefault()
    const valorMetaNum = parseBRL(formMetaValor)
    if (isNaN(valorMetaNum) || valorMetaNum < 0) {
      alert("Por favor, digite um valor de meta válido.")
      return
    }
    const descricaoTrimmed = formMetaDescricao.trim()

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
      setIsSyncing(true)
      try {
        const existing = metas.find(m => m.categoria === formMetaCategoria)
        if (existing) {
          const { error } = await supabase
            .from('metas')
            .update({ valor_meta: valorMetaNum, descricao: descricaoTrimmed })
            .eq('categoria', formMetaCategoria)

          if (error) throw error
          setMetas(prev => prev.map(m => m.categoria === formMetaCategoria ? { ...m, valor_meta: valorMetaNum, descricao: descricaoTrimmed } : m))
        } else {
          const { data, error } = await supabase
            .from('metas')
            .insert([{ categoria: formMetaCategoria, valor_meta: valorMetaNum, descricao: descricaoTrimmed }])
            .select()

          if (error) throw error
          if (data && data.length > 0) {
            setMetas(prev => [...prev, data[0]])
          } else {
            loadData()
          }
        }
        alert(`Meta para a categoria "${formMetaCategoria}" salva com sucesso!`)
      } catch (err) {
        console.error("Erro ao salvar meta no Supabase, salvando localmente:", err.message)
        alert("Erro no Supabase. Meta salva localmente.")
        saveMetaLocal(formMetaCategoria, valorMetaNum, descricaoTrimmed)
      } finally {
        setIsSyncing(false)
      }
    } else {
      saveMetaLocal(formMetaCategoria, valorMetaNum, descricaoTrimmed)
      alert(`Meta para a categoria "${formMetaCategoria}" salva localmente!`)
    }
    setFormMetaValor('')
    setFormMetaDescricao('')
  }

  const handleDeleteMeta = async (categoria) => {
    if (!window.confirm(`Deseja realmente excluir a meta da categoria "${categoria}"?`)) return

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
      setIsSyncing(true)
      try {
        const { error } = await supabase
          .from('metas')
          .delete()
          .eq('categoria', categoria)

        if (error) throw error
        setMetas(prev => prev.filter(m => m.categoria !== categoria))
        alert(`Meta da categoria "${categoria}" excluída com sucesso!`)
      } catch (err) {
        console.error("Erro ao excluir meta no Supabase, removendo localmente:", err.message)
        alert("Erro ao excluir no Supabase. Removendo localmente.")
        deleteMetaLocal(categoria)
      } finally {
        setIsSyncing(false)
      }
    } else {
      deleteMetaLocal(categoria)
      alert(`Meta da categoria "${categoria}" excluída localmente!`)
    }
  }

  const saveMetaLocal = (categoria, valorMeta, descricao) => {
    let updated
    const existing = metas.find(m => m.categoria === categoria)
    if (existing) {
      updated = metas.map(m => m.categoria === categoria ? { ...m, valor_meta: valorMeta, descricao } : m)
    } else {
      updated = [...metas, { id: 'meta-' + Date.now(), categoria, valor_meta: valorMeta, descricao }]
    }
    setMetas(updated)
    localStorage.setItem('financas_metas', JSON.stringify(updated))
  }

  const deleteMetaLocal = (categoria) => {
    const updated = metas.filter(m => m.categoria !== categoria)
    setMetas(updated)
    localStorage.setItem('financas_metas', JSON.stringify(updated))
  }

  // --- Funções do Sistema de Poupança (Dinheiro Guardado) ---
  const handleSavePoupancaTotal = async (e) => {
    e.preventDefault()
    const valorNum = parseBRL(formPoupancaTotal)
    if (isNaN(valorNum) || valorNum < 0) {
      alert("Por favor, digite um valor de poupança total válido.")
      return
    }

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
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
        console.warn("Erro ao atualizar poupança no Supabase, salvando localmente:", err.message)
        savePoupancaLocal('Total', valorNum)
        alert("Saldo total atualizado localmente.")
      } finally {
        setIsSyncing(false)
      }
    } else {
      savePoupancaLocal('Total', valorNum)
      alert("Saldo total atualizado localmente!")
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

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
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
        console.warn("Erro ao salvar motivo de poupança no Supabase, salvando localmente:", err.message)
        savePoupancaLocal(motivoNome, valorNum, editingPoupancaId)
        alert(`Motivo "${motivoNome}" salvo localmente.`)
      } finally {
        setIsSyncing(false)
      }
    } else {
      savePoupancaLocal(motivoNome, valorNum, editingPoupancaId)
      alert(`Motivo "${motivoNome}" salvo localmente!`)
    }
    setFormPoupancaMotivoNome('')
    setFormPoupancaMotivoValor('')
    setEditingPoupancaId(null)
  }

  const handleDeletePoupancaMotivo = async (p) => {
    if (!window.confirm(`Deseja realmente excluir a alocação para "${p.motivo}"?`)) return

    if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
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
        console.warn("Erro ao excluir do Supabase, excluindo localmente:", err.message)
        deletePoupancaLocal(p.id)
        alert(`Alocação para "${p.motivo}" excluída localmente.`)
      } finally {
        setIsSyncing(false)
      }
    } else {
      deletePoupancaLocal(p.id)
      alert(`Alocação para "${p.motivo}" excluída localmente!`)
    }
  }

  const savePoupancaLocal = (motivo, valor, id = null) => {
    let updated
    let existing = null
    if (id) {
      existing = poupancas.find(p => p.id === id)
    } else {
      existing = poupancas.find(p => p.motivo.toLowerCase() === motivo.toLowerCase())
    }

    if (existing) {
      updated = poupancas.map(p => p.id === existing.id ? { ...p, valor, motivo } : p)
    } else {
      updated = [...poupancas, { id: 'poup-' + Date.now(), motivo, valor }]
    }
    setPoupancas(updated)
    localStorage.setItem('financas_poupanca', JSON.stringify(updated))
  }

  const deletePoupancaLocal = (id) => {
    const updated = poupancas.filter(p => p.id !== id)
    setPoupancas(updated)
    localStorage.setItem('financas_poupanca', JSON.stringify(updated))
  }

  // --- Cálculos de Poupança (Dinheiro Guardado) ---
  const totalGuardadoItem = poupancas.find(p => p.motivo === 'Total')
  const totalGuardado = totalGuardadoItem ? totalGuardadoItem.valor : 0
  const motivosPoupanca = poupancas.filter(p => p.motivo !== 'Total')
  const totalAlocado = motivosPoupanca.reduce((sum, p) => sum + p.valor, 0)
  const saldoLivre = Math.max(0, totalGuardado - totalAlocado)

  // --- Cálculos Financeiros ---
  const activeMonthTransactions = transactions.filter(t => t.data_referencia.substring(0, 7) === selectedMonth)

  // 1. Receita Total do Mês
  const totalReceita = activeMonthTransactions
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0)

  // 2. Despesa Total do Mês
  const totalDespesa = activeMonthTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0)

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

  // 4. Dinheiro em Conta (Saldo Pago Acumulado de Todo o Histórico)
  const dinheiroEmConta = transactions
    .filter(t => t.status === 'Pago')
    .reduce((sum, t) => {
      if (t.tipo === 'Receita') {
        return sum + t.valor
      } else {
        return sum - t.valor
      }
    }, 0)

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

  // Determinar a cor da barra de progresso (Sunset/Warm: Rosas e Amarelos)
  const getProgressBarColor = (percentage) => {
    if (percentage < 70) return 'bg-pink-400'
    if (percentage < 100) return 'bg-amber-500'
    return 'bg-rose-600 animate-pulse'
  };

  const getProgressBgColor = (percentage) => {
    if (percentage < 70) return 'bg-pink-50/60 dark:bg-pink-950/20'
    if (percentage < 100) return 'bg-amber-50/60 dark:bg-amber-950/20'
    return 'bg-rose-100/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/30'
  };

  // --- Filtragem de Transações para a Tabela ---
  const filteredTransactions = activeMonthTransactions.filter(t => {
    const matchPerson = filterPerson === 'Todos' || t.quem_pagou === filterPerson
    const matchType = filterType === 'Todos' || t.tipo === filterType
    return matchPerson && matchType
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

    transactions.forEach(t => {
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
    activeMonthTransactions.forEach(t => {
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
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-pink-900 via-pink-955 to-pink-900 dark:from-amber-300 dark:via-amber-400 dark:to-amber-300 bg-clip-text text-transparent">
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
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold" title="Espaço Felipe">
                F
              </span>
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900 bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-xs font-bold" title="Espaço Thaís">
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
          <button
            onClick={() => setActiveTab('metas')}
            className={`py-3 px-6 -mb-px transition-all ${activeTab === 'metas' ? 'tab-active' : 'tab-inactive'
              }`}
          >
            Configurar Metas
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
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600 dark:text-amber-400" />
                  Mês de Referência
                </h2>
                <p className="text-xs text-slate-500">Exibindo estatísticas e lançamentos para o mês escolhido</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 sm:flex-initial bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-amber-500/20 rounded-xl py-2 px-4 font-semibold text-pink-900 dark:text-slate-200 outline-none focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20 focus:border-pink-500 dark:focus:border-amber-500"
                >
                  {uniqueMonths.length > 0 ? (
                    uniqueMonths.map(m => (
                      <option key={m} value={m}>{m.split('-')[1]}/{m.split('-')[0]}</option>
                    ))
                  ) : (
                    <option value="2026-05">05/2026</option>
                  )}
                </select>
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
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-500/10 px-2 py-1 rounded-md w-fit">
                  <Check className="h-3 w-3 text-emerald-500" />
                  Saldo Líquido Pago
                </div>
                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-pink-500/5 rounded-full blur-xl translate-x-4 translate-y-4"></div>
              </div>

              {/* Card 2: Receita Total */}
              <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden">
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
                <div className="mt-4 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-1 rounded-md w-fit">
                  <ProfitIcon className="h-3 w-3" />
                  Entradas ativas
                </div>
                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-green-500/5 rounded-full blur-xl translate-x-4 translate-y-4"></div>
              </div>

              {/* Card 2: Despesa Total */}
              <div className="glass-panel glass-panel-hover p-6 relative overflow-hidden">
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
                <div className="mt-4 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-semibold bg-red-500/10 px-2 py-1 rounded-md w-fit">
                  <TrendingDown className="h-3 w-3" />
                  Saídas registradas
                </div>
                {/* Efeito decorativo */}
                <div className="absolute right-0 bottom-0 h-16 w-16 bg-red-500/5 rounded-full blur-xl translate-x-4 translate-y-4"></div>
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
                <div className="mt-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${saldoLiquido >= 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                    {saldoLiquido >= 0 ? 'Superavitário' : 'Déficit no Mês'}
                  </span>
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
                        setFormPoupancaTotal(totalGuardado.toString())
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
                    <h5 className="text-xs font-bold text-slate-550 dark:text-slate-450">Detalhamento dos Motivos</h5>
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
                              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-350 min-w-0 flex-1">
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
                        <span className="text-slate-500 dark:text-slate-450 font-bold">
                          {porcentagemReserva.toFixed(0)}% • {quantoFalta > 0 ? `Faltam ${formatCurrency(quantoFalta)}` : 'Atingida!'}
                        </span>
                      </div>
                      <div className="w-full bg-pink-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-rose-500 dark:from-amber-400 dark:to-amber-500 transition-all duration-500"
                          style={{ width: `${porcentagemReserva}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-slate-550 dark:text-slate-450 leading-tight">
                        Sua meta de 6 meses de custo de vida é <span className="font-bold text-slate-700 dark:text-slate-350">{formatCurrency(metaReservaEmergencia)}</span>. Você já tem <span className="font-bold text-slate-700 dark:text-slate-350">{formatCurrency(valorAtualReserva)}</span> guardados.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-pink-100/10 dark:bg-slate-950/20 rounded-2xl border border-dashed border-pink-200/60 dark:border-slate-800/60 text-center">
                      <p className="text-[10px] text-slate-500 dark:text-slate-405 leading-normal">
                        Crie uma alocação com o nome exatamente <strong className="text-pink-900 dark:text-amber-400 font-bold">"Reserva de Emergência"</strong> para ativar a meta inteligente de 6 meses de custo de vida.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-555 dark:text-slate-450 font-medium">Saldo Livre (Sem destinação):</span>
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
                          formatter={(value) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{value}</span>}
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
                      categoryChartData.map(c => {
                        const net = c.Receitas - c.Despesas
                        return (
                          <div key={c.name} className="p-3 bg-pink-100/10 dark:bg-slate-900/50 rounded-xl border border-pink-200/30 dark:border-slate-850/30 space-y-1.5">
                            <div className="flex justify-between items-center text-sm font-semibold">
                              <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <span className="text-base">{getCategoryIcon(c.name)}</span>
                                {c.name}
                              </span>
                              <span className={`text-xs font-bold ${net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {net >= 0 ? '+' : ''}{formatCurrency(net)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-550 dark:text-slate-400">
                              <span>Entradas: {formatCurrency(c.Receitas)}</span>
                              <span>Saídas: {formatCurrency(c.Despesas)}</span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-slate-550 dark:text-slate-400 italic py-4 text-center">Nenhum lançamento no mês selecionado.</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 border-t border-pink-200 dark:border-amber-500/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-555 dark:text-slate-450 font-medium">Categorias Ativas:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{categoryChartData.length}</span>
                </div>
              </div>

            </div>

            {/* --- Seção de Transações Recentes --- */}
            <div className="glass-panel p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Últimos Lançamentos</h3>
                  <p className="text-xs text-slate-500">Transações efetuadas para a referência {selectedMonth}</p>
                </div>

                <div className="flex flex-wrap gap-2">
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
                </div>
              </div>

              {/* Tabela Responsiva */}
              <div className="overflow-x-auto rounded-xl border border-pink-200 dark:border-amber-500/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold text-xs border-b border-pink-200 dark:border-amber-500/20">
                      <th className="p-4">Data</th>
                      <th className="p-4">Categoria / Descrição</th>
                      <th className="p-4">Quem Pagou</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40 text-sm">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-pink-200/20 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(tx.data_referencia)}
                          </td>
                          <td className="p-4 max-w-[200px]">
                            <div className="flex items-center gap-3">
                              <span className="text-xl p-1 bg-pink-200/50 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                {getCategoryIcon(tx.categoria)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{tx.categoria}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate" title={tx.subcategoria}>{tx.subcategoria}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tx.quem_pagou === 'Felipe'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                              }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${tx.quem_pagou === 'Felipe' ? 'bg-amber-500' : 'bg-pink-500'}`}></span>
                              {tx.quem_pagou}
                            </span>
                          </td>
                          <td className={`p-4 font-bold whitespace-nowrap ${tx.tipo === 'Receita'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                            }`}>
                            {tx.tipo === 'Receita' ? '+' : '-'} {formatCurrency(tx.valor)}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleTransactionStatus(tx)}
                                className={`p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-pink-100/60 dark:hover:bg-slate-800 ${tx.status === 'Pago'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                title="Alternar Status (Pago/Pendente)"
                              >
                                <RefreshCw className="h-3.5 w-3.5 transition-transform hover:rotate-180 duration-500" />
                              </button>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${tx.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/35 dark:text-rose-450'
                                }`}>
                                {tx.status === 'Pago' ? (
                                  <>
                                    <Check className="h-3 w-3" /> Pago
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3 w-3" /> Pendente
                                  </>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => startEditTransaction(tx)}
                                className="p-1.5 text-slate-400 hover:text-pink-650 dark:hover:text-amber-400 rounded-lg hover:bg-pink-100/60 dark:hover:bg-slate-800 transition-all active:scale-90"
                                title="Editar Lançamento"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-90"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
            <div className="glass-panel p-6">
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
                </div>

                {/* Filtro de pessoas & tipos */}
                <div className="flex items-center gap-3">
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
                </div>
              </div>

              {/* Tabela de Transações */}
              <div className="overflow-x-auto rounded-xl border border-pink-200 dark:border-amber-500/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold text-xs border-b border-pink-200 dark:border-amber-500/20">
                      <th className="p-4">Criado em</th>
                      <th className="p-4">Referência</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Subcategoria</th>
                      <th className="p-4">Quem Pagou</th>
                      <th className="p-4">Valor</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40 text-sm">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-pink-200/20 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(tx.criado_em).toLocaleDateString('pt-BR')} {new Date(tx.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                            {tx.data_referencia.split('-')[1]}/{tx.data_referencia.split('-')[0]}
                          </td>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                            {getCategoryIcon(tx.categoria)} {tx.categoria}
                          </td>
                          <td className="p-4 text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={tx.subcategoria}>{tx.subcategoria}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${tx.quem_pagou === 'Felipe'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300'
                              }`}>
                              {tx.quem_pagou}
                            </span>
                          </td>
                          <td className={`p-4 font-bold ${tx.tipo === 'Receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                            }`}>
                            {tx.tipo === 'Receita' ? '+' : '-'} {formatCurrency(tx.valor)}
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleTransactionStatus(tx)}
                                className={`p-1.5 rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-pink-100/60 dark:hover:bg-slate-800 ${tx.status === 'Pago'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                title="Alternar Status (Pago/Pendente)"
                              >
                                <RefreshCw className="h-3.5 w-3.5 transition-transform hover:rotate-180 duration-500" />
                              </button>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${tx.status === 'Pago'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/35 dark:text-rose-450'
                                }`}>
                                {tx.status === 'Pago' ? 'Pago' : 'Pendente'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => startEditTransaction(tx)}
                                className="p-1.5 text-slate-400 hover:text-pink-600 dark:hover:text-amber-400 rounded-lg transition-all"
                                title="Editar Lançamento"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg transition-all"
                                title="Excluir Lançamento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

        {/* --- Aba 3: Metas --- */}
        {activeTab === 'metas' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">

            {/* Resumo de Metas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-pink-550 dark:border-l-amber-500">
                <div>
                  <span className="text-xs font-semibold text-slate-550 dark:text-slate-450">Metas Ativas</span>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">{metas.length} Categoria(s)</h4>
                </div>
                <div className="p-2.5 bg-pink-100 dark:bg-slate-800 rounded-xl text-pink-600 dark:text-amber-400 shadow-inner">
                  <Target className="h-5 w-5" />
                </div>
              </div>
              <div className="glass-panel p-4 flex items-center justify-between border-l-4 border-l-pink-550 dark:border-l-amber-500">
                <div>
                  <span className="text-xs font-semibold text-slate-550 dark:text-slate-450">Limite de Gastos Mensal</span>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatCurrency(metas.reduce((sum, m) => sum + m.valor_meta, 0))}
                  </h4>
                </div>
                <div className="p-2.5 bg-pink-100 dark:bg-slate-800 rounded-xl text-pink-600 dark:text-amber-400 shadow-inner">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Card de Configuração de Meta */}
            <div className="glass-panel p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-pink-100 dark:bg-amber-955/40 text-pink-700 dark:text-amber-400 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ajuste de Metas Familiares</h3>
                  <p className="text-xs text-slate-500">Estipule limites mensais para controlar despesas por categoria</p>
                </div>
              </div>

              <div className="border-t border-pink-200 dark:border-slate-800/50 pt-4 mt-4 space-y-6">

                {/* Formulário para Nova Meta / Atualizar */}
                <form onSubmit={handleSaveMeta} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Categoria</label>
                      <select
                        value={formMetaCategoria}
                        onChange={(e) => setFormMetaCategoria(e.target.value)}
                        className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 font-semibold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                      >
                        {categoriasValidas.map(c => (
                          <option key={c} value={c}>
                            {getCategoryIcon(c)} {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Valor Limite (R$)</label>
                      <div className="relative rounded-xl shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-400 font-semibold text-xs">R$</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={formMetaValor}
                          onChange={(e) => setFormMetaValor(e.target.value)}
                          placeholder="Ex: 1000,00"
                          className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-pink-955 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Descrição / Motivo da Meta</label>
                    <input
                      type="text"
                      value={formMetaDescricao}
                      onChange={(e) => setFormMetaDescricao(e.target.value)}
                      placeholder="Ex: Controlar gastos com delivery e jantares fora"
                      className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-pink-955 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full h-[42px] py-0 flex items-center justify-center gap-2"
                  >
                    <Target className="h-4.5 w-4.5" />
                    Salvar Meta
                  </button>
                </form>

                {/* Listagem de Metas Ativas */}
                <div className="mt-8 space-y-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Metas Ativas no Momento</h4>

                  <div className="overflow-hidden rounded-xl border border-pink-200 dark:border-slate-800">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-pink-200/30 dark:bg-slate-900/60 text-pink-700 dark:text-amber-400 font-bold text-xs border-b border-pink-200 dark:border-amber-500/20">
                          <th className="p-3">Categoria</th>
                          <th className="p-3">Valor da Meta</th>
                          <th className="p-3">Motivo / Descrição</th>
                          <th className="p-3 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-200/50 dark:divide-slate-800/40 text-sm">
                        {metas.length > 0 ? (
                          metas.map(meta => (
                            <tr key={meta.id} className="hover:bg-pink-200/10 dark:hover:bg-slate-900/30 transition-colors">
                              <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                                {getCategoryIcon(meta.categoria)} {meta.categoria}
                              </td>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                                {formatCurrency(meta.valor_meta)}
                              </td>
                              <td className="p-3 text-slate-600 dark:text-slate-400 text-xs italic max-w-[200px] truncate" title={meta.descricao}>
                                {meta.descricao || <span className="text-slate-400 dark:text-slate-600">Sem descrição</span>}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormMetaCategoria(meta.categoria)
                                      setFormMetaValor(meta.valor_meta.toString().replace('.', ','))
                                      setFormMetaDescricao(meta.descricao || '')
                                    }}
                                    className="p-1 text-slate-400 hover:text-pink-650 dark:hover:text-amber-450 rounded transition-colors"
                                    title="Editar Meta"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMeta(meta.categoria)}
                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                                    title="Excluir Meta"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="p-4 text-center text-xs text-slate-500">
                              Nenhuma meta estipulada ainda. Defina uma meta acima.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            {/* Informações explicativas sobre o Supabase removidas conforme solicitação do usuário */}

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
                <h3 className="font-bold text-lg">{editingTransactionId ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
                <p className="text-xs text-pink-100/90">{editingTransactionId ? 'Altere as informações do registro' : 'Lance receitas ou despesas rapidamente'}</p>
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
                      onClick={() => setFormTipo('Despesa')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formTipo === 'Despesa'
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'text-pink-850 dark:text-slate-400 hover:text-slate-700'
                        }`}
                    >
                      Despesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTipo('Receita')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formTipo === 'Receita'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-pink-850 dark:text-slate-400 hover:text-slate-700'
                        }`}
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
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-955 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Categorias e Subcategoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Categoria</label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 font-semibold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  >
                    {categoriasValidas.map(c => (
                      <option key={c} value={c}>
                        {getCategoryIcon(c)} {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Subcategoria / Detalhe</label>
                  <input
                    type="text"
                    value={formSubcategoria}
                    onChange={(e) => setFormSubcategoria(e.target.value)}
                    placeholder="Ex: Cinema, Supermercado"
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-955 dark:text-white outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Quem Pagou, Data Referência e Recorrência */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Quem Pagou / Recebeu</label>
                  <select
                    value={formQuemPagou}
                    onChange={(e) => setFormQuemPagou(e.target.value)}
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 font-semibold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  >
                    <option value="Felipe">Felipe</option>
                    <option value="Thaís">Thaís</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Data do Lançamento</label>
                  <input
                    type="date"
                    required
                    value={formDataReferencia}
                    onChange={(e) => setFormDataReferencia(e.target.value)}
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Recorrência</label>
                  <select
                    value={formRecorrencia}
                    onChange={(e) => setFormRecorrencia(parseInt(e.target.value, 10))}
                    className="w-full bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-pink-900 dark:text-slate-200 font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
                  >
                    <option value={1}>1x (Única)</option>
                    <option value={2}>2x (Parcelado/Recorrente)</option>
                    <option value={3}>3x</option>
                    <option value={4}>4x</option>
                    <option value={5}>5x</option>
                    <option value={6}>6x</option>
                    <option value={7}>7x</option>
                    <option value={8}>8x</option>
                    <option value={9}>9x</option>
                    <option value={10}>10x</option>
                    <option value={11}>11x</option>
                    <option value={12}>12x (Recorrência Anual)</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Status do Pagamento</label>
                <div className="grid grid-cols-2 gap-2 bg-pink-200/50 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Pago')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formStatus === 'Pago'
                      ? 'bg-pink-50 dark:bg-slate-700 text-pink-900 dark:text-white shadow-md'
                      : 'text-pink-850 dark:text-slate-400 hover:text-pink-955'
                      }`}
                  >
                    Pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Pendente')}
                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formStatus === 'Pendente'
                      ? 'bg-pink-50 dark:bg-slate-700 text-pink-900 dark:text-white shadow-md'
                      : 'text-pink-850 dark:text-slate-400 hover:text-pink-955'
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
                        onChange={(e) => setFormPoupancaTotal(e.target.value)}
                        placeholder="Ex: 15000,00"
                        className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-pink-955 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
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
                      className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-pink-955 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
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
                        onChange={(e) => setFormPoupancaMotivoValor(e.target.value)}
                        placeholder="Ex: 5000,00"
                        className="w-full bg-pink-50 dark:bg-slate-900 border border-pink-200/60 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-pink-955 dark:text-white font-bold outline-none focus:border-pink-500 dark:focus:border-amber-500 focus:ring-2 focus:ring-pink-500/20 dark:focus:ring-amber-500/20"
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
                                    setFormPoupancaMotivoValor(p.valor.toString().replace('.', ','))
                                  }}
                                  className="p-1 text-slate-400 hover:text-pink-600 dark:hover:text-amber-450 transition-colors"
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

    </div>
  )
}
