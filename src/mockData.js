// Dados iniciais simulados para a planilha financeira familiar (Lucas & Carol)


export const initialTransactions = [
  // --- MÊS ATUAL: MAIO 2026 ---
  {
    id: 't1',
    criado_em: '2026-05-01T08:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Receita',
    categoria: 'Investimentos',
    subcategoria: 'Proventos & Salários',
    valor: 7500.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't2',
    criado_em: '2026-05-01T09:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Receita',
    categoria: 'Investimentos',
    subcategoria: 'Salário Carol',
    valor: 6800.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't3',
    criado_em: '2026-05-05T14:30:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Casa',
    subcategoria: 'Aluguel & Condomínio',
    valor: 2200.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't4',
    criado_em: '2026-05-08T18:15:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Dízimo',
    subcategoria: 'Contribuição Mensal',
    valor: 1430.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't5',
    criado_em: '2026-05-10T10:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Saúde',
    subcategoria: 'Plano de Saúde',
    valor: 450.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't6',
    criado_em: '2026-05-12T12:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Lazer',
    subcategoria: 'Jantar Restaurante',
    valor: 280.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't7',
    criado_em: '2026-05-15T15:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Transporte',
    subcategoria: 'Combustível',
    valor: 180.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't8',
    criado_em: '2026-05-18T19:30:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Lazer',
    subcategoria: 'Cinema & Pipoca',
    valor: 110.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't9',
    criado_em: '2026-05-22T11:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Despesas Pessoais',
    subcategoria: 'Compras Online',
    valor: 350.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't10',
    criado_em: '2026-05-25T16:00:00Z',
    data_referencia: '2026-05',
    tipo: 'Despesa',
    categoria: 'Lazer',
    subcategoria: 'Viagem de Fim de Semana',
    valor: 300.00,
    quem_pagou: 'Lucas',
    status: 'Pendente' // ainda pendente para demonstrar visualmente
  },
  {
    id: 't_cc_1',
    criado_em: '2026-05-10T14:20:00Z',
    data_referencia: '2026-05-10',
    tipo: 'Despesa',
    categoria: 'Cartão de Crédito',
    subcategoria: 'Assinatura Netflix',
    valor: 55.90,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't_cc_2',
    criado_em: '2026-05-12T19:45:00Z',
    data_referencia: '2026-05-12',
    tipo: 'Despesa',
    categoria: 'Cartão de Crédito',
    subcategoria: 'Supermercado Carrefour',
    valor: 350.00,
    quem_pagou: 'Lucas',
    status: 'Pendente'
  },

  // --- MÊS ANTERIOR: ABRIL 2026 ---
  {
    id: 't11',
    criado_em: '2026-04-01T08:00:00Z',
    data_referencia: '2026-04',
    tipo: 'Receita',
    categoria: 'Investimentos',
    subcategoria: 'Salários',
    valor: 14300.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't12',
    criado_em: '2026-04-05T10:00:00Z',
    data_referencia: '2026-04',
    tipo: 'Despesa',
    categoria: 'Casa',
    subcategoria: 'Aluguel/Contas',
    valor: 2400.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't13',
    criado_em: '2026-04-12T19:00:00Z',
    data_referencia: '2026-04',
    tipo: 'Despesa',
    categoria: 'Lazer',
    subcategoria: 'Passeio & Shows',
    valor: 650.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't14',
    criado_em: '2026-04-15T14:00:00Z',
    data_referencia: '2026-04',
    tipo: 'Despesa',
    categoria: 'Investimentos',
    subcategoria: 'Aplicações Renda Fixa',
    valor: 3000.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },
  {
    id: 't15',
    criado_em: '2026-04-20T11:00:00Z',
    data_referencia: '2026-04',
    tipo: 'Despesa',
    categoria: 'Saúde',
    subcategoria: 'Dentista',
    valor: 200.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  },

  // --- MÊS ANTERIOR: MARÇO 2026 ---
  {
    id: 't16',
    criado_em: '2026-03-01T08:00:00Z',
    data_referencia: '2026-03',
    tipo: 'Receita',
    categoria: 'Investimentos',
    subcategoria: 'Salários',
    valor: 14300.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't17',
    criado_em: '2026-03-05T10:00:00Z',
    data_referencia: '2026-03',
    tipo: 'Despesa',
    categoria: 'Casa',
    subcategoria: 'Aluguel/Contas',
    valor: 2350.00,
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't18',
    criado_em: '2026-03-15T15:00:00Z',
    data_referencia: '2026-03',
    tipo: 'Despesa',
    categoria: 'Lazer',
    subcategoria: 'Show ao Vivo',
    valor: 920.00, // Estourou a meta de lazer do mês anterior para teste visual!
    quem_pagou: 'Lucas',
    status: 'Pago'
  },
  {
    id: 't19',
    criado_em: '2026-03-22T09:00:00Z',
    data_referencia: '2026-03',
    tipo: 'Despesa',
    categoria: 'Transporte',
    subcategoria: 'Manutenção Carro',
    valor: 450.00,
    quem_pagou: 'Carol',
    status: 'Pago'
  }
]

export const initialPoupanca = [
  { id: 'p1', motivo: 'Total', valor: 15000.00 },
  { id: 'p2', motivo: 'Reserva de Emergência', valor: 8000.00 },
  { id: 'p3', motivo: 'Viagens', valor: 4000.00 },
  { id: 'p4', motivo: 'Investimentos a Longo Prazo', valor: 3000.00 }
]
