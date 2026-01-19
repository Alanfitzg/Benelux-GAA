/**
 * Bank Holiday Calendar for GAA Travel Analysis
 * Covers key source markets (Ireland, UK) and destination markets (Spain, Portugal, etc.)
 *
 * Bank holidays are prime travel windows for GAA clubs
 */

export interface BankHoliday {
  date: string; // ISO date string YYYY-MM-DD
  name: string;
  country: string;
  countryCode: string;
  isLongWeekend: boolean; // True if creates a 3+ day weekend
  travelWindow: {
    start: string;
    end: string;
  };
}

// Helper to calculate travel window (typically Thursday before to Tuesday after for long weekends)
function getTravelWindow(
  holidayDate: string,
  isLongWeekend: boolean
): { start: string; end: string } {
  const date = new Date(holidayDate);
  const dayOfWeek = date.getDay();

  if (isLongWeekend) {
    // For long weekends, travel window is Thursday to Tuesday
    const start = new Date(date);
    const end = new Date(date);

    // Find the Thursday before (or the Thursday if holiday is on Thursday)
    const daysToThursday = (dayOfWeek + 7 - 4) % 7;
    start.setDate(start.getDate() - daysToThursday);

    // Find the Tuesday after
    const daysToTuesday = (9 - dayOfWeek) % 7 || 7;
    end.setDate(end.getDate() + daysToTuesday);

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  } else {
    // For single day holidays, window is day before to day after
    const start = new Date(date);
    const end = new Date(date);
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() + 1);

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  }
}

// 2025 Bank Holidays
export const bankHolidays2025: BankHoliday[] = [
  // Ireland 2025
  {
    date: "2025-01-01",
    name: "New Year's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-01-01", true),
  },
  {
    date: "2025-02-03",
    name: "St. Brigid's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-02-03", true),
  },
  {
    date: "2025-03-17",
    name: "St. Patrick's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-03-17", true),
  },
  {
    date: "2025-04-21",
    name: "Easter Monday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-21", true),
  },
  {
    date: "2025-05-05",
    name: "May Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-05-05", true),
  },
  {
    date: "2025-06-02",
    name: "June Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-06-02", true),
  },
  {
    date: "2025-08-04",
    name: "August Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-08-04", true),
  },
  {
    date: "2025-10-27",
    name: "October Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-10-27", true),
  },
  {
    date: "2025-12-25",
    name: "Christmas Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-25", true),
  },
  {
    date: "2025-12-26",
    name: "St. Stephen's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-26", true),
  },

  // UK 2025
  {
    date: "2025-01-01",
    name: "New Year's Day",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-01-01", true),
  },
  {
    date: "2025-04-18",
    name: "Good Friday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-18", true),
  },
  {
    date: "2025-04-21",
    name: "Easter Monday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-21", true),
  },
  {
    date: "2025-05-05",
    name: "Early May Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-05-05", true),
  },
  {
    date: "2025-05-26",
    name: "Spring Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-05-26", true),
  },
  {
    date: "2025-08-25",
    name: "Summer Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-08-25", true),
  },
  {
    date: "2025-12-25",
    name: "Christmas Day",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-25", true),
  },
  {
    date: "2025-12-26",
    name: "Boxing Day",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-26", true),
  },

  // Spain 2025 (National holidays - destinations)
  {
    date: "2025-01-01",
    name: "Año Nuevo",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-01-01", true),
  },
  {
    date: "2025-01-06",
    name: "Epifanía del Señor",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-01-06", true),
  },
  {
    date: "2025-04-18",
    name: "Viernes Santo",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-18", true),
  },
  {
    date: "2025-05-01",
    name: "Día del Trabajador",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-05-01", true),
  },
  {
    date: "2025-08-15",
    name: "Asunción de la Virgen",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-08-15", true),
  },
  {
    date: "2025-10-12",
    name: "Fiesta Nacional de España",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-10-12", true),
  },
  {
    date: "2025-11-01",
    name: "Todos los Santos",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: false,
    travelWindow: getTravelWindow("2025-11-01", false),
  },
  {
    date: "2025-12-06",
    name: "Día de la Constitución",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-06", true),
  },
  {
    date: "2025-12-08",
    name: "Inmaculada Concepción",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-08", true),
  },
  {
    date: "2025-12-25",
    name: "Navidad",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-25", true),
  },

  // Portugal 2025
  {
    date: "2025-01-01",
    name: "Ano Novo",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-01-01", true),
  },
  {
    date: "2025-04-18",
    name: "Sexta-feira Santa",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-18", true),
  },
  {
    date: "2025-04-25",
    name: "Dia da Liberdade",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-04-25", true),
  },
  {
    date: "2025-05-01",
    name: "Dia do Trabalhador",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-05-01", true),
  },
  {
    date: "2025-06-10",
    name: "Dia de Portugal",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-06-10", true),
  },
  {
    date: "2025-08-15",
    name: "Assunção de Nossa Senhora",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-08-15", true),
  },
  {
    date: "2025-10-05",
    name: "Implantação da República",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-10-05", true),
  },
  {
    date: "2025-11-01",
    name: "Todos os Santos",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: false,
    travelWindow: getTravelWindow("2025-11-01", false),
  },
  {
    date: "2025-12-01",
    name: "Restauração da Independência",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-01", true),
  },
  {
    date: "2025-12-08",
    name: "Imaculada Conceição",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-08", true),
  },
  {
    date: "2025-12-25",
    name: "Natal",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2025-12-25", true),
  },
];

// 2026 Bank Holidays
export const bankHolidays2026: BankHoliday[] = [
  // Ireland 2026
  {
    date: "2026-01-01",
    name: "New Year's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-01-01", true),
  },
  {
    date: "2026-02-02",
    name: "St. Brigid's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-02-02", true),
  },
  {
    date: "2026-03-17",
    name: "St. Patrick's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-03-17", true),
  },
  {
    date: "2026-04-06",
    name: "Easter Monday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-04-06", true),
  },
  {
    date: "2026-05-04",
    name: "May Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-05-04", true),
  },
  {
    date: "2026-06-01",
    name: "June Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-06-01", true),
  },
  {
    date: "2026-08-03",
    name: "August Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-08-03", true),
  },
  {
    date: "2026-10-26",
    name: "October Bank Holiday",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-10-26", true),
  },
  {
    date: "2026-12-25",
    name: "Christmas Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-25", true),
  },
  {
    date: "2026-12-26",
    name: "St. Stephen's Day",
    country: "Ireland",
    countryCode: "IE",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-26", true),
  },

  // UK 2026
  {
    date: "2026-01-01",
    name: "New Year's Day",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-01-01", true),
  },
  {
    date: "2026-04-03",
    name: "Good Friday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-04-03", true),
  },
  {
    date: "2026-04-06",
    name: "Easter Monday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-04-06", true),
  },
  {
    date: "2026-05-04",
    name: "Early May Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-05-04", true),
  },
  {
    date: "2026-05-25",
    name: "Spring Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-05-25", true),
  },
  {
    date: "2026-08-31",
    name: "Summer Bank Holiday",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-08-31", true),
  },
  {
    date: "2026-12-25",
    name: "Christmas Day",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-25", true),
  },
  {
    date: "2026-12-28",
    name: "Boxing Day (substitute)",
    country: "United Kingdom",
    countryCode: "GB",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-28", true),
  },

  // Spain 2026
  {
    date: "2026-01-01",
    name: "Año Nuevo",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-01-01", true),
  },
  {
    date: "2026-01-06",
    name: "Epifanía del Señor",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-01-06", true),
  },
  {
    date: "2026-04-03",
    name: "Viernes Santo",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-04-03", true),
  },
  {
    date: "2026-05-01",
    name: "Día del Trabajador",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-05-01", true),
  },
  {
    date: "2026-08-15",
    name: "Asunción de la Virgen",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: false,
    travelWindow: getTravelWindow("2026-08-15", false),
  },
  {
    date: "2026-10-12",
    name: "Fiesta Nacional de España",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-10-12", true),
  },
  {
    date: "2026-12-08",
    name: "Inmaculada Concepción",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-08", true),
  },
  {
    date: "2026-12-25",
    name: "Navidad",
    country: "Spain",
    countryCode: "ES",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-25", true),
  },

  // Portugal 2026
  {
    date: "2026-01-01",
    name: "Ano Novo",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-01-01", true),
  },
  {
    date: "2026-04-03",
    name: "Sexta-feira Santa",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-04-03", true),
  },
  {
    date: "2026-04-25",
    name: "Dia da Liberdade",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: false,
    travelWindow: getTravelWindow("2026-04-25", false),
  },
  {
    date: "2026-05-01",
    name: "Dia do Trabalhador",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-05-01", true),
  },
  {
    date: "2026-06-10",
    name: "Dia de Portugal",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-06-10", true),
  },
  {
    date: "2026-08-15",
    name: "Assunção de Nossa Senhora",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: false,
    travelWindow: getTravelWindow("2026-08-15", false),
  },
  {
    date: "2026-10-05",
    name: "Implantação da República",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-10-05", true),
  },
  {
    date: "2026-12-01",
    name: "Restauração da Independência",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-01", true),
  },
  {
    date: "2026-12-08",
    name: "Imaculada Conceição",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-08", true),
  },
  {
    date: "2026-12-25",
    name: "Natal",
    country: "Portugal",
    countryCode: "PT",
    isLongWeekend: true,
    travelWindow: getTravelWindow("2026-12-25", true),
  },
];

// Combined holidays for easy lookup
export const allBankHolidays: BankHoliday[] = [
  ...bankHolidays2025,
  ...bankHolidays2026,
];

// Get holidays by country
export function getHolidaysByCountry(countryCode: string): BankHoliday[] {
  return allBankHolidays.filter((h) => h.countryCode === countryCode);
}

// Get holidays in date range
export function getHolidaysInRange(
  startDate: Date,
  endDate: Date
): BankHoliday[] {
  return allBankHolidays.filter((h) => {
    const holidayDate = new Date(h.date);
    return holidayDate >= startDate && holidayDate <= endDate;
  });
}

// Check if a date falls within a bank holiday travel window
export function isInHolidayWindow(date: Date): BankHoliday | null {
  const dateStr = date.toISOString().split("T")[0];

  for (const holiday of allBankHolidays) {
    if (
      dateStr >= holiday.travelWindow.start &&
      dateStr <= holiday.travelWindow.end
    ) {
      return holiday;
    }
  }

  return null;
}

// Get unique holiday names across all countries (for grouping analysis)
export function getUniqueHolidayTypes(): string[] {
  const normalized = new Map<string, string>();

  // Map variations to canonical names
  const canonicalNames: Record<string, string> = {
    "New Year's Day": "New Year",
    "Ano Novo": "New Year",
    "Año Nuevo": "New Year",
    "Easter Monday": "Easter",
    "Good Friday": "Easter",
    "Viernes Santo": "Easter",
    "Sexta-feira Santa": "Easter",
    "Christmas Day": "Christmas",
    Navidad: "Christmas",
    Natal: "Christmas",
    "Boxing Day": "Christmas",
    "Boxing Day (substitute)": "Christmas",
    "St. Stephen's Day": "Christmas",
    "May Bank Holiday": "May Bank Holiday",
    "Early May Bank Holiday": "May Bank Holiday",
    "Día del Trabajador": "May Day/Labour Day",
    "Dia do Trabalhador": "May Day/Labour Day",
    "Spring Bank Holiday": "Late May Bank Holiday",
    "August Bank Holiday": "August Bank Holiday",
    "Summer Bank Holiday": "August Bank Holiday",
    "Asunción de la Virgen": "August Holiday",
    "Assunção de Nossa Senhora": "August Holiday",
  };

  allBankHolidays.forEach((h) => {
    const canonical = canonicalNames[h.name] || h.name;
    normalized.set(h.name, canonical);
  });

  return [...new Set(normalized.values())].sort();
}

// Country flags for display
export const countryFlags: Record<string, string> = {
  IE: "🇮🇪",
  GB: "🇬🇧",
  ES: "🇪🇸",
  PT: "🇵🇹",
};
