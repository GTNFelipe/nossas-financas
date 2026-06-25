const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
console.log("Reading file:", filePath);

let content = fs.readFileSync(filePath, 'utf8');

// 1. Swappings: Felipe -> Lucas, Thaís -> Carol (including Thais)
// Let's replace names case-sensitively
content = content.replace(/Felipe \/ Thaís/g, 'Lucas / Carol');
content = content.replace(/Felipe e Thaís/g, 'Lucas e Carol');
content = content.replace(/Felipe/g, 'Lucas');
content = content.replace(/felipe/g, 'lucas');
content = content.replace(/Thaís/g, 'Carol');
content = content.replace(/Thais/g, 'Carol');
content = content.replace(/thais/g, 'carol');

// Re-swap avatar initials
content = content.replace(/>\s*F\s*<\/span>/, '>L</span>');
content = content.replace(/>\s*T\s*<\/span>/, '>C</span>');

// 2. Remove Vale Alimentação/Refeição Category and automatic recharge logic
// Let's search for case 'Vale Alimentação/Refeição': return '🍔'; and remove it
content = content.replace(/\s*case 'Vale Alimentação\/Refeição': return '🍔';/, '');
// Remove the string 'Vale Alimentação/Refeição' from categoriasValidas array
content = content.replace(/,\s*'Vale Alimentação\/Refeição'/, '');
content = content.replace(/'Vale Alimentação\/Refeição',\s*/, '');

// Remove recharge logic function call or function definition
// Let's find the checkVRVARecharge function or logic and clean it
const rechargeLogicRegex = /\/\/ Função para verificar e gerar a recarga mensal[\s\S]*?\/\/ --- Funções das Transações ---/g;
content = content.replace(rechargeLogicRegex, '// --- Funções das Transações ---');

// Also remove it from useEffect
content = content.replace(/checkVRVARecharge\(\)/g, '');

// Clean other calculations like saldoRestanteVRVA, pctVRVA, etc.
content = content.replace(/\/\/ --- Cálculos do Vale Alimentação\/Refeição[\s\S]*?\/\/ --- Filtragem de Transações/g, '// --- Filtragem de Transações');

// Remove t.categoria !== 'Vale Alimentação/Refeição' from filters
content = content.replace(/t\.categoria !== 'Vale Alimentação\/Refeição' && /g, '');
content = content.replace(/ && t\.categoria !== 'Vale Alimentação\/Refeição'/g, '');

