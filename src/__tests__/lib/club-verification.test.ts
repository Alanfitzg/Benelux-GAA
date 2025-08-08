import { checkVerificationRequirements, canVerifyClub } from '@/lib/club-verification';

describe('Club Verification', () => {
  describe('checkVerificationRequirements', () => {
    const baseClub = {
      id: 'club1',
      name: 'Test GAA Club',
      location: 'Dublin, Ireland',
      contactEmail: 'test@example.com',
      description: 'A great GAA club',
      latitude: 53.3498,
      longitude: -6.2603,
      teamTypes: ['SENIOR_MENS'],
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactPhone: '+353851234567',
      imageUrl: 'https://example.com/image.jpg',
      codes: 'DUBLIN01',
      verificationStatus: 'UNVERIFIED' as const,
    };

    it('should check all requirements for a complete club', () => {
      const requirements = checkVerificationRequirements(baseClub);
      
      expect(requirements.hasTeamTypes).toBe(true);
      expect(requirements.hasContactInfo).toBe(true);
      expect(requirements.hasLocation).toBe(true);
      expect(requirements.hasLogo).toBe(true);
      expect(requirements.profileCompleteness).toBeGreaterThanOrEqual(80);
      expect(canVerifyClub(requirements)).toBe(true);
    });

    it('should fail when team types are missing', () => {
      const club = { ...baseClub, teamTypes: [] };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.hasTeamTypes).toBe(false);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should fail when contact info is incomplete', () => {
      const club = { ...baseClub, contactFirstName: null };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.hasContactInfo).toBe(false);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should fail when location is missing', () => {
      const club = { ...baseClub, location: null, latitude: null, longitude: null };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.hasLocation).toBe(false);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should fail when profile completeness is below 80%', () => {
      const club = { 
        ...baseClub, 
        contactPhone: null,
        imageUrl: null,
        codes: null,
      };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.profileCompleteness).toBeLessThan(80);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should handle clubs with all optional fields missing', () => {
      const club = {
        id: 'club2',
        name: 'Minimal Club',
        location: 'Cork, Ireland',
        contactEmail: 'minimal@example.com',
        teamTypes: ['SENIOR_WOMENS'],
        contactFirstName: 'Jane',
        contactLastName: 'Smith',
        latitude: 51.8985,
        longitude: -8.4756,
        contactPhone: null,
        imageUrl: null,
        codes: null,
        verificationStatus: 'UNVERIFIED' as const,
      };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.profileCompleteness).toBeLessThan(80);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should handle empty email', () => {
      const club = { ...baseClub, contactEmail: '' };
      const requirements = checkVerificationRequirements(club);
      
      expect(requirements.hasContactInfo).toBe(false);
      expect(canVerifyClub(requirements)).toBe(false);
    });

    it('should handle zero coordinates', () => {
      const club = { ...baseClub, latitude: 0, longitude: 0 };
      const requirements = checkVerificationRequirements(club);
      
      // The function uses truthy check for coordinates, so 0 values are considered false
      expect(requirements.hasLocation).toBe(false);
      expect(canVerifyClub(requirements)).toBe(false);
    });
  });

});