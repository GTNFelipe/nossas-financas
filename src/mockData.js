// Dados iniciais simulados para a planilha financeira familiar (Lucas & Carol)

/**
 * @typedef {'Receita' | 'Despesa'} TransactionType
 */

/**
 * @typedef {'Pago' | 'Pendente'} TransactionStatus
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} criado_em
 * @property {string} data_referencia
 * @property {TransactionType} tipo
 * @property {string} categoria
 * @property {string} subcategoria
 * @property {number} valor
 * @property {string} quem_pagou
 * @property {TransactionStatus} status
 */

/**
 * @typedef {Object} Poupanca
 * @property {string} id
 * @property {string} motivo
 * @property {number} valor
 */

export const TRANSACTION_TYPES = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa'
};

export const TRANSACTION_STATUS = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente'
};

export const CATEGORIES = {
  INVESTIMENTOS: 'Investimentos',
  CASA: 'Casa',
  DIZIMO: 'Dízimo',
  SAUDE: 'Saúde',
  LAZER: 'Lazer',
  TRANSPORTE: 'Transporte',
  DESPESAS_PESSOAIS: 'Despesas Pessoais',
  CARTAO_DE_CREDITO: 'Cartão de Crédito'
};

/** @type {Transaction[]} */
export const initialTransactions = [
  // --- MÊS ATUAL: MAIO 2026 ---
  {
    id: 't1',
    criado_em: '2026-05-01T08:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.RECEITA,
    categoria: CATEGORIES.INVESTIMENTOS,
    subcategoria: 'Proventos & Salários',
    valor: 7500.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't2',
    criado_em: '2026-05-01T09:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.RECEITA,
    categoria: CATEGORIES.INVESTIMENTOS,
    subcategoria: 'Salário Carol',
    valor: 6800.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't3',
    criado_em: '2026-05-05T14:30:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CASA,
    subcategoria: 'Aluguel & Condomínio',
    valor: 2200.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't4',
    criado_em: '2026-05-08T18:15:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.DIZIMO,
    subcategoria: 'Contribuição Mensal',
    valor: 1430.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't5',
    criado_em: '2026-05-10T10:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.SAUDE,
    subcategoria: 'Plano de Saúde',
    valor: 450.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't6',
    criado_em: '2026-05-12T12:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.LAZER,
    subcategoria: 'Jantar Restaurante',
    valor: 280.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't7',
    criado_em: '2026-05-15T15:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.TRANSPORTE,
    subcategoria: 'Combustível',
    valor: 180.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't8',
    criado_em: '2026-05-18T19:30:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.LAZER,
    subcategoria: 'Cinema & Pipoca',
    valor: 110.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't9',
    criado_em: '2026-05-22T11:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.DESPESAS_PESSOAIS,
    subcategoria: 'Compras Online',
    valor: 350.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't10',
    criado_em: '2026-05-25T16:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.LAZER,
    subcategoria: 'Viagem de Fim de Semana',
    valor: 300.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PENDENTE
  },
  {
    id: 't_cc_1',
    criado_em: '2026-05-10T14:20:00Z',
    data_referencia: '2026-05-10',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CARTAO_DE_CREDITO,
    subcategoria: 'Assinatura Netflix',
    valor: 55.90,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't_cc_2',
    criado_em: '2026-05-12T19:45:00Z',
    data_referencia: '2026-05-12',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CARTAO_DE_CREDITO,
    subcategoria: 'Supermercado Carrefour',
    valor: 350.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PENDENTE
  },
  // --- EDGE CASE: Missing subcategoria & negative valid value handling logic test ---
  {
    id: 't_edge_1',
    criado_em: '2026-05-28T10:00:00Z',
    data_referencia: '2026-05',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CASA,
    subcategoria: 'Taxa Bancária Imprevista',
    valor: 15.50,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },

  // --- MÊS ANTERIOR: ABRIL 2026 ---
  {
    id: 't11',
    criado_em: '2026-04-01T08:00:00Z',
    data_referencia: '2026-04',
    tipo: TRANSACTION_TYPES.RECEITA,
    categoria: CATEGORIES.INVESTIMENTOS,
    subcategoria: 'Salários',
    valor: 14300.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't12',
    criado_em: '2026-04-05T10:00:00Z',
    data_referencia: '2026-04',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CASA,
    subcategoria: 'Aluguel/Contas',
    valor: 2400.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't13',
    criado_em: '2026-04-12T19:00:00Z',
    data_referencia: '2026-04',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.LAZER,
    subcategoria: 'Passeio & Shows',
    valor: 650.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't14',
    criado_em: '2026-04-15T14:00:00Z',
    data_referencia: '2026-04',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.INVESTIMENTOS,
    subcategoria: 'Aplicações Renda Fixa',
    valor: 3000.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't15',
    criado_em: '2026-04-20T11:00:00Z',
    data_referencia: '2026-04',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.SAUDE,
    subcategoria: 'Dentista',
    valor: 200.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  },

  // --- MÊS ANTERIOR: MARÇO 2026 ---
  {
    id: 't16',
    criado_em: '2026-03-01T08:00:00Z',
    data_referencia: '2026-03',
    tipo: TRANSACTION_TYPES.RECEITA,
    categoria: CATEGORIES.INVESTIMENTOS,
    subcategoria: 'Salários',
    valor: 14300.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't17',
    criado_em: '2026-03-05T10:00:00Z',
    data_referencia: '2026-03',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.CASA,
    subcategoria: 'Aluguel/Contas',
    valor: 2350.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't18',
    criado_em: '2026-03-15T15:00:00Z',
    data_referencia: '2026-03',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.LAZER,
    subcategoria: 'Show ao Vivo',
    valor: 920.00,
    quem_pagou: 'Lucas',
    status: TRANSACTION_STATUS.PAGO
  },
  {
    id: 't19',
    criado_em: '2026-03-22T09:00:00Z',
    data_referencia: '2026-03',
    tipo: TRANSACTION_TYPES.DESPESA,
    categoria: CATEGORIES.TRANSPORTE,
    subcategoria: 'Manutenção Carro',
    valor: 450.00,
    quem_pagou: 'Carol',
    status: TRANSACTION_STATUS.PAGO
  }
];

/** @type {Poupanca[]} */
export const initialPoupanca = [
  { id: 'p1', motivo: 'Total', valor: 15000.00 },
  { id: 'p2', motivo: 'Reserva de Emergência', valor: 8000.00 },
  { id: 'p3', motivo: 'Viagens', valor: 4000.00 },
  { id: 'p4', motivo: 'Investimentos a Longo Prazo', valor: 3000.00 }
];