// Remove the Vale Alimentação card from grid UI
const cardRegex = /\{\/\* Card de Vale Alimentação\/Refeição Flexível \(VA\/VR\) \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
// Wait! Let's make sure we match the card exactly and replace it with nothing, and change columns to 1
content = content.replace(/grid-cols-1 lg:grid-cols-2 gap-6/, 'grid-cols-1 gap-6');
content = content.replace(/\{\/\* Card de Vale Alimentação\/Refeição Flexível \(VA\/VR\) \*\/\}[\s\S]*?\{\/\* --- Seção de Transações Recentes --- \*\/\}/, '{\/* --- Seção de Transações Recentes --- *\/}');

// 3. Inject Importer States
const stateAnchor = `// --- Estados do Aplicativo ---`;
const stateInjection = `\n  // --- Estados do Importador de Planilha ---\n  const [isImportModalOpen, setIsImportModalOpen] = useState(false)\n  const [importRows, setImportRows] = useState([])\n  const [importFilename, setImportFilename] = useState('')\n  const [importError, setImportError] = useState('')\n`;
content = content.replace(stateAnchor, stateAnchor + stateInjection);

// 4. Inject Importer Functions inside the App component, right before form handlers or calculations
const functionAnchor = `// --- Funções das Transações ---`;
const functionInjection = `
  // --- Lógica de Importação de Planilha CSV ---
  const handleCSVUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFilename(file.name)
    setImportError('')
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target.result
        const parsed = processCSVData(text)
        if (parsed.length === 0) {
          setImportError('Nenhuma linha de transação válida encontrada no arquivo.')
        }
        setImportRows(parsed)
      } catch (err) {
        setImportError('Erro ao ler o arquivo CSV: ' + err.message)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  const processCSVData = (text) => {
    const lines = text.split(/\\r?\\n/).map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length < 2) return []

    const firstLine = lines[0]
    const semicolonCount = (firstLine.match(/;/g) || []).length
    const commaCount = (firstLine.match(/,/g) || []).length
    const delimiter = semicolonCount > commaCount ? ';' : ','

    const splitCSVLine = (lineStr, delim) => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < lineStr.length; i++) {
        const char = lineStr[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delim && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result.map(val => val.replace(/^"|"$/g, '').trim())
    }

    const parsedTransactions = []

    let isFormatB = false
    let monthHeadersIndexMap = {}
    let headerLineIndex = -1

    const ptMonths = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const cols = splitCSVLine(lines[i], delimiter)
      const cleaned = cols.map(c => c.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim())
      
      let matchCount = 0
      cleaned.forEach(c => {
        if (ptMonths.includes(c)) matchCount++
      })

      if (matchCount >= 3) {
        isFormatB = true
        headerLineIndex = i
        cleaned.forEach((c, colIdx) => {
          const monthNum = ptMonths.indexOf(c) + 1
          if (monthNum > 0) {
            monthHeadersIndexMap[colIdx] = monthNum
          }
        })
        break
      }
    }

    if (isFormatB) {
      let activeCategory = 'Casa'
      let activeTipo = 'Despesa'
      const activeYear = selectedMonth ? selectedMonth.split('-')[0] : new Date().getFullYear().toString()

      for (let i = headerLineIndex + 1; i < lines.length; i++) {
        const columns = splitCSVLine(lines[i], delimiter)
        if (columns.length === 0 || (columns.length === 1 && columns[0] === '')) continue

        const col1Clean = columns[1] ? columns[1].trim() : ''
        const col2Clean = columns[2] ? columns[2].trim() : ''
        const col0Clean = columns[0] ? columns[0].trim() : ''

        const isSectionHeader = (col1Clean !== '' && col2Clean === '') || (col0Clean !== '' && col1Clean === '' && col2Clean === '')
        if (isSectionHeader) {
          const sectionName = (col1Clean !== '' ? col1Clean : col0Clean).toUpperCase()
          if (sectionName.includes('RENDA') || sectionName.includes('RECEITA') || sectionName.includes('ENTRADA') || sectionName.includes('GANHO') || sectionName.includes('SALARIO')) {
            activeCategory = 'Salário'
            activeTipo = 'Receita'
          } else if (sectionName.includes('CASA') || sectionName.includes('MORADIA') || sectionName.includes('RESIDENC')) {
            activeCategory = 'Casa'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('SAUDE') || sectionName.includes('MEDIC') || sectionName.includes('FARMAC') || sectionName.includes('CLINIC')) {
            activeCategory = 'Saúde'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('DIZIMO') || sectionName.includes('IGREJA') || sectionName.includes('OFERTA') || sectionName.includes('CONTRIB')) {
            activeCategory = 'Dízimo'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('TRANSPORTE') || sectionName.includes('CARRO') || sectionName.includes('MOTO') || sectionName.includes('VEICULO') || sectionName.includes('AUTO') || sectionName.includes('COMBUST')) {
            activeCategory = 'Transporte'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('LAZER') || sectionName.includes('ENTRETEN') || sectionName.includes('VIAG') || sectionName.includes('PASS')) {
            activeCategory = 'Lazer'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('POUPANCA') || sectionName.includes('INVESTIM') || sectionName.includes('RESERVA') || sectionName.includes('GUARDAD')) {
            activeCategory = 'Investimentos'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('EDUCAC') || sectionName.includes('CURSO') || sectionName.includes('ESCOLA') || sectionName.includes('FACULD')) {
            activeCategory = 'Educação'
            activeTipo = 'Despesa'
          } else if (sectionName.includes('PESSOAL') || sectionName.includes('INDIVIDUAL') || sectionName.includes('CABELO') || sectionName.includes('ESTETIC') || sectionName.includes('ROUPA')) {
            activeCategory = 'Despesas Pessoais'
            activeTipo = 'Despesa'
          } else {
            activeCategory = 'Imprevistos'
            activeTipo = 'Despesa'
          }
          continue
        }

        let initials = ''
        let subcat = ''
        const col3Clean = columns[3] ? columns[3].trim() : ''

        const val2 = col2Clean.toUpperCase()
        if (val2 === 'F' || val2 === 'L' || val2 === 'T' || val2 === 'C') {
          initials = val2
          subcat = col3Clean
        } else {
          subcat = col2Clean
        }

        if (!subcat) continue

        let quem_pagou = 'Lucas'
        const initialsUpper = initials.toUpperCase()
        if ((initialsUpper.includes('F') || initialsUpper.includes('L')) && (initialsUpper.includes('T') || initialsUpper.includes('C'))) {
          quem_pagou = 'Lucas / Carol'
        } else if (initialsUpper.includes('T') || initialsUpper.includes('C')) {
          quem_pagou = 'Carol'
        } else if (initialsUpper.includes('F') || initialsUpper.includes('L')) {
          quem_pagou = 'Lucas'
        }

        Object.keys(monthHeadersIndexMap).forEach(colIdxStr => {
          const colIdx = parseInt(colIdxStr, 10)
          const monthNum = monthHeadersIndexMap[colIdx]
          const cellValue = columns[colIdx] ? columns[colIdx].trim() : ''

          if (cellValue === '' || cellValue === '-' || cellValue === '0' || cellValue === '0,00') return

          let rawValClean = cellValue.replace(/R\\$/i, '').replace(/\\s/g, '')
          if (rawValClean === '-' || rawValClean === '') return

          const temVirgula = rawValClean.includes(',')
          const temPonto = rawValClean.includes('.')
          if (temVirgula && temPonto) {
            rawValClean = rawValClean.replace(/\\./g, '').replace(',', '.')
          } else if (temVirgula) {
            rawValClean = rawValClean.replace(',', '.')
          }

          const valorNum = Math.abs(parseFloat(rawValClean)) || 0
          if (valorNum === 0) return

          const dateRef = \`\${activeYear}-\${String(monthNum).padStart(2, '0')}-01\`

          parsedTransactions.push({
            data_referencia: dateRef,
            tipo: activeTipo,
            categoria: activeCategory,
            subcategoria: subcat,
            valor: valorNum,
            quem_pagou: quem_pagou,
            status: 'Pago',
            criado_em: new Date().toISOString()
          })
        })
      }
    } else {
      let idxData = -1
      let idxTipo = -1
      let idxCategoria = -1
      let idxSubcat = -1
      let idxValor = -1
      let idxQuem = -1
      let idxStatus = -1
      let activeTable = false

      for (let i = 0; i < lines.length; i++) {
        const columns = splitCSVLine(lines[i], delimiter)
        if (columns.length === 0 || (columns.length === 1 && columns[0] === '')) continue

        const cleanedCols = columns.map(c => 
          c.toLowerCase()
           .normalize("NFD")
           .replace(/[\\u0300-\\u036f]/g, "")
           .replace(/[^a-z0-9_]/g, "")
        )

        const hasValor = cleanedCols.includes('valor')
        const hasVencimento = cleanedCols.includes('vencimento') || cleanedCols.includes('dia') || cleanedCols.includes('data')
        const hasOrcamento = cleanedCols.includes('orcamento') || cleanedCols.includes('diferenca') || cleanedCols.includes('real')

        if (hasValor && hasVencimento && !hasOrcamento) {
          idxValor = cleanedCols.indexOf('valor')
          
          if (cleanedCols.includes('vencimento')) idxData = cleanedCols.indexOf('vencimento')
          else if (cleanedCols.includes('data')) idxData = cleanedCols.indexOf('data')
          else if (cleanedCols.includes('dia')) idxData = cleanedCols.indexOf('dia')
          else idxData = -1

          if (cleanedCols.includes('situacao')) idxStatus = cleanedCols.indexOf('situacao')
          else if (cleanedCols.includes('status')) idxStatus = cleanedCols.indexOf('status')
          else if (cleanedCols.includes('pago')) idxStatus = cleanedCols.indexOf('pago')
          else idxStatus = -1

          if (cleanedCols.includes('categoria')) idxCategoria = cleanedCols.indexOf('categoria')
          else idxCategoria = -1

          if (cleanedCols.includes('tipo')) idxTipo = cleanedCols.indexOf('tipo')
          else idxTipo = -1

          if (cleanedCols.includes('quem')) idxQuem = cleanedCols.indexOf('quem')
          else if (cleanedCols.includes('pagou')) idxQuem = cleanedCols.indexOf('pagou')
          else if (cleanedCols.includes('pagador')) idxQuem = cleanedCols.indexOf('pagador')
          else idxQuem = -1

          idxSubcat = cleanedCols.findIndex((h, idx) => h !== '' && idx !== idxData && idx !== idxValor && idx !== idxStatus && idx !== idxQuem && idx !== idxCategoria && idx !== idxTipo)
          
          activeTable = true
          continue
        } else if (hasOrcamento || cleanedCols.includes('resumodesaida')) {
          activeTable = false
          continue
        }

        if (activeTable && idxValor !== -1 && columns[idxValor]) {
          const rawValor = columns[idxValor]
          if (!rawValor || rawValor.replace(/[^0-9]/g, '') === '') continue

          const subcat = idxSubcat !== -1 && columns[idxSubcat] ? columns[idxSubcat].trim() : ''
          if (!subcat) continue

          let rawValClean = rawValor.replace(/R\\$/i, '').replace(/\\s/g, '')
          const temVirgula = rawValClean.includes(',')
          const temPonto = rawValClean.includes('.')
          
          if (temVirgula && temPonto) {
            rawValClean = rawValClean.replace(/\\./g, '').replace(',', '.')
          } else if (temVirgula) {
            rawValClean = rawValClean.replace(',', '.')
          }
          const valorNum = Math.abs(parseFloat(rawValClean)) || 0
          if (valorNum === 0) continue

          let dataRef = ''
          if (idxData !== -1 && columns[idxData]) {
            const rawDateStr = columns[idxData].trim()
            const diaNum = parseInt(rawDateStr, 10)
            if (!isNaN(diaNum) && diaNum >= 1 && diaNum <= 31) {
              const [y, m] = selectedMonth.split('-')
              dataRef = \`\${y}-\${m}-\${String(diaNum).padStart(2, '0')}\`
            } else {
              let rawDate = rawDateStr.replace(/\\//g, '-')
              const dParts = rawDate.split('-')
              if (dParts.length === 3) {
                if (dParts[0].length === 2 && dParts[2].length === 4) {
                  dataRef = \`\${dParts[2]}-\${dParts[1]}-\\${dParts[0]}\`
                } else if (dParts[0].length === 4) {
                  dataRef = rawDate
                }
              }
            }
          }

          if (!dataRef) {
            dataRef = \`\${selectedMonth}-01\`
          }

          let tipo = 'Despesa'
          if (idxTipo !== -1 && columns[idxTipo]) {
            const rawTipo = columns[idxTipo].toLowerCase()
            if (rawTipo.includes('receita') || rawTipo.includes('entrada') || rawTipo.includes('ganho') || rawTipo.includes('salario')) {
              tipo = 'Receita'
            }
          } else if (columns[idxValor].includes('+')) {
            tipo = 'Receita'
          }

          let categoria = 'Casa'
          if (idxCategoria !== -1 && columns[idxCategoria]) {
            const rawCat = columns[idxCategoria].trim()
            const match = categoriasValidas.find(cv => cv.toLowerCase() === rawCat.toLowerCase())
            if (match) categoria = match
          } else {
            const lower = subcat.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")
            if (lower.includes('comida') || lower.includes('mercado') || lower.includes('restaurante') || lower.includes('supermercado') || lower.includes('padaria') || lower.includes('feira')) {
              categoria = 'Alimentação'
            } else if (lower.includes('aluguel') || lower.includes('condominio') || lower.includes('luz') || lower.includes('agua') || lower.includes('internet') || lower.includes('celular') || lower.includes('apartamento') || lower.includes('energia') || lower.includes('gas') || lower.includes('faxina') || lower.includes('garagem') || lower.includes('casa')) {
              categoria = 'Casa'
            } else if (lower.includes('salario') || lower.includes('proventos') || lower.includes('rendimento')) {
              categoria = 'Salário'
            } else if (lower.includes('viagem') || lower.includes('cinema') || lower.includes('show') || lower.includes('festa') || lower.includes('lazer') || lower.includes('streaming') || lower.includes('netflix') || lower.includes('meli') || lower.includes('spotify')) {
              categoria = 'Lazer'
            } else if (lower.includes('carro') || lower.includes('combustivel') || lower.includes('uber') || lower.includes('onibus') || lower.includes('pedagio') || lower.includes('moto') || lower.includes('seguro') || lower.includes('transporte')) {
              categoria = 'Transporte'
            } else if (lower.includes('remedio') || lower.includes('medico') || lower.includes('hospital') || lower.includes('farmacia') || lower.includes('saude') || lower.includes('plano')) {
              categoria = 'Saúde'
            } else if (lower.includes('escola') || lower.includes('curso') || lower.includes('faculdade') || lower.includes('livro') || lower.includes('mensalidade')) {
              categoria = 'Educação'
            } else if (lower.includes('cabelo') || lower.includes('sobrancelha') || lower.includes('estetica') || lower.includes('roupa') || lower.includes('pessoal')) {
              categoria = 'Despesas Pessoais'
            } else if (lower.includes('dizimo') || lower.includes('oferta') || lower.includes('igreja')) {
              categoria = 'Dízimo'
            } else if (lower.includes('investimento') || lower.includes('poupanca') || lower.includes('acao')) {
              categoria = 'Investimentos'
            } else {
              categoria = 'Imprevistos'
            }
          }

          let quem_pagou = 'Lucas'
          if (idxQuem !== -1 && columns[idxQuem]) {
            const rawQuem = columns[idxQuem].toLowerCase()
            if (rawQuem.includes('carol') || rawQuem === 'c') {
              quem_pagou = 'Carol'
            }
          }

          let status = 'Pago'
          if (idxStatus !== -1 && columns[idxStatus]) {
            const rawStatus = columns[idxStatus].toLowerCase()
            if (rawStatus.includes('pendente') || rawStatus === 'n' || rawStatus === 'false' || rawStatus === '0' || rawStatus === '') {
              status = 'Pendente'
            }
          }

          parsedTransactions.push({
            data_referencia: dataRef,
            tipo,
            categoria,
            subcategoria: subcat,
            valor: valorNum,
            quem_pagou,
            status,
            criado_em: new Date().toISOString()
          })
        }
      }
    }

    return parsedTransactions
  }

  const handleConfirmImport = async () => {
    if (importRows.length === 0) return

    setIsSyncing(true)
    try {
      if (isSupabaseConfigured && dbStatus === 'supabase_connected') {
        const { data, error } = await supabase
          .from('transacoes')
          .insert(importRows)
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setTransactions(prev => [...data, ...prev])
        } else {
          loadData()
        }
      } else {
        const localTxs = importRows.map((row, idx) => ({
          ...row,
          id: 'tx-imported-' + Date.now() + '-' + idx
        }))
        setTransactions(prev => [...localTxs, ...prev])
      }

      alert(\`Sucesso! \${importRows.length} transações foram importadas com sucesso.\`)
      setImportRows([])
      setImportFilename('')
      setIsImportModalOpen(false)
    } catch (err) {
      console.error("Erro ao importar planilhas:", err.message)
      alert("Erro ao importar no Supabase: " + err.message)
    } finally {
      setIsSyncing(false)
    }
  }
`;
content = content.replace(functionAnchor, functionAnchor + functionInjection);

// 5. Inject Button in toolbar
// Let's locate:
// <button
//   onClick={() => {
//     setEditingTransactionId(null)
//     setFormValor('')
//     setFormSubcategoria('')
//     setIsModalOpen(true)
//   }}
//   className="btn-primary w-full sm:w-auto"
// >
//   <Plus className="h-5 w-5" />
//   Novo Lançamento
// </button>
//
// And place the Importar button right before/after it:
// <button
//   onClick={() => setIsImportModalOpen(true)}
//   className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5"
// >
//   <Upload className="h-4.5 w-4.5" />
//   Importar Planilha
// </button>

const buttonSearch = `<button\n                onClick={() => {\n                  setEditingTransactionId(null)\n                  setFormValor('')\n                  setFormSubcategoria('')\n                  setIsModalOpen(true)\n                }}\n                className="btn-primary w-full sm:w-auto"\n              >\n                <Plus className="h-5 w-5" />\n                Novo Lançamento\n              </button>`;

const buttonReplace = `<button\n                onClick={() => setIsImportModalOpen(true)}\n                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5"\n              >\n                <Upload className="h-4.5 w-4.5" />\n                Importar Planilha\n              </button>\n              <button\n                onClick={() => {\n                  setEditingTransactionId(null)\n                  setFormValor('')\n                  setFormSubcategoria('')\n                  setIsModalOpen(true)\n                }}\n                className="btn-primary w-full sm:w-auto"\n              >\n                <Plus className="h-5 w-5" />\n                Novo Lançamento\n              </button>`;

content = content.replace(buttonSearch, buttonReplace);

// 6. Inject the Import Modal at the bottom, before the final </div> and return matching close tags
// Let's place it before the Transfer Modal
const transferModalAnchor = `{/* --- MODAL DE TRANSFERÊNCIA DE SALDO ENTRE CONTAS --- */}`;
const importModalCode = `
      {/* --- MODAL DE IMPORTAÇÃO DE PLANILHA CSV --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="p-6 bg-gradient-to-r from-pink-600 to-rose-600 dark:from-slate-900 dark:to-slate-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Upload className="h-5 w-5 text-pink-100 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Importar Lançamentos</h3>
                  <p className="text-[10px] text-pink-200/90 dark:text-slate-400">Importe uma planilha CSV em lote</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setImportRows([])
                  setImportFilename('')
                  setImportError('')
                  setIsImportModalOpen(false)
                }}
                className="text-white/85 hover:text-white text-sm font-bold bg-white/15 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="p-4 bg-pink-100/20 dark:bg-slate-950/30 border border-pink-200/40 dark:border-slate-800/40 rounded-2xl text-xs space-y-2">
                <p className="font-bold text-pink-900 dark:text-amber-400">💡 Como deve ser o arquivo CSV:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>Exportar a planilha como <strong>CSV separado por vírgulas ou ponto e vírgula</strong>.</li>
                  <li>Aceita tabelas verticais (cabeçalhos: Data/Vencimento, Valor, Subcategoria...) ou horizontais (meses como colunas).</li>
                  <li>Formatos de valor suportados: R$ 1.500,00 ou 1500.00.</li>
                </ul>
              </div>

              {/* Input do Arquivo */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 block">Selecionar arquivo CSV</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                    id="csv-file-input"
                  />
                  <label
                    htmlFor="csv-file-input"
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    Escolher Arquivo
                  </label>
                  <span className="text-xs text-slate-600 dark:text-slate-300 italic truncate max-w-[250px]">
                    {importFilename || 'Nenhum arquivo selecionado'}
                  </span>
                </div>
              </div>

              {importError && (
                <div className="p-3 bg-red-100/30 border border-red-200/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                  ⚠️ {importError}
                </div>
              )}

              {/* Tabela de Preview */}
              {importRows.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500">
                    Pré-visualização dos Lançamentos ({importRows.length} linhas detectadas)
                  </h4>
                  <div className="overflow-x-auto border border-pink-200/40 dark:border-slate-800/40 rounded-xl max-h-[220px] overflow-y-auto">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="bg-pink-100/30 dark:bg-slate-950/40 border-b border-pink-200/40 dark:border-slate-800/40 font-bold text-slate-700 dark:text-slate-300">
                          <th className="p-2">Data</th>
                          <th className="p-2">Tipo</th>
                          <th className="p-2">Categoria</th>
                          <th className="p-2">Subcategoria</th>
                          <th className="p-2">Valor</th>
                          <th className="p-2">Quem</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pink-100/20 dark:divide-slate-800/20 text-slate-600 dark:text-slate-300">
                        {importRows.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-pink-100/5 dark:hover:bg-slate-800/30">
                            <td className="p-2 whitespace-nowrap">{row.data_referencia}</td>
                            <td className="p-2">
                              <span className={\`px-1.5 py-0.5 rounded text-[10px] font-bold \${row.tipo === 'Receita' ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'}\`}>
                                {row.tipo}
                              </span>
                            </td>
                            <td className="p-2 whitespace-nowrap">{row.categoria}</td>
                            <td className="p-2 max-w-[120px] truncate" title={row.subcategoria}>{row.subcategoria}</td>
                            <td className="p-2 font-bold">{formatCurrency(row.valor)}</td>
                            <td className="p-2">{row.quem_pagou}</td>
                            <td className="p-2">
                              <span className={\`px-1.5 py-0.5 rounded text-[10px] font-bold \${row.status === 'Pago' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'}\`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRows.length > 10 && (
                    <p className="text-[10px] text-slate-400 italic">
                      * Exibindo apenas os primeiros 10 lançamentos para pré-visualização.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="p-6 bg-pink-100/10 dark:bg-slate-950/20 border-t border-pink-200/50 dark:border-slate-800/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setImportRows([])
                  setImportFilename('')
                  setImportError('')
                  setIsImportModalOpen(false)
                }}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importRows.length === 0 || isSyncing}
                className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    Confirmar Importação
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(transferModalAnchor, importModalCode + "\n      " + transferModalAnchor);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Changes applied successfully!");
