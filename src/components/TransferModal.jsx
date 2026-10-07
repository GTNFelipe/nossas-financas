import {
  ChevronDown, ArrowLeftRight
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function TransferModal() {
  const {
    isFormTransferDeDropdownOpen,
    setIsFormTransferDeDropdownOpen,
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
    handleSaveTransfer,
    capitalizeWords
  } = useFinanceContext();

  return (
    <>
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
    </>
  );
}



