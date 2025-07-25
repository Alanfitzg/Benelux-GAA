import { isFeatureEnabled, getFeatureFlag, getAllFeatureFlags } from '@/lib/featureFlags';

describe('Feature Flags', () => {
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    const mockLocalStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
    jest.clearAllMocks();
  });

  describe('isFeatureEnabled', () => {
    it('should return default flag state when no localStorage override', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false); // Default state is disabled
      expect(localStorage.getItem).toHaveBeenCalledWith('featureFlags');
    });

    it('should return localStorage override when available', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(true);
    });

    it('should handle invalid localStorage data gracefully', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('invalid json');

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false); // Should fall back to default
    });

    it('should return false for non-existent flags', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = isFeatureEnabled('NON_EXISTENT_FLAG' as never);
      
      expect(result).toBe(false);
    });

    it('should handle localStorage being unavailable', () => {
      // Simulate environment without localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false);
    });

    it('should respect localStorage partial overrides', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
        // Other flags not specified, should use defaults
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      expect(isFeatureEnabled('USER_ONBOARDING')).toBe(true);
      // Test other flags use defaults - but we only have USER_ONBOARDING currently
    });
  });

  describe('getFeatureFlag', () => {
    it('should return complete flag object', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const flag = getFeatureFlag('USER_ONBOARDING');
      
      expect(flag).toEqual({
        id: 'USER_ONBOARDING',
        name: 'User Onboarding Flow',
        description: 'Show onboarding questionnaire for new users to capture travel preferences and motivations',
        enabled: false,
        experimental: true,
      });
    });

    it('should return flag with localStorage override applied', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      const flag = getFeatureFlag('USER_ONBOARDING');
      
      expect(flag).toEqual({
        id: 'USER_ONBOARDING',
        name: 'User Onboarding Flow',
        description: 'Show onboarding questionnaire for new users to capture travel preferences and motivations',
        enabled: true,
        experimental: true,
      });
    });

    it('should return undefined for non-existent flags', () => {
      const flag = getFeatureFlag('NON_EXISTENT_FLAG' as never);
      
      expect(flag).toBeUndefined();
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags with default states', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const flags = getAllFeatureFlags();
      
      expect(flags).toEqual({
        USER_ONBOARDING: {
          id: 'USER_ONBOARDING',
          name: 'User Onboarding Flow',
          description: 'Show onboarding questionnaire for new users to capture travel preferences and motivations',
          enabled: false,
          experimental: true,
        },
      });
    });

    it('should return all flags with localStorage overrides applied', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      const flags = getAllFeatureFlags();
      
      expect(flags.USER_ONBOARDING.enabled).toBe(true);
    });

    it('should handle partial localStorage overrides', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
        // If we had more flags, some would use defaults
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      const flags = getAllFeatureFlags();
      
      expect(flags.USER_ONBOARDING.enabled).toBe(true);
    });

    it('should ignore unknown flags in localStorage', () => {
      const mockFlags = JSON.stringify({
        USER_ONBOARDING: true,
        UNKNOWN_FLAG: true,
      });
      (localStorage.getItem as jest.Mock).mockReturnValue(mockFlags);

      const flags = getAllFeatureFlags();
      
      expect(flags.USER_ONBOARDING.enabled).toBe(true);
      expect('UNKNOWN_FLAG' in flags).toBe(false);
    });
  });

  describe('Feature Flag Configuration', () => {
    it('should have correct structure for USER_ONBOARDING flag', () => {
      const flag = getFeatureFlag('USER_ONBOARDING');
      
      expect(flag).toHaveProperty('id', 'USER_ONBOARDING');
      expect(flag).toHaveProperty('name', 'User Onboarding Flow');
      expect(flag).toHaveProperty('description');
      expect(flag).toHaveProperty('enabled', false);
      expect(flag).toHaveProperty('experimental', true);
      
      expect(typeof flag!.description).toBe('string');
      expect(flag!.description.length).toBeGreaterThan(10);
    });

    it('should mark onboarding as experimental feature', () => {
      const flag = getFeatureFlag('USER_ONBOARDING');
      
      expect(flag!.experimental).toBe(true);
    });

    it('should have onboarding disabled by default', () => {
      const flag = getFeatureFlag('USER_ONBOARDING');
      
      expect(flag!.enabled).toBe(false);
    });
  });

  describe('localStorage Integration', () => {
    it('should store overrides in localStorage with correct key', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      isFeatureEnabled('USER_ONBOARDING');
      
      expect(localStorage.getItem).toHaveBeenCalledWith('featureFlags');
    });

    it('should handle localStorage errors gracefully', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false); // Should fall back to default
    });

    it('should handle null localStorage values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false);
    });

    it('should handle empty string localStorage values', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('');

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(result).toBe(false);
    });
  });

  describe('Type Safety', () => {
    it('should only accept valid feature flag IDs', () => {
      // This is a compile-time check, but we can verify the runtime behavior
      const validResult = isFeatureEnabled('USER_ONBOARDING');
      expect(typeof validResult).toBe('boolean');

      // TypeScript should prevent invalid flag IDs at compile time
      // const invalidResult = isFeatureEnabled('INVALID_FLAG'); // Should not compile
    });

    it('should return boolean values only', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify({
        USER_ONBOARDING: 'true', // String instead of boolean
      }));

      const result = isFeatureEnabled('USER_ONBOARDING');
      
      expect(typeof result).toBe('boolean');
      expect(result).toBe(true); // Should convert truthy string to boolean
    });
  });
});