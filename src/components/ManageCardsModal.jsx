import { useState } from 'react';
import { CreditCard, Plus, Trash2, X } from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function ManageCardsModal() {
  const {
    isManageCardsOpen,
    setIsManageCardsOpen,
    allAvailableCards,
    addCardNickname,
    removeCardNickname,
    setFormCCCard,
    transactions,
    ccModalMonth,
    extractCardNickname,
    capitalizeWords
  } = useFinanceContext();

  const [newCardInput, setNewCardInput] = useState('');

  if (!isManageCardsOpen) return null;

  const defaultCardName = allAvailableCards[0] || 'Nubank';

  const monthCCItems = transactions.filter(
    t => t.categoria === 'Cartão de Crédito' && (!ccModalMonth || t.data_referencia.substring(0, 7) === ccModalMonth)
  );

  const handleAddNewCard = (e) => {
    e.preventDefault();
    if (!newCardInput.trim()) return;
    const trimmed = newCardInput.trim();
    const success = addCardNickname(trimmed);
    if (success) {
      setFormCCCard(trimmed);
      setNewCardInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-pink-200 dark:border-slate-800 animate-slide-up space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-100 dark:bg-slate-800 rounded-xl text-pink-600 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Gerenciar Cartões</h4>
              <p className="text-[11px] text-slate-400">Cadastre ou remova apelidos de cartões</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsManageCardsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form para adicionar novo cartão */}
        <form onSubmit={handleAddNewCard} className="space-y-2">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
            Nome / Apelido do Novo Cartão
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newCardInput}
              onChange={(e) => setNewCardInput(capitalizeWords(e.target.value))}
              placeholder="Ex: Nubank, Inter, XP, C6, Itaú..."
              className="flex-1 bg-pink-50 dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-xl py-2 px-3 text-xs text-pink-900 dark:text-white font-medium outline-none focus:border-pink-500 dark:focus:border-amber-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-rose-600 dark:from-amber-500 dark:to-amber-600 hover:opacity-90 text-white dark:text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Lista de cartões cadastrados */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cartões Cadastrados ({allAvailableCards.length})
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {allAvailableCards.map((card) => {
              const countInMonth = monthCCItems.filter(
                t => (extractCardNickname(t.subcategoria) || defaultCardName) === card
              ).length;

              return (
                <div
                  key={card}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50/50 dark:bg-slate-800/50 border border-pink-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💳</span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-white block">{card}</span>
                      <span className="text-[10px] text-slate-400">
                        {countInMonth} {countInMonth === 1 ? 'compra neste mês' : 'compras neste mês'}
                      </span>
                    </div>
                  </div>
                  {allAvailableCards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Deseja remover o cartão "${card}" da lista de opções?`)) {
                          removeCardNickname(card);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all cursor-pointer"
                      title="Remover cartão da lista"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-pink-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setIsManageCardsOpen(false)}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
