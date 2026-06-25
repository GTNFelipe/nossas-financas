const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'App.jsx');
console.log("Reading file:", filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings to LF for consistent matching
content = content.replace(/\r\n/g, '\n');

// Load replacements
const statesText = fs.readFileSync(path.join(__dirname, 'states.txt'), 'utf8').replace(/\r\n/g, '\n');
const functionsText = fs.readFileSync(path.join(__dirname, 'functions.txt'), 'utf8').replace(/\r\n/g, '\n');
const modalText = fs.readFileSync(path.join(__dirname, 'modal.txt'), 'utf8').replace(/\r\n/g, '\n');

// 1. Add Upload to lucide-react imports
const importTarget = `  ArrowLeftRight,
  X
} from 'lucide-react'`;

const importReplacement = `  ArrowLeftRight,
  X,
  Upload
} from 'lucide-react'`;

if (content.includes(importTarget)) {
  content = content.replace(importTarget, importReplacement);
  console.log("SUCCESS: Lucide-react import updated.");
} else {
  console.log("FAIL: Lucide-react import target not found.");
}

// 2. Add State variables
const stateTarget = `  const [transactions, setTransactions] = useState([])`;
// Check if state is already added (we don't want to duplicate if it succeeded before)
if (content.includes('isImportModalOpen')) {
  console.log("SKIP: Importer states already exist in file.");
} else {
  const stateReplacement = statesText + "\n" + stateTarget;
  if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplacement);
    console.log("SUCCESS: Importer state variables injected.");
  } else {
    console.log("FAIL: State target not found.");
  }
}

// 3. Add Importer functions
const functionsTarget = `  // Sincronizar dados locais se o Supabase não estiver ativo
  const loadLocalData = async () => {`;
const functionsReplacement = functionsText + "\n\n" + functionsTarget;

if (content.includes(functionsTarget)) {
  content = content.replace(functionsTarget, functionsReplacement);
  console.log("SUCCESS: Importer logic and helper functions injected.");
} else {
  console.log("FAIL: Functions target not found.");
}

// 4. Inject Dashboard Button
const dashButtonTarget = `              <div className="flex gap-2 w-full sm:w-auto">
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
              </div>`;

const dashButtonReplacement = `              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="btn-secondary flex items-center justify-center gap-1.5"
                >
                  <Upload className="h-4.5 w-4.5" />
                  <span className="hidden sm:inline">Importar</span>
                </button>
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
              </div>`;

if (content.includes(dashButtonTarget)) {
  content = content.replace(dashButtonTarget, dashButtonReplacement);
  console.log("SUCCESS: Dashboard button injected.");
} else {
  console.log("FAIL: Dashboard button target not found.");
}

// 5. Inject Lançamentos Button
const lancButtonTarget = `              <button
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
              </button>`;

const lancButtonReplacement = `              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <Upload className="h-4.5 w-4.5" />
                Importar Planilha
              </button>
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
              </button>`;

if (content.includes(lancButtonTarget)) {
  content = content.replace(lancButtonTarget, lancButtonReplacement);
  console.log("SUCCESS: Lancamentos tab button injected.");
} else {
  console.log("FAIL: Lancamentos tab button target not found.");
}

// 6. Inject the Import Modal
const modalTarget = `      {/* --- MODAL DE TRANSFERÊNCIA DE SALDO ENTRE CONTAS --- */}`;
if (content.includes('MODAL DE IMPORTAÇÃO DE PLANILHA CSV')) {
  console.log("SKIP: Import modal already exists in file.");
} else {
  const modalReplacement = modalText + "\n\n" + modalTarget;
  if (content.includes(modalTarget)) {
    content = content.replace(modalTarget, modalReplacement);
    console.log("SUCCESS: Import modal injected.");
  } else {
    console.log("FAIL: Modal target not found.");
  }
}

// Restore CRLF line endings for Windows project consistency
const finalContent = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, finalContent, 'utf8');
console.log("Importer script executed and changes written to App.jsx!");
