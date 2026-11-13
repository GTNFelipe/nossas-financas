/**
 * Utilitários de manipulação de datas, cálculo de dias úteis e feriados brasileiros.
 * Segue o Princípio da Responsabilidade Única (SRP) e Clean Code.
 */

/**
 * Adiciona meses a uma data YYYY-MM-DD com ajuste para limites de dias no mês.
 * @param {string} dateStr
 * @param {number} monthsToAdd
 * @returns {string}
 */
export const addMonths = (dateStr, monthsToAdd) => {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const targetDate = new Date(year, month - 1 + monthsToAdd, 1);
  const maxDays = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
  targetDate.setDate(Math.min(day, maxDays));

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Calcula a data do Domingo de Páscoa pelo Algoritmo de Meeus/Jones/Butcher.
 * @param {number} year
 * @returns {Date}
 */
export const calculateEasterDate = (year) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easterMonth = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const easterDay = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, easterMonth, easterDay);
};

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Retorna os feriados nacionais e estaduais (SP/RJ) do Brasil para um determinado ano.
 * @param {number} year
 * @returns {string[]}
 */
export const getHolidaysForYear = (year) => {
  const fixedHolidays = [
    `${year}-01-01`, // Confraternização Universal
    `${year}-01-20`, // São Sebastião (RJ)
    `${year}-01-25`, // Aniversário de São Paulo
    `${year}-04-21`, // Tiradentes
    `${year}-04-23`, // São Jorge (RJ)
    `${year}-05-01`, // Dia do Trabalho
    `${year}-07-09`, // Revolução Constitucionalista (SP)
    `${year}-09-07`, // Independência
    `${year}-10-12`, // Nossa Senhora Aparecida
    `${year}-11-02`, // Finados
    `${year}-11-15`, // Proclamação da República
    `${year}-11-20`, // Consciência Negra
    `${year}-12-25`  // Natal
  ];

  const easter = calculateEasterDate(year);

  const sextaSanta = new Date(easter);
  sextaSanta.setDate(easter.getDate() - 2);

  const carnavalTerca = new Date(easter);
  carnavalTerca.setDate(easter.getDate() - 47);

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  return [
    ...fixedHolidays,
    toISODate(sextaSanta),
    toISODate(carnavalTerca),
    toISODate(corpusChristi)
  ];
};

/**
 * Retorna se um determinado dia é final de semana (sábado ou domingo).
 * @param {Date} date
 * @returns {boolean}
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Calcula total de dias úteis e dias úteis restantes no mês especificado ("YYYY-MM").
 * @param {string} monthStr
 * @returns {{ total: number, remaining: number }}
 */
export const getBusinessDaysInfo = (monthStr) => {
  if (!monthStr) return { total: 0, remaining: 0 };
  const parts = monthStr.split('-');
  if (parts.length !== 2) return { total: 0, remaining: 0 };

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidays = new Set(getHolidaysForYear(year));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDay = today.getDate();

  let total = 0;
  let remaining = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = toISODate(date);

    if (!isWeekend(date) && !holidays.has(dateStr)) {
      total++;
      if (isCurrentMonth && day >= currentDay) {
        remaining++;
      } else if (!isCurrentMonth && (today.getFullYear() < year || (today.getFullYear() === year && today.getMonth() < month))) {
        remaining++;
      }
    }
  }

  return { total, remaining };
};
