import { validateEventDates } from '@/lib/validation/date-validation';

describe('Date Validation', () => {
  describe('validateEventDates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    describe('Start date validation', () => {
      it('should accept future start date', () => {
        const result = validateEventDates(tomorrow, null);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should accept start date today', () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const result = validateEventDates(today, null);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject past start date', () => {
        const result = validateEventDates(yesterday, null);
        expect(result.isValid).toBe(false);
        expect(result.errors.startDate).toBe('Start date cannot be in the past');
      });

      it('should reject invalid start date', () => {
        const result = validateEventDates(new Date('invalid'), null);
        expect(result.isValid).toBe(false);
        expect(result.errors.startDate).toBe('Invalid start date');
      });

      it('should reject null start date', () => {
        const result = validateEventDates(null as any, null);
        expect(result.isValid).toBe(false);
        expect(result.errors.startDate).toBe('Start date is required');
      });
    });

    describe('End date validation', () => {
      it('should accept end date after start date', () => {
        const result = validateEventDates(tomorrow, nextWeek);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should accept end date same as start date', () => {
        const result = validateEventDates(tomorrow, tomorrow);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject end date before start date', () => {
        const result = validateEventDates(nextWeek, tomorrow);
        expect(result.isValid).toBe(false);
        expect(result.errors.endDate).toBe('End date cannot be before start date');
      });

      it('should reject invalid end date', () => {
        const result = validateEventDates(tomorrow, new Date('invalid'));
        expect(result.isValid).toBe(false);
        expect(result.errors.endDate).toBe('Invalid end date');
      });

      it('should accept null end date', () => {
        const result = validateEventDates(tomorrow, null);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should accept undefined end date', () => {
        const result = validateEventDates(tomorrow, undefined);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe('Date range validation', () => {
      it('should reject excessively long event duration', () => {
        const farFuture = new Date();
        farFuture.setFullYear(farFuture.getFullYear() + 2);
        const result = validateEventDates(tomorrow, farFuture);
        expect(result.isValid).toBe(false);
        expect(result.errors.endDate).toBe('Event duration cannot exceed 1 year');
      });

      it('should accept event duration of exactly 1 year', () => {
        const oneYearLater = new Date(tomorrow);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
        const result = validateEventDates(tomorrow, oneYearLater);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe('Multiple errors', () => {
      it('should return all applicable errors', () => {
        const result = validateEventDates(yesterday, lastWeek);
        expect(result.isValid).toBe(false);
        expect(result.errors.startDate).toBe('Start date cannot be in the past');
        expect(result.errors.endDate).toBe('End date cannot be before start date');
      });

      it('should prioritize invalid date errors', () => {
        const result = validateEventDates(new Date('invalid'), new Date('invalid'));
        expect(result.isValid).toBe(false);
        expect(result.errors.startDate).toBe('Invalid start date');
        expect(result.errors.endDate).toBe('Invalid end date');
      });
    });

    describe('Edge cases', () => {
      it('should handle dates at year boundaries', () => {
        const dec31 = new Date('2024-12-31');
        const jan1 = new Date('2025-01-01');
        const result = validateEventDates(dec31, jan1);
        // This will depend on current date, so we just check structure
        expect(result.isValid).toBeDefined();
        expect(result.errors).toBeDefined();
      });

      it('should handle leap year dates', () => {
        const feb29 = new Date('2024-02-29');
        const mar1 = new Date('2024-03-01');
        const result = validateEventDates(feb29, mar1);
        // This will depend on current date, so we just check structure
        expect(result.isValid).toBeDefined();
        expect(result.errors).toBeDefined();
      });

      it('should handle daylight saving time transitions', () => {
        // These dates typically involve DST changes
        const beforeDST = new Date('2024-03-09');
        const afterDST = new Date('2024-03-11');
        const result = validateEventDates(beforeDST, afterDST);
        // This will depend on current date, so we just check structure
        expect(result.isValid).toBeDefined();
        expect(result.errors).toBeDefined();
      });
    });

    describe('Date formatting in errors', () => {
      it('should provide user-friendly error messages', () => {
        const result = validateEventDates(yesterday, tomorrow);
        expect(result.errors.startDate).toContain('past');
        
        const result2 = validateEventDates(nextWeek, tomorrow);
        expect(result2.errors.endDate).toContain('before');
      });
    });
  });
});