import { 
  TRAVEL_MOTIVATIONS, 
  COMPETITIVE_LEVELS, 
  BUDGET_RANGES, 
  SEASONS 
} from '@/lib/constants/onboarding';

describe('Onboarding Constants', () => {
  describe('TRAVEL_MOTIVATIONS', () => {
    it('should contain all expected motivation keys', () => {
      const expectedKeys = [
        'weather_sun',
        'budget',
        'specific_location',
        'activities',
        'social',
        'tournament',
        'short_trip',
        'culture',
        'friends'
      ];

      const actualKeys = Object.keys(TRAVEL_MOTIVATIONS);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(9);
    });

    it('should have valid structure for each motivation', () => {
      Object.values(TRAVEL_MOTIVATIONS).forEach((motivation) => {
        expect(motivation).toHaveProperty('id');
        expect(motivation).toHaveProperty('label');
        expect(motivation).toHaveProperty('description');
        expect(motivation).toHaveProperty('icon');

        expect(typeof motivation.id).toBe('string');
        expect(typeof motivation.label).toBe('string');
        expect(typeof motivation.description).toBe('string');
        expect(typeof motivation.icon).toBe('string');

        expect(motivation.id.length).toBeGreaterThan(0);
        expect(motivation.label.length).toBeGreaterThan(0);
        expect(motivation.description.length).toBeGreaterThan(0);
        expect(motivation.icon.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs for each motivation', () => {
      const ids = Object.values(TRAVEL_MOTIVATIONS).map(m => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique labels for each motivation', () => {
      const labels = Object.values(TRAVEL_MOTIVATIONS).map(m => m.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it('should match key with motivation ID', () => {
      Object.entries(TRAVEL_MOTIVATIONS).forEach(([key, motivation]) => {
        expect(key).toBe(motivation.id);
      });
    });

    it('should have weather_sun motivation with correct properties', () => {
      const weather = TRAVEL_MOTIVATIONS.weather_sun;
      expect(weather.id).toBe('weather_sun');
      expect(weather.label).toBe('Sun & Warmth');
      expect(weather.description).toBe('Warm weather destinations');
      expect(weather.icon).toBe('☀️');
    });

    it('should have budget motivation with correct properties', () => {
      const budget = TRAVEL_MOTIVATIONS.budget;
      expect(budget.id).toBe('budget');
      expect(budget.label).toBe('Budget-Friendly');
      expect(budget.description).toBe('Affordable trips');
      expect(budget.icon).toBe('💰');
    });

    it('should have culture motivation with correct properties', () => {
      const culture = TRAVEL_MOTIVATIONS.culture;
      expect(culture.id).toBe('culture');
      expect(culture.label).toBe('Culture');
      expect(culture.description).toBe('Local experiences');
      expect(culture.icon).toBe('🏛️');
    });
  });

  describe('COMPETITIVE_LEVELS', () => {
    it('should contain all expected competitive level keys', () => {
      const expectedKeys = ['casual', 'mixed', 'competitive_irish', 'international', 'elite'];
      const actualKeys = Object.keys(COMPETITIVE_LEVELS);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(5);
    });

    it('should have valid structure for each level', () => {
      Object.values(COMPETITIVE_LEVELS).forEach((level) => {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('description');

        expect(typeof level.id).toBe('string');
        expect(typeof level.label).toBe('string');
        expect(typeof level.description).toBe('string');

        expect(level.id.length).toBeGreaterThan(0);
        expect(level.label.length).toBeGreaterThan(0);
        expect(level.description.length).toBeGreaterThan(0);
      });
    });

    it('should match key with level ID', () => {
      Object.entries(COMPETITIVE_LEVELS).forEach(([key, level]) => {
        expect(key).toBe(level.id);
      });
    });

    it('should have casual level with correct properties', () => {
      const casual = COMPETITIVE_LEVELS.casual;
      expect(casual.id).toBe('casual');
      expect(casual.label).toBe('Social & Fun');
      expect(casual.description).toBe('Just for the craic - focus on fun and meeting people');
    });

    it('should have competitive_irish level with correct properties', () => {
      const competitive = COMPETITIVE_LEVELS.competitive_irish;
      expect(competitive.id).toBe('competitive_irish');
      expect(competitive.label).toBe('Competitive Irish');
      expect(competitive.description).toBe('Match against similar Irish teams abroad');
    });

    it('should have elite level with correct properties', () => {
      const elite = COMPETITIVE_LEVELS.elite;
      expect(elite.id).toBe('elite');
      expect(elite.label).toBe('Elite Level');
      expect(elite.description).toBe('High-level competitive tournaments only');
    });
  });

  describe('BUDGET_RANGES', () => {
    it('should contain all expected budget range keys', () => {
      const expectedKeys = ['budget', 'mid-range', 'premium'];
      const actualKeys = Object.keys(BUDGET_RANGES);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(3);
    });

    it('should have valid structure for each range', () => {
      Object.values(BUDGET_RANGES).forEach((range) => {
        expect(range).toHaveProperty('id');
        expect(range).toHaveProperty('label');
        expect(range).toHaveProperty('description');

        expect(typeof range.id).toBe('string');
        expect(typeof range.label).toBe('string');
        expect(typeof range.description).toBe('string');

        expect(range.id.length).toBeGreaterThan(0);
        expect(range.label.length).toBeGreaterThan(0);
        expect(range.description.length).toBeGreaterThan(0);
      });
    });

    it('should match key with range ID', () => {
      Object.entries(BUDGET_RANGES).forEach(([key, range]) => {
        expect(key).toBe(range.id);
      });
    });

    it('should have budget range with correct properties', () => {
      const budget = BUDGET_RANGES.budget;
      expect(budget.id).toBe('budget');
      expect(budget.label).toBe('Budget');
      expect(budget.description).toBe('€0-200 per person');
    });

    it('should have mid-range with correct properties', () => {
      const midRange = BUDGET_RANGES['mid-range'];
      expect(midRange.id).toBe('mid-range');
      expect(midRange.label).toBe('Mid-Range');
      expect(midRange.description).toBe('€200-500 per person');
    });

    it('should have premium range with correct properties', () => {
      const premium = BUDGET_RANGES.premium;
      expect(premium.id).toBe('premium');
      expect(premium.label).toBe('Premium');
      expect(premium.description).toBe('€500+ per person');
    });
  });

  describe('SEASONS', () => {
    it('should contain all expected seasons', () => {
      const expectedIds = ['spring', 'summer', 'autumn', 'winter'];
      const actualIds = SEASONS.map(season => season.id);
      expect(actualIds).toEqual(expect.arrayContaining(expectedIds));
      expect(actualIds).toHaveLength(4);
    });

    it('should have valid structure for each season', () => {
      SEASONS.forEach((season) => {
        expect(season).toHaveProperty('id');
        expect(season).toHaveProperty('label');
        expect(season).toHaveProperty('icon');
        expect(season).toHaveProperty('months');

        expect(typeof season.id).toBe('string');
        expect(typeof season.label).toBe('string');
        expect(typeof season.icon).toBe('string');
        expect(Array.isArray(season.months)).toBe(true);

        expect(season.id.length).toBeGreaterThan(0);
        expect(season.label.length).toBeGreaterThan(0);
        expect(season.months.length).toBe(3);

        season.months.forEach(month => {
          expect(typeof month).toBe('string');
          expect(month.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have spring season with correct months', () => {
      const spring = SEASONS.find(s => s.id === 'spring');
      expect(spring!.id).toBe('spring');
      expect(spring!.label).toBe('Spring');
      expect(spring!.months).toEqual(['march', 'april', 'may']);
    });

    it('should have summer season with correct months', () => {
      const summer = SEASONS.find(s => s.id === 'summer');
      expect(summer!.id).toBe('summer');
      expect(summer!.label).toBe('Summer');
      expect(summer!.months).toEqual(['june', 'july', 'august']);
    });

    it('should have autumn season with correct months', () => {
      const autumn = SEASONS.find(s => s.id === 'autumn');
      expect(autumn!.id).toBe('autumn');
      expect(autumn!.label).toBe('Autumn');
      expect(autumn!.months).toEqual(['september', 'october', 'november']);
    });

    it('should have winter season with correct months', () => {
      const winter = SEASONS.find(s => s.id === 'winter');
      expect(winter!.id).toBe('winter');
      expect(winter!.label).toBe('Winter');
      expect(winter!.months).toEqual(['december', 'january', 'february']);
    });

    it('should cover all 12 months exactly once', () => {
      const allMonths = SEASONS.flatMap(season => season.months);
      const uniqueMonths = new Set(allMonths);
      
      expect(allMonths).toHaveLength(12);
      expect(uniqueMonths.size).toBe(12);
      
      const expectedMonths = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      
      expectedMonths.forEach(month => {
        expect(allMonths).toContain(month);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent structure across all constant objects', () => {
      const motivationKeys = Object.keys(TRAVEL_MOTIVATIONS[Object.keys(TRAVEL_MOTIVATIONS)[0]]);
      const levelKeys = Object.keys(COMPETITIVE_LEVELS[Object.keys(COMPETITIVE_LEVELS)[0]]);
      const budgetKeys = Object.keys(BUDGET_RANGES[Object.keys(BUDGET_RANGES)[0]]);
      
      expect(motivationKeys).toContain('id');
      expect(motivationKeys).toContain('label');
      expect(motivationKeys).toContain('description');
      
      expect(levelKeys).toContain('id');
      expect(levelKeys).toContain('label');
      expect(levelKeys).toContain('description');
      
      expect(budgetKeys).toContain('id');
      expect(budgetKeys).toContain('label');
      expect(budgetKeys).toContain('description');
    });

    it('should not have empty values', () => {
      const allConstants = [
        ...Object.values(TRAVEL_MOTIVATIONS),
        ...Object.values(COMPETITIVE_LEVELS),
        ...Object.values(BUDGET_RANGES),
        ...SEASONS
      ];

      allConstants.forEach(item => {
        Object.values(item).forEach(value => {
          if (typeof value === 'string') {
            expect(value.trim().length).toBeGreaterThan(0);
          } else if (Array.isArray(value)) {
            expect(value.length).toBeGreaterThan(0);
            value.forEach(arrayItem => {
              expect(arrayItem.trim().length).toBeGreaterThan(0);
            });
          }
        });
      });
    });
  });
});