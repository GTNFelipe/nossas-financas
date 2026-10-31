import { useState } from 'react';
import {
  SlidersHorizontal, Check, TrendingUp, TrendingDown, Info, RefreshCw
} from 'lucide-react';
import { useFinanceContext } from '../contexts/FinanceContext';

export default function RegularizarSaldoModal() {
  const {
    isRegularizarModalOpen,
    setIsRegularizarModalOpen,
    regularizarConta,
    setRegularizarConta,
    regularizarNovoSaldo,
    setRegularizarNovoSaldo,
    dinheiroEmContaFelipe,
    dinheiroEmContaThais,
    dinheiroEmConta,
    formatCurrency,
    parseBRL,
    handleRegularizarSaldo,
    isSyncing
  } = useFinanceContext();

  const currentSaldo = regularizarConta === 'Felipe' ? dinheiroEmContaFelipe : dinheiroEmContaThais;
  const novoSaldoNum = regularizarNovoSaldo ? parseBRL(regularizarNovoSaldo) : NaN;
  const hasValidInput = !isNaN(novoSaldoNum);
  const diff = hasValidInput ? parseFloat((novoSaldoNum - currentSaldo).toFixed(2)) : 0;
  const isAumento = diff > 0;
  const isReducao = diff < 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasValidInput) {
      alert("Por favor, digite o novo saldo que consta na sua conta bancária.");
      return;
    }
    if (diff === 0) {
      alert("O novo saldo informado é idêntico ao saldo atual do app. Nenhuma alteração é necessária.");
      return;
    }
    await handleRegularizarSaldo({
      conta: regularizarConta,
      novoSaldoNum
    });
  };

  const handlePreencherAtual = () => {
    const formatted = Number(Math.max(0, currentSaldo)).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setRegularizarNovoSaldo(formatted);
  };

  if (!isRegularizarModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-pink-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/60 dark:border-slate-800/50 overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-slate-900 dark:to-slate-950 text-white flex justify-between items-center border-b border-emerald-500/20 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/10 dark:bg-emerald-500/10 rounded-xl">
              <SlidersHorizontal className="h-5 w-5 text-emerald-100 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Regularizar Dinheiro em Conta</h3>
              <p className="text-[11px] text-emerald-100/90 dark:text-slate-400">
                Ajuste o saldo do app para coincidir 100% com o banco
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRegularizarNovoSaldo('');
              setIsRegularizarModalOpen(false);
            }}
            className="text-white/80 hover:text-white text-sm font-bold bg-white/15 hover:bg-white/20 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo do Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Seleção de Quem */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              Conta de Quem?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegularizarConta('Felipe')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  regularizarConta === 'Felipe'
                    ? 'bg-amber-500/15 border-amber-500/60 dark:bg-amber-500/20 dark:border-amber-500 shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/60 border-pink-200/60 dark:border-slate-700/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Felipe
                  </span>
                  {regularizarConta === 'Felipe' && (
                    <Check className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Saldo: <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(dinheiroEmContaFelipe)}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRegularizarConta('Thaís')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  regularizarConta === 'Thaís'
                    ? 'bg-pink-500/15 border-pink-500/60 dark:bg-pink-500/20 dark:border-pink-500 shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/60 border-pink-200/60 dark:border-slate-700/60 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                    Thaís
                  </span>
                  {regularizarConta === 'Thaís' && (
                    <Check className="h-3.5 w-3.5 text-pink-500" />
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Saldo: <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(dinheiroEmContaThais)}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Saldo Atual no App */}
          <div className="bg-white/70 dark:bg-slate-800/60 border border-pink-200/60 dark:border-slate-700/60 rounded-2xl p-3 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-medium text-[11px]">
                Saldo Atual no App ({regularizarConta}):
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(currentSaldo)}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePreencherAtual}
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-500/30 transition-all cursor-pointer"
            >
              Copiar Valor
            </button>
          </div>

          {/* Campo de Novo Saldo Real */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              Quanto tem realmente na conta agora? (R$)
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-slate-400 dark:text-slate-500 text-sm font-bold">R$</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={regularizarNovoSaldo}
                onChange={(e) => {
                  const cleanDigits = e.target.value.replace(/\D/g, '');
                  if (!cleanDigits) {
                    setRegularizarNovoSaldo('');
                    return;
                  }
                  const num = parseFloat(cleanDigits) / 100;
                  const formatted = num.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                  setRegularizarNovoSaldo(formatted);
                }}
                placeholder="0,00"
                className="w-full bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-base text-slate-900 dark:text-white font-extrabold outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Box Informativo da Diferença em Tempo Real */}
          {hasValidInput && diff !== 0 && (
            <div
              className={`p-3.5 rounded-2xl border text-xs animate-fade-in ${
                isAumento
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isAumento ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Aumento de Receita: +{formatCurrency(diff)}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    <span>Redução de Receita: -{formatCurrency(Math.abs(diff))}</span>
                  </>
                )}
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {isAumento
                  ? `O saldo em conta aumentará em ${formatCurrency(diff)}. Esse valor será somado à Receita do Mês como "Ajuste de Saldo", deixando o saldo em conta 100% igual ao banco (${formatCurrency(novoSaldoNum)}).`
                  : `O saldo em conta diminuirá em ${formatCurrency(Math.abs(diff))}. Esse valor será descontado da Receita do Mês como "Ajuste de Saldo", deixando o saldo em conta 100% igual ao banco (${formatCurrency(novoSaldoNum)}).`}
              </p>
            </div>
          )}

          {(!hasValidInput || diff === 0) && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>
                Digite o valor exato que consta no seu aplicativo bancário. O sistema calculará a diferença e ajustará a receita do mês automaticamente para você.
              </span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setRegularizarNovoSaldo('');
                setIsRegularizarModalOpen(false);
              }}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasValidInput || diff === 0 || isSyncing}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                !hasValidInput || diff === 0 || isSyncing
                  ? 'bg-slate-400 dark:bg-slate-700 opacity-50 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 cursor-pointer active:scale-95'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Confirmar Regularização
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

