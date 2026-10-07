import {
  ChevronDown
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function TransactionModal() {
  const {
    isModalOpen,
     closeTransactionModal,
    editingTransactionId,
    isFormCategoriaDropdownOpen,
    setIsFormCategoriaDropdownOpen,
    isFormQuemPagouDropdownOpen,
    setIsFormQuemPagouDropdownOpen,
    isFormRecorrenciaDropdownOpen,
    setIsFormRecorrenciaDropdownOpen,
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
    editingCCGroupMonth,
    categoriasValidas,
    handleSaveTransaction,
    capitalizeWords,
    getCategoryIcon
  } = useFinanceContext();

  return (
    <>
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
                onClick={() => closeTransactionModal()}
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
                  onClick={() => closeTransactionModal()}
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
    </>
  );
}





