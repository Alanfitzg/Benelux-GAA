import { validatePitchData } from '@/lib/validation/pitch-validation';

describe('Pitch Validation', () => {
  describe('validatePitchData', () => {
    const validPitchData = {
      name: 'Test Pitch',
      city: 'Dublin',
      latitude: 53.3498,
      longitude: -6.2603,
    };

    describe('Required fields validation', () => {
      it('should validate correct pitch data', () => {
        const result = validatePitchData(validPitchData);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject empty pitch name', () => {
        const data = { ...validPitchData, name: '' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Pitch name is required');
      });

      it('should reject pitch name with only whitespace', () => {
        const data = { ...validPitchData, name: '   ' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Pitch name is required');
      });

      it('should reject pitch name over 100 characters', () => {
        const data = { ...validPitchData, name: 'a'.repeat(101) };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.name).toBe('Pitch name must be less than 100 characters');
      });

      it('should reject empty city', () => {
        const data = { ...validPitchData, city: '' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.city).toBe('City is required');
      });

      it('should reject invalid latitude', () => {
        const data = { ...validPitchData, latitude: NaN };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.latitude).toBe('Valid latitude is required');
      });

      it('should reject latitude out of range', () => {
        const data1 = { ...validPitchData, latitude: -91 };
        const result1 = validatePitchData(data1);
        expect(result1.isValid).toBe(false);
        expect(result1.errors.latitude).toBe('Latitude must be between -90 and 90');

        const data2 = { ...validPitchData, latitude: 91 };
        const result2 = validatePitchData(data2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors.latitude).toBe('Latitude must be between -90 and 90');
      });

      it('should reject invalid longitude', () => {
        const data = { ...validPitchData, longitude: NaN };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.longitude).toBe('Valid longitude is required');
      });

      it('should reject longitude out of range', () => {
        const data1 = { ...validPitchData, longitude: -181 };
        const result1 = validatePitchData(data1);
        expect(result1.isValid).toBe(false);
        expect(result1.errors.longitude).toBe('Longitude must be between -180 and 180');

        const data2 = { ...validPitchData, longitude: 181 };
        const result2 = validatePitchData(data2);
        expect(result2.isValid).toBe(false);
        expect(result2.errors.longitude).toBe('Longitude must be between -180 and 180');
      });
    });

    describe('Optional numeric fields validation', () => {
      it('should accept valid number of pitches', () => {
        const data = { ...validPitchData, numberOfPitches: 3 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject negative number of pitches', () => {
        const data = { ...validPitchData, numberOfPitches: -1 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.numberOfPitches).toBe('Number of pitches must be positive');
      });

      it('should reject excessive number of pitches', () => {
        const data = { ...validPitchData, numberOfPitches: 101 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.numberOfPitches).toBe('Number of pitches seems unrealistic (max 100)');
      });

      it('should accept valid player capacity', () => {
        const data = { ...validPitchData, maxPlayerCapacity: 50 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject negative player capacity', () => {
        const data = { ...validPitchData, maxPlayerCapacity: -1 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.maxPlayerCapacity).toBe('Player capacity must be positive');
      });

      it('should reject excessive player capacity', () => {
        const data = { ...validPitchData, maxPlayerCapacity: 10001 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.maxPlayerCapacity).toBe('Player capacity seems unrealistic (max 10000)');
      });

      it('should accept valid spectator capacity', () => {
        const data = { ...validPitchData, maxSpectatorCapacity: 5000 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject negative spectator capacity', () => {
        const data = { ...validPitchData, maxSpectatorCapacity: -1 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.maxSpectatorCapacity).toBe('Spectator capacity must be positive');
      });

      it('should reject excessive spectator capacity', () => {
        const data = { ...validPitchData, maxSpectatorCapacity: 100001 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.maxSpectatorCapacity).toBe('Spectator capacity seems unrealistic (max 100000)');
      });

      it('should accept valid tournament capacity', () => {
        const data = { ...validPitchData, tournamentCapacity: 20 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject negative tournament capacity', () => {
        const data = { ...validPitchData, tournamentCapacity: -1 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.tournamentCapacity).toBe('Tournament capacity must be positive');
      });

      it('should reject excessive tournament capacity', () => {
        const data = { ...validPitchData, tournamentCapacity: 501 };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.tournamentCapacity).toBe('Tournament capacity seems unrealistic (max 500 teams)');
      });

      it('should allow null for optional numeric fields', () => {
        const data = {
          ...validPitchData,
          numberOfPitches: null,
          maxPlayerCapacity: null,
          maxSpectatorCapacity: null,
          tournamentCapacity: null,
        };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe('Contact information validation', () => {
      it('should accept valid email', () => {
        const data = { ...validPitchData, contactEmail: 'test@example.com' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject invalid email format', () => {
        const data = { ...validPitchData, contactEmail: 'invalid-email' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.contactEmail).toBe('Invalid email format');
      });

      it('should accept valid phone number', () => {
        const data = { ...validPitchData, contactPhone: '+353851234567' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should reject phone number that is too short', () => {
        const data = { ...validPitchData, contactPhone: '123' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.contactPhone).toBe('Phone number seems too short');
      });

      it('should reject phone number that is too long', () => {
        const data = { ...validPitchData, contactPhone: '+12345678901234567890' };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(result.errors.contactPhone).toBe('Phone number seems too long');
      });

      it('should allow null for optional contact fields', () => {
        const data = {
          ...validPitchData,
          contactEmail: null,
          contactPhone: null,
        };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe('Multiple errors', () => {
      it('should return all validation errors', () => {
        const data = {
          name: '',
          city: '',
          latitude: 200,
          longitude: -200,
          numberOfPitches: -5,
          contactEmail: 'not-an-email',
        };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(false);
        expect(Object.keys(result.errors).length).toBeGreaterThan(1);
        expect(result.errors.name).toBeDefined();
        expect(result.errors.city).toBeDefined();
        expect(result.errors.latitude).toBeDefined();
        expect(result.errors.longitude).toBeDefined();
        expect(result.errors.numberOfPitches).toBeDefined();
        expect(result.errors.contactEmail).toBeDefined();
      });
    });

    describe('Edge cases', () => {
      it('should accept boundary values for coordinates', () => {
        const data1 = { ...validPitchData, latitude: -90, longitude: -180 };
        const result1 = validatePitchData(data1);
        expect(result1.isValid).toBe(true);

        const data2 = { ...validPitchData, latitude: 90, longitude: 180 };
        const result2 = validatePitchData(data2);
        expect(result2.isValid).toBe(true);
      });

      it('should accept zero for numeric fields', () => {
        const data = {
          ...validPitchData,
          numberOfPitches: 0,
          maxPlayerCapacity: 0,
          maxSpectatorCapacity: 0,
          tournamentCapacity: 0,
        };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it('should trim whitespace from string fields', () => {
        const data = {
          ...validPitchData,
          name: '  Test Pitch  ',
          city: '  Dublin  ',
        };
        const result = validatePitchData(data);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });
  });
});