/**
 * Utilitários para extração e formatação de apelidos e descrições de Cartão de Crédito.
 * Segue o Princípio da Responsabilidade Única (SRP) e Clean Code.
 */

/**
 * Extrai o apelido do cartão embutido na subcategoria (ex: "[Nubank]").
 * Ignora marcadores de referência como "[Ref:...]".
 * @param {string} subcategoria
 * @returns {string|null}
 */
export const extractCardNickname = (subcategoria) => {
  if (!subcategoria || typeof subcategoria !== 'string') return null;
  const match = subcategoria.match(/\[(.*?)\]/);
  if (match && !match[1].startsWith('Ref:')) {
    return match[1].trim();
  }
  return null;
};

/**
 * Remove identificadores de cartão [Apelido] e parcelamento (X/Y) da descrição.
 * @param {string} subcategoria
 * @returns {string}
 */
export const cleanSubcategoryDescription = (subcategoria) => {
  if (!subcategoria || typeof subcategoria !== 'string') return '';
  return subcategoria
    .replace(/\[(?!Ref:).*?\]/g, '')
    .replace(/\s*\(\d+\/\d+\)/g, '')
    .trim();
};

/**
 * Formata a subcategoria combinando a descrição base, o apelido do cartão e a parcela.
 * @param {string} baseDesc
 * @param {string} cardNickname
 * @param {number} [currentParcela=1]
 * @param {number} [totalParcelas=1]
 * @returns {string}
 */
export const formatSubcategoryWithCard = (baseDesc, cardNickname, currentParcela = 1, totalParcelas = 1) => {
  const cleanBase = cleanSubcategoryDescription(baseDesc) || 'Compra Cartão';
  const cardPart = cardNickname && cardNickname.trim() ? ` [${cardNickname.trim()}]` : '';
  const parcelaPart = totalParcelas > 1 ? ` (${currentParcela}/${totalParcelas})` : '';
  return `${cleanBase}${cardPart}${parcelaPart}`;
};
