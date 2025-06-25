import {
  formatEventDate,
  formatEventDateRange,
  formatShortDate,
  isUpcoming,
  isPast,
  formatISO
} from '@/lib/utils/date';

describe('Date Utility Functions', () => {
  // Mock the current date for consistent testing
  const mockDate = new Date('2025-06-25T12:00:00Z');
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('formatEventDate', () => {
    it('should format a date string correctly', () => {
      const result = formatEventDate('2025-07-15');
      expect(result).toBe('July 15, 2025');
    });

    it('should format a Date object correctly', () => {
      const date = new Date('2025-12-25');
      const result = formatEventDate(date);
      expect(result).toBe('December 25, 2025');
    });

    it('should handle different date formats', () => {
      const result = formatEventDate('2025-01-01T10:30:00Z');
      expect(result).toBe('January 1, 2025');
    });
  });

  describe('formatEventDateRange', () => {
    it('should return single date when no end date provided', () => {
      const result = formatEventDateRange('2025-07-15');
      expect(result).toBe('July 15, 2025');
    });

    it('should return single date when start and end dates are the same', () => {
      const result = formatEventDateRange('2025-07-15', '2025-07-15');
      expect(result).toBe('July 15, 2025');
    });

    it('should return date range when dates are different', () => {
      const result = formatEventDateRange('2025-07-15', '2025-07-18');
      expect(result).toBe('July 15, 2025 - July 18, 2025');
    });

    it('should handle null end date', () => {
      const result = formatEventDateRange('2025-07-15', null);
      expect(result).toBe('July 15, 2025');
    });

    it('should handle Date objects', () => {
      const startDate = new Date('2025-07-15');
      const endDate = new Date('2025-07-20');
      const result = formatEventDateRange(startDate, endDate);
      expect(result).toBe('July 15, 2025 - July 20, 2025');
    });
  });

  describe('formatShortDate', () => {
    it('should format date in short format', () => {
      const result = formatShortDate('2025-07-15');
      expect(result).toBe('Jul 15, 2025');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-12-25');
      const result = formatShortDate(date);
      expect(result).toBe('Dec 25, 2025');
    });
  });

  describe('isUpcoming', () => {
    it('should return true for future dates', () => {
      const futureDate = '2025-12-31';
      expect(isUpcoming(futureDate)).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = '2025-01-01';
      expect(isUpcoming(pastDate)).toBe(false);
    });

    it('should return false for current date', () => {
      const currentDate = mockDate;
      expect(isUpcoming(currentDate)).toBe(false);
    });

    it('should handle Date objects', () => {
      const futureDate = new Date('2025-12-31');
      expect(isUpcoming(futureDate)).toBe(true);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const pastDate = '2025-01-01';
      expect(isPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = '2025-12-31';
      expect(isPast(futureDate)).toBe(false);
    });

    it('should return false for current date', () => {
      const currentDate = mockDate;
      expect(isPast(currentDate)).toBe(false);
    });

    it('should handle Date objects', () => {
      const pastDate = new Date('2025-01-01');
      expect(isPast(pastDate)).toBe(true);
    });
  });

  describe('formatISO', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2025-07-15T10:30:00Z');
      const result = formatISO(date);
      expect(result).toBe('2025-07-15T10:30:00.000Z');
    });

    it('should maintain timezone information', () => {
      const date = new Date('2025-12-25T15:45:30.123Z');
      const result = formatISO(date);
      expect(result).toBe('2025-12-25T15:45:30.123Z');
    });
  });
});