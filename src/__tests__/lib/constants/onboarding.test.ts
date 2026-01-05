import {
  TRAVEL_MOTIVATIONS,
  COMPETITIVE_LEVELS,
  BUDGET_RANGES,
  SEASONS,
} from "@/lib/constants/onboarding";

describe("Onboarding Constants", () => {
  describe("TRAVEL_MOTIVATIONS", () => {
    it("should contain all expected motivation keys", () => {
      const expectedKeys = [
        "sun_beach",
        "city_break",
        "budget",
        "big_event",
        "competitive",
        "long_haul",
      ];

      const actualKeys = Object.keys(TRAVEL_MOTIVATIONS);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(6);
    });

    it("should have valid structure for each motivation", () => {
      Object.values(TRAVEL_MOTIVATIONS).forEach((motivation) => {
        expect(motivation).toHaveProperty("id");
        expect(motivation).toHaveProperty("label");
        expect(motivation).toHaveProperty("description");
        expect(motivation).toHaveProperty("icon");

        expect(typeof motivation.id).toBe("string");
        expect(typeof motivation.label).toBe("string");
        expect(typeof motivation.description).toBe("string");
        expect(typeof motivation.icon).toBe("string");

        expect(motivation.id.length).toBeGreaterThan(0);
        expect(motivation.label.length).toBeGreaterThan(0);
        expect(motivation.description.length).toBeGreaterThan(0);
        expect(motivation.icon.length).toBeGreaterThan(0);
      });
    });

    it("should have unique IDs for each motivation", () => {
      const ids = Object.values(TRAVEL_MOTIVATIONS).map((m) => m.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique labels for each motivation", () => {
      const labels = Object.values(TRAVEL_MOTIVATIONS).map((m) => m.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it("should match key with motivation ID", () => {
      Object.entries(TRAVEL_MOTIVATIONS).forEach(([key, motivation]) => {
        expect(key).toBe(motivation.id);
      });
    });

    it("should have sun_beach motivation with correct properties", () => {
      const sunBeach = TRAVEL_MOTIVATIONS.sun_beach;
      expect(sunBeach.id).toBe("sun_beach");
      expect(sunBeach.label).toBe("Sun & Beach");
      expect(sunBeach.description).toBe("Warm weather destinations");
      expect(sunBeach.icon).toBe("☀️");
    });

    it("should have budget motivation with correct properties", () => {
      const budget = TRAVEL_MOTIVATIONS.budget;
      expect(budget.id).toBe("budget");
      expect(budget.label).toBe("Budget Trip");
      expect(budget.description).toBe("Cheapest option available");
      expect(budget.icon).toBe("💰");
    });

    it("should have long_haul motivation with note property", () => {
      const longHaul = TRAVEL_MOTIVATIONS.long_haul;
      expect(longHaul.id).toBe("long_haul");
      expect(longHaul.label).toBe("Long Haul");
      expect(longHaul.description).toBe("USA, Australia, etc.");
      expect(longHaul.icon).toBe("🌍");
      expect(longHaul.note).toBe("Not currently offering");
    });
  });

  describe("COMPETITIVE_LEVELS", () => {
    it("should contain all expected competitive level keys", () => {
      const expectedKeys = [
        "training_camp",
        "friendly_tournament",
        "fifteen_a_side",
        "social_gaa",
        "blitz_tournament",
        "exhibition_match",
      ];
      const actualKeys = Object.keys(COMPETITIVE_LEVELS);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(6);
    });

    it("should have valid structure for each level", () => {
      Object.values(COMPETITIVE_LEVELS).forEach((level) => {
        expect(level).toHaveProperty("id");
        expect(level).toHaveProperty("label");
        expect(level).toHaveProperty("description");

        expect(typeof level.id).toBe("string");
        expect(typeof level.label).toBe("string");
        expect(typeof level.description).toBe("string");

        expect(level.id.length).toBeGreaterThan(0);
        expect(level.label.length).toBeGreaterThan(0);
        expect(level.description.length).toBeGreaterThan(0);
      });
    });

    it("should match key with level ID", () => {
      Object.entries(COMPETITIVE_LEVELS).forEach(([key, level]) => {
        expect(key).toBe(level.id);
      });
    });

    it("should have training_camp level with correct properties", () => {
      const training = COMPETITIVE_LEVELS.training_camp;
      expect(training.id).toBe("training_camp");
      expect(training.label).toBe("Training Camp");
      expect(training.description).toBe(
        "Team preparation with training facilities and practice matches"
      );
    });

    it("should have friendly_tournament level with correct properties", () => {
      const friendly = COMPETITIVE_LEVELS.friendly_tournament;
      expect(friendly.id).toBe("friendly_tournament");
      expect(friendly.label).toBe("Friendly Tournament");
      expect(friendly.description).toBe(
        "Competitive games in a relaxed, social atmosphere"
      );
    });

    it("should have social_gaa level with correct properties", () => {
      const social = COMPETITIVE_LEVELS.social_gaa;
      expect(social.id).toBe("social_gaa");
      expect(social.label).toBe("Social GAA");
      expect(social.description).toBe(
        "Focus on fun, culture, and craic - results secondary"
      );
    });
  });

  describe("BUDGET_RANGES", () => {
    it("should contain all expected budget range keys", () => {
      const expectedKeys = ["budget", "mid-range", "premium"];
      const actualKeys = Object.keys(BUDGET_RANGES);
      expect(actualKeys).toEqual(expect.arrayContaining(expectedKeys));
      expect(actualKeys).toHaveLength(3);
    });

    it("should have valid structure for each range", () => {
      Object.values(BUDGET_RANGES).forEach((range) => {
        expect(range).toHaveProperty("id");
        expect(range).toHaveProperty("label");
        expect(range).toHaveProperty("description");

        expect(typeof range.id).toBe("string");
        expect(typeof range.label).toBe("string");
        expect(typeof range.description).toBe("string");

        expect(range.id.length).toBeGreaterThan(0);
        expect(range.label.length).toBeGreaterThan(0);
        expect(range.description.length).toBeGreaterThan(0);
      });
    });

    it("should match key with range ID", () => {
      Object.entries(BUDGET_RANGES).forEach(([key, range]) => {
        expect(key).toBe(range.id);
      });
    });

    it("should have budget range with correct properties", () => {
      const budget = BUDGET_RANGES.budget;
      expect(budget.id).toBe("budget");
      expect(budget.label).toBe("Budget");
      expect(budget.description).toBe("€0-200 per person");
    });

    it("should have mid-range with correct properties", () => {
      const midRange = BUDGET_RANGES["mid-range"];
      expect(midRange.id).toBe("mid-range");
      expect(midRange.label).toBe("Mid-Range");
      expect(midRange.description).toBe("€200-500 per person");
    });

    it("should have premium range with correct properties", () => {
      const premium = BUDGET_RANGES.premium;
      expect(premium.id).toBe("premium");
      expect(premium.label).toBe("Premium");
      expect(premium.description).toBe("€500+ per person");
    });
  });

  describe("SEASONS", () => {
    it("should contain all expected seasons", () => {
      const expectedIds = ["spring", "summer", "autumn", "winter"];
      const actualIds = SEASONS.map((season) => season.id);
      expect(actualIds).toEqual(expect.arrayContaining(expectedIds));
      expect(actualIds).toHaveLength(4);
    });

    it("should have valid structure for each season", () => {
      SEASONS.forEach((season) => {
        expect(season).toHaveProperty("id");
        expect(season).toHaveProperty("label");
        expect(season).toHaveProperty("icon");
        expect(season).toHaveProperty("months");

        expect(typeof season.id).toBe("string");
        expect(typeof season.label).toBe("string");
        expect(typeof season.icon).toBe("string");
        expect(Array.isArray(season.months)).toBe(true);

        expect(season.id.length).toBeGreaterThan(0);
        expect(season.label.length).toBeGreaterThan(0);
        expect(season.months.length).toBe(3);

        season.months.forEach((month) => {
          expect(typeof month).toBe("string");
          expect(month.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have spring season with correct months", () => {
      const spring = SEASONS.find((s) => s.id === "spring");
      expect(spring!.id).toBe("spring");
      expect(spring!.label).toBe("Spring");
      expect(spring!.months).toEqual(["march", "april", "may"]);
    });

    it("should have summer season with correct months", () => {
      const summer = SEASONS.find((s) => s.id === "summer");
      expect(summer!.id).toBe("summer");
      expect(summer!.label).toBe("Summer");
      expect(summer!.months).toEqual(["june", "july", "august"]);
    });

    it("should have autumn season with correct months", () => {
      const autumn = SEASONS.find((s) => s.id === "autumn");
      expect(autumn!.id).toBe("autumn");
      expect(autumn!.label).toBe("Autumn");
      expect(autumn!.months).toEqual(["september", "october", "november"]);
    });

    it("should have winter season with correct months", () => {
      const winter = SEASONS.find((s) => s.id === "winter");
      expect(winter!.id).toBe("winter");
      expect(winter!.label).toBe("Winter");
      expect(winter!.months).toEqual(["december", "january", "february"]);
    });

    it("should cover all 12 months exactly once", () => {
      const allMonths = SEASONS.flatMap((season) => season.months);
      const uniqueMonths = new Set(allMonths);

      expect(allMonths).toHaveLength(12);
      expect(uniqueMonths.size).toBe(12);

      const expectedMonths = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
      ];

      expectedMonths.forEach((month) => {
        expect(allMonths).toContain(month);
      });
    });
  });

  describe("Data Consistency", () => {
    it("should have consistent structure across all constant objects", () => {
      const motivationKeys = Object.keys(
        TRAVEL_MOTIVATIONS[Object.keys(TRAVEL_MOTIVATIONS)[0]]
      );
      const levelKeys = Object.keys(
        COMPETITIVE_LEVELS[Object.keys(COMPETITIVE_LEVELS)[0]]
      );
      const budgetKeys = Object.keys(
        BUDGET_RANGES[Object.keys(BUDGET_RANGES)[0]]
      );

      expect(motivationKeys).toContain("id");
      expect(motivationKeys).toContain("label");
      expect(motivationKeys).toContain("description");

      expect(levelKeys).toContain("id");
      expect(levelKeys).toContain("label");
      expect(levelKeys).toContain("description");

      expect(budgetKeys).toContain("id");
      expect(budgetKeys).toContain("label");
      expect(budgetKeys).toContain("description");
    });

    it("should not have empty values", () => {
      const allConstants = [
        ...Object.values(TRAVEL_MOTIVATIONS),
        ...Object.values(COMPETITIVE_LEVELS),
        ...Object.values(BUDGET_RANGES),
        ...SEASONS,
      ];

      allConstants.forEach((item) => {
        Object.values(item).forEach((value) => {
          if (typeof value === "string") {
            expect(value.trim().length).toBeGreaterThan(0);
          } else if (Array.isArray(value)) {
            expect(value.length).toBeGreaterThan(0);
            value.forEach((arrayItem) => {
              expect(arrayItem.trim().length).toBeGreaterThan(0);
            });
          }
        });
      });
    });
  });
});
