/**
 * Utilitários puros para formatação e manipulação de texto, valores e categorias.
 * Segue o Princípio da Responsabilidade Única (SRP) e Clean Code.
 */

/**
 * Converte a primeira letra de cada palavra em maiúscula e as demais em minúscula.
 * @param {string} str
 * @returns {string}
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
    .join(' ');
};

/**
 * Escapa caracteres especiais para uso seguro em expressões regulares.
 * @param {string} string
 * @returns {string}
 */
export const escapeRegExp = (string) => {
  if (!string) return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Converte strings em formato pt-BR (ex: "1.234,56" ou 1234.56) para float.
 * @param {string|number} valueString
 * @returns {number}
 */
export const parseBRL = (valueString) => {
  if (valueString === null || valueString === undefined) return 0;
  if (typeof valueString === 'number') return isNaN(valueString) ? 0 : valueString;
  const limpo = valueString.toString().replace(/\./g, '').replace(',', '.');
  return parseFloat(limpo) || 0;
};

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (R$ 0,00).
 * @param {number|string} val
 * @returns {string}
 */
export const formatCurrency = (val) => {
  const num = typeof val === 'string' ? parseFloat(val) || 0 : (val || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num);
};

/**
 * Formata datas YYYY-MM-DD para DD/MM/AAAA ou YYYY-MM para 01/MM/AAAA.
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
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
};

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Retorna o nome por extenso do mês (ex: "Novembro de 2026") a partir de "YYYY-MM".
 * @param {string} monthStr
 * @returns {string}
 */
export const formatCCModalMonthName = (monthStr) => {
  if (!monthStr) return '';
  const parts = monthStr.split('-');
  if (parts.length < 2) return monthStr;
  const [year, month] = parts;
  const idx = parseInt(month, 10) - 1;
  return idx >= 0 && idx < 12 ? `${MONTH_NAMES[idx]} de ${year}` : monthStr;
};

/**
 * Retorna a string do mês atual no formato "YYYY-MM".
 * @returns {string}
 */
export const getTodayMonthStr = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Normaliza e limpa o nome do motivo de poupança (sem acentos e minúsculo).
 * @param {string} name
 * @returns {string}
 */
export const cleanMotivo = (name) => {
  if (!name) return '';
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
};

const CATEGORY_ICONS = {
  'Casa': '🏠',
  'Saúde': '🩺',
  'Dízimo': '🙏',
  'Transporte': '🚗',
  'Despesas Pessoais': '👤',
  'Dinheiro Guardado': '🏦',
  'Guardar Dinheiro': '🏦',
  'Lazer': '🍿',
  'Investimentos': '📈',
  'Alimentação': '🍲',
  'Educação': '📚',
  'Imprevistos': '⚠️',
  'Salário': '💵',
  'Renda Extra': '💸',
  'Transferência': '🔄',
  'Cartão de Crédito': '💳',
  'Ajuste de Saldo': '⚖️'
};

/**
 * Retorna o emoji associado à categoria informada.
 * @param {string} category
 * @returns {string}
 */
export const getCategoryIcon = (category) => {
  return CATEGORY_ICONS[category] || '💰';
};
