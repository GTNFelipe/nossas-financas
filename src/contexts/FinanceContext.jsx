/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { initialTransactions, initialPoupanca } from '../mockData';

const FinanceContext = createContext();

export function useFinanceContext() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinanceContext deve ser usado dentro de um FinanceProvider');
  }
  return context;
}

export function FinanceProvider({ children }) {
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
    'Guardar Dinheiro',
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

  const closeTransactionModal = () => {
    closeTransactionModal()
    setEditingTransactionId(null)
    setEditingCCGroupMonth(null)
  }

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

  // Função para realizar a recarga manual do Vale Alimentação/Refeição Flexível (R$ 1.004,00)
  const handleVRVARecharge = async (month) => {
    const isSupabaseActive = dbStatus === 'supabase_connected' && isSupabaseConfigured
    
    if (isSupabaseConfigured && !isSupabaseActive) {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    const rechargeData = {
      criado_em: new Date().toISOString(),
      data_referencia: `${month}-01`,
      tipo: 'Receita',
      categoria: 'Vale Alimentação/Refeição',
      subcategoria: 'Recarga Mensal',
      valor: 1004.00,
      quem_pagou: 'Felipe',
      status: 'Pago'
    }

    setIsSyncing(true)
    try {
      if (isSupabaseActive) {
        const { data, error } = await supabase
          .from('transacoes')
          .insert([rechargeData])
          .select()

        if (error) throw error
        if (data && data.length > 0) {
          setTransactions(prev => [data[0], ...prev])
        }
      } else {
        const localRecharge = {
          ...rechargeData,
          id: Date.now()
        }
        setTransactions(prev => [localRecharge, ...prev])
      }
    } catch (err) {
      console.error("Erro ao inserir recarga no Supabase:", err.message)
      alert("Erro ao inserir recarga no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // Função para reverter/remover a recarga do Vale Alimentação/Refeição Flexível
  const handleVRVARevert = async (month) => {
    const rechargeTx = transactions.find(t =>
      t.categoria === 'Vale Alimentação/Refeição' &&
      t.tipo === 'Receita' &&
      t.data_referencia.substring(0, 7) === month
    )

    if (!rechargeTx) return

    const isSupabaseActive = dbStatus === 'supabase_connected' && isSupabaseConfigured
    if (isSupabaseConfigured && !isSupabaseActive) {
      alert("Operação não permitida: O Supabase não está conectado.")
      return
    }

    setIsSyncing(true)
    try {
      if (isSupabaseActive) {
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', rechargeTx.id)

        if (error) throw error
      }
      setTransactions(prev => prev.filter(t => t.id !== rechargeTx.id))
    } catch (err) {
      console.error("Erro ao reverter recarga no Supabase:", err.message)
      alert("Erro ao reverter recarga no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }

  // Sincronizar dados locais se o Supabase não estiver ativo
  const loadLocalData = async () => {
    const loadedTxs = initialTransactions
    const loadedPoupancas = initialPoupanca

    setTransactions(loadedTxs)
    setPoupancas(loadedPoupancas)

    checkMonthTurn(loadedTxs, false)
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
      closeTransactionModal()
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

          const oldTx = transactions.find(t => t.id === editingTransactionId)
          if (
            updatedTx.categoria === 'Guardar Dinheiro' ||
            updatedTx.categoria === 'Dinheiro Guardado' ||
            (oldTx && (oldTx.categoria === 'Guardar Dinheiro' || oldTx.categoria === 'Dinheiro Guardado'))
          ) {
            await handleSyncPoupancaFromTxs([updatedTx], 'update', [oldTx])
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
          const savedMoneyTxs = data.filter(t => t.categoria === 'Guardar Dinheiro' || t.categoria === 'Dinheiro Guardado')
          if (savedMoneyTxs.length > 0) {
            await handleSyncPoupancaFromTxs(savedMoneyTxs, 'insert')
          }

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
    closeTransactionModal()
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

      const tx = transactions.find(t => t.id === id)
      if (tx && (tx.categoria === 'Guardar Dinheiro' || tx.categoria === 'Dinheiro Guardado')) {
        await handleSyncPoupancaFromTxs([tx], 'delete')
      }

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

      if (tx.categoria === 'Guardar Dinheiro' || tx.categoria === 'Dinheiro Guardado') {
        await handleSyncPoupancaFromTxs([{ ...tx, status: newStatus }], 'update', [tx])
      }

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

  // --- Sincronização automática do saldo de poupança (Guardar Dinheiro) ---
  const handleSyncPoupancaFromTxs = async (txs, actionType, oldTxs = []) => {
    try {
      const { data: latestPoupancas, error: fetchError } = await supabase
        .from('poupancas')
        .select('*')
      if (fetchError) throw fetchError

      let currentPoupancas = [...(latestPoupancas || [])]

      const getOrCreateMotivo = (motivoName) => {
        let item = currentPoupancas.find(p => p.motivo.toLowerCase() === motivoName.toLowerCase())
        if (!item) {
          item = { motivo: motivoName, valor: 0 }
          currentPoupancas.push(item)
        }
        return item
      }

      const getOrCreateTotal = () => {
        let item = currentPoupancas.find(p => p.motivo === 'Total')
        if (!item) {
          item = { motivo: 'Total', valor: 0 }
          currentPoupancas.push(item)
        }
        return item
      }

      // Processar cada transação
      if (actionType === 'insert') {
        for (const tx of txs) {
          if (tx.status !== 'Pago') continue
          const motivoNome = tx.subcategoria.trim() || 'Livre'
          const isDespesa = tx.tipo === 'Despesa'
          const delta = isDespesa ? tx.valor : -tx.valor

          const item = getOrCreateMotivo(motivoNome)
          item.valor += delta

          const totalItem = getOrCreateTotal()
          totalItem.valor += delta
        }
      } else if (actionType === 'delete') {
        for (const tx of txs) {
          if (tx.status !== 'Pago') continue
          const motivoNome = tx.subcategoria.trim() || 'Livre'
          const isDespesa = tx.tipo === 'Despesa'
          const delta = isDespesa ? -tx.valor : tx.valor

          const exists = latestPoupancas.some(p => p.motivo.toLowerCase() === motivoNome.toLowerCase())
          if (exists) {
            const item = getOrCreateMotivo(motivoNome)
            item.valor += delta

            const totalItem = getOrCreateTotal()
            totalItem.valor += delta
          }
        }
      } else if (actionType === 'update') {
        for (let i = 0; i < txs.length; i++) {
          const newTx = txs[i]
          const oldTx = oldTxs[i]

          // Reverter antigo
          if (oldTx && (oldTx.categoria === 'Guardar Dinheiro' || oldTx.categoria === 'Dinheiro Guardado') && oldTx.status === 'Pago') {
            const oldMotivo = oldTx.subcategoria.trim() || 'Livre'
            const oldIsDespesa = oldTx.tipo === 'Despesa'
            const oldDelta = oldIsDespesa ? -oldTx.valor : oldTx.valor

            const exists = latestPoupancas.some(p => p.motivo.toLowerCase() === oldMotivo.toLowerCase())
            if (exists) {
              const item = getOrCreateMotivo(oldMotivo)
              item.valor += oldDelta

              const totalItem = getOrCreateTotal()
              totalItem.valor += oldDelta
            }
          }

          // Aplicar novo
          if (newTx && (newTx.categoria === 'Guardar Dinheiro' || newTx.categoria === 'Dinheiro Guardado') && newTx.status === 'Pago') {
            const newMotivo = newTx.subcategoria.trim() || 'Livre'
            const newIsDespesa = newTx.tipo === 'Despesa'
            const newDelta = newIsDespesa ? newTx.valor : -newTx.valor

            const item = getOrCreateMotivo(newMotivo)
            item.valor += newDelta

            const totalItem = getOrCreateTotal()
            totalItem.valor += newDelta
          }
        }
      }

      // Salvar as alterações no Supabase e no estado React local
      const updatedPoupancas = []
      for (const p of currentPoupancas) {
        if (p.id) {
          const { data: updData, error } = await supabase
            .from('poupancas')
            .update({ valor: p.valor, motivo: p.motivo })
            .eq('id', p.id)
            .select()
          if (error) throw error
          if (updData && updData.length > 0) {
            updatedPoupancas.push(updData[0])
          } else {
            updatedPoupancas.push(p)
          }
        } else {
          const { data: insData, error } = await supabase
            .from('poupancas')
            .insert([{ motivo: p.motivo, valor: p.valor }])
            .select()
          if (error) throw error
          if (insData && insData.length > 0) {
            updatedPoupancas.push(insData[0])
          } else {
            updatedPoupancas.push(p)
          }
        }
      }

      setPoupancas(prev => {
        const map = new Map(updatedPoupancas.map(p => [p.motivo.toLowerCase(), p]))
        const merged = prev.map(p => {
          const updated = map.get(p.motivo.toLowerCase())
          if (updated) {
            map.delete(p.motivo.toLowerCase())
            return updated
          }
          return p
        })
        return [...merged, ...map.values()]
      })
    } catch (err) {
      console.warn("Erro ao sincronizar poupança a partir de transações:", err.message)
    }
  }

  // --- Funções do Sistema de Poupança (Guardar Dinheiro) ---
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
      alert("Por favor, digite um motivo para guardar dinheiro.")
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


  // --- Cálculos de Poupança (Guardar Dinheiro) ---
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

  // 3. Saldo Líquido (Dinheiro em Conta - Despesas Pendentes do Mês)
  const saldoLiquido = dinheiroEmConta - despesasPendentes

  const deficitAmount = Math.max(0, despesasPendentes - dinheiroEmConta);
  const dailyNeededTotal = totalBusinessDays > 0 ? deficitAmount / totalBusinessDays : 0;
  const dailyNeededRemaining = remainingBusinessDays > 0 ? deficitAmount / remainingBusinessDays : 0;

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

  // Saldo Restante Flexível cumulativo de todo o histórico até o mês selecionado
  const cumulativeCargaVRVA = transactions
    .filter(t => t.categoria === 'Vale Alimentação/Refeição' && t.tipo === 'Receita' && t.data_referencia.substring(0, 7) <= selectedMonth)
    .reduce((sum, t) => sum + t.valor, 0)
  const cumulativeGastoVRVA = transactions
    .filter(t => t.categoria === 'Vale Alimentação/Refeição' && t.tipo === 'Despesa' && t.data_referencia.substring(0, 7) <= selectedMonth)
    .reduce((sum, t) => sum + t.valor, 0)
  const saldoRestanteVRVA = cumulativeCargaVRVA - cumulativeGastoVRVA

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

  const filteredReceitas = filteredTransactions
    .filter(t => t.tipo === 'Receita')
    .reduce((sum, t) => sum + t.valor, 0)

  const filteredDespesas = filteredTransactions
    .filter(t => t.tipo === 'Despesa')
    .reduce((sum, t) => sum + t.valor, 0)

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
      case 'Dinheiro Guardado':
      case 'Guardar Dinheiro': return '🏦';
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



  const value = {
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
    setIsModalOpen, closeTransactionModal,
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
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}


