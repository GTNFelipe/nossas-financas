import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { initialTransactions, initialPoupanca } from '../mockData';

/**
 * Lança erros explícitos e tipados caso o Supabase falhe ou retorne dados inválidos.
 * Segue a regra do Code Sentinel: "Fail Fast" e "Explicit Error Handling".
 */
class ApiError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.originalError = originalError;
  }
}

/**
 * Busca todas as transações, ordenadas por data de criação.
 * @returns {Promise<import('../mockData').Transaction[]>}
 */
export async function fetchTransactions() {
  if (!isSupabaseConfigured) {
    console.warn("Modo Local Ativado: Supabase não configurado. Carregando mocks.");
    return [...initialTransactions];
  }

  try {
    const { data, error } = await supabase
      .from('transacoes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    
    // Fail Fast: Garante que um array sempre será retornado
    if (!data) return [];
    
    return data;
  } catch (err) {
    throw new ApiError('Falha ao buscar transações do banco de dados.', err);
  }
}

/**
 * Busca os dados de poupança.
 * @returns {Promise<import('../mockData').Poupanca[]>}
 */
export async function fetchPoupancas() {
  if (!isSupabaseConfigured) {
    return [...initialPoupanca];
  }

  try {
    const { data, error } = await supabase
      .from('poupancas')
      .select('*');

    if (error) {
      // Se a tabela não existir, cai aqui, trata graciosamente e retorna o mock como fallback.
      console.warn("Tabela 'poupancas' não encontrada ou erro de permissão.");
      return [...initialPoupanca];
    }
    
    return data || [];
  } catch (err) {
    console.warn("Erro ao buscar poupanças, usando dados iniciais.", err.message);
    return [...initialPoupanca];
  }
}
