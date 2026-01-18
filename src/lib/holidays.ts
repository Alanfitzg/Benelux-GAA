import { isSameDay, getYear } from "date-fns";

export interface BankHoliday {
  date: Date;
  name: string;
  country: "IE" | "GB";
}

export function getIrishBankHolidays(year: number): BankHoliday[] {
  const holidays: BankHoliday[] = [];

  // New Year's Day - January 1
  holidays.push({
    date: new Date(year, 0, 1),
    name: "New Year's Day",
    country: "IE",
  });

  // St. Brigid's Day - First Monday of February (since 2023)
  const stBrigidsDay = getFirstMondayOfMonth(year, 1);
  holidays.push({
    date: stBrigidsDay,
    name: "St. Brigid's Day",
    country: "IE",
  });

  // St. Patrick's Day - March 17
  holidays.push({
    date: new Date(year, 2, 17),
    name: "St. Patrick's Day",
    country: "IE",
  });

  // Easter Monday - variable
  const easterMonday = getEasterMonday(year);
  holidays.push({
    date: easterMonday,
    name: "Easter Monday",
    country: "IE",
  });

  // May Bank Holiday - First Monday of May
  const mayBankHoliday = getFirstMondayOfMonth(year, 4);
  holidays.push({
    date: mayBankHoliday,
    name: "May Bank Holiday",
    country: "IE",
  });

  // June Bank Holiday - First Monday of June
  const juneBankHoliday = getFirstMondayOfMonth(year, 5);
  holidays.push({
    date: juneBankHoliday,
    name: "June Bank Holiday",
    country: "IE",
  });

  // August Bank Holiday - First Monday of August
  const augustBankHoliday = getFirstMondayOfMonth(year, 7);
  holidays.push({
    date: augustBankHoliday,
    name: "August Bank Holiday",
    country: "IE",
  });

  // October Bank Holiday - Last Monday of October
  const octoberBankHoliday = getLastMondayOfMonth(year, 9);
  holidays.push({
    date: octoberBankHoliday,
    name: "October Bank Holiday",
    country: "IE",
  });

  // Christmas Day - December 25
  holidays.push({
    date: new Date(year, 11, 25),
    name: "Christmas Day",
    country: "IE",
  });

  // St. Stephen's Day - December 26
  holidays.push({
    date: new Date(year, 11, 26),
    name: "St. Stephen's Day",
    country: "IE",
  });

  return holidays;
}

export function getBritishBankHolidays(year: number): BankHoliday[] {
  const holidays: BankHoliday[] = [];

  // New Year's Day - January 1 (or nearest weekday)
  holidays.push({
    date: new Date(year, 0, 1),
    name: "New Year's Day",
    country: "GB",
  });

  // Good Friday - variable
  const goodFriday = getGoodFriday(year);
  holidays.push({
    date: goodFriday,
    name: "Good Friday",
    country: "GB",
  });

  // Easter Monday - variable
  const easterMonday = getEasterMonday(year);
  holidays.push({
    date: easterMonday,
    name: "Easter Monday",
    country: "GB",
  });

  // Early May Bank Holiday - First Monday of May
  const earlyMayBankHoliday = getFirstMondayOfMonth(year, 4);
  holidays.push({
    date: earlyMayBankHoliday,
    name: "Early May Bank Holiday",
    country: "GB",
  });

  // Spring Bank Holiday - Last Monday of May
  const springBankHoliday = getLastMondayOfMonth(year, 4);
  holidays.push({
    date: springBankHoliday,
    name: "Spring Bank Holiday",
    country: "GB",
  });

  // Summer Bank Holiday - Last Monday of August
  const summerBankHoliday = getLastMondayOfMonth(year, 7);
  holidays.push({
    date: summerBankHoliday,
    name: "Summer Bank Holiday",
    country: "GB",
  });

  // Christmas Day - December 25
  holidays.push({
    date: new Date(year, 11, 25),
    name: "Christmas Day",
    country: "GB",
  });

  // Boxing Day - December 26
  holidays.push({
    date: new Date(year, 11, 26),
    name: "Boxing Day",
    country: "GB",
  });

  return holidays;
}

export function getAllBankHolidays(year: number): BankHoliday[] {
  return [...getIrishBankHolidays(year), ...getBritishBankHolidays(year)];
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

export function isBankHoliday(
  date: Date,
  country?: "IE" | "GB"
): BankHoliday | null {
  const year = getYear(date);
  const holidays = country
    ? country === "IE"
      ? getIrishBankHolidays(year)
      : getBritishBankHolidays(year)
    : getAllBankHolidays(year);

  return holidays.find((h) => isSameDay(h.date, date)) || null;
}

export function isWeekendOrHoliday(date: Date, country?: "IE" | "GB"): boolean {
  return isWeekend(date) || isBankHoliday(date, country) !== null;
}

export function shouldShowOnMobileCalendar(
  date: Date,
  country?: "IE" | "GB"
): boolean {
  return isWeekendOrHoliday(date, country);
}

// Helper functions for calculating variable holidays

function getFirstMondayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const daysUntilMonday =
    dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  return new Date(year, month, 1 + daysUntilMonday);
}

function getLastMondayOfMonth(year: number, month: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return new Date(year, month + 1, -daysFromMonday);
}

function getEasterSunday(year: number): Date {
  // Anonymous Gregorian algorithm
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
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getEasterMonday(year: number): Date {
  const easterSunday = getEasterSunday(year);
  return new Date(year, easterSunday.getMonth(), easterSunday.getDate() + 1);
}

function getGoodFriday(year: number): Date {
  const easterSunday = getEasterSunday(year);
  return new Date(year, easterSunday.getMonth(), easterSunday.getDate() - 2);
}
