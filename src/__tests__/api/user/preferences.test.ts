import { createMocks } from 'node-mocks-http';
import { GET, POST, PATCH } from '@/app/api/user/preferences/route';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/auth-helpers', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    userPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockGetServerSession = getServerSession as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockSession = {
  user: {
    id: 'user123',
    email: 'test@example.com',
  },
};

const mockPreferences = {
  id: 'pref123',
  userId: 'user123',
  motivations: ['weather', 'budget'],
  competitiveLevel: 'casual',
  preferredCities: ['Dublin'],
  preferredCountries: ['Ireland'],
  preferredClubs: [],
  activities: ['hurling'],
  budgetRange: 'mid-range',
  maxFlightTime: 4,
  preferredMonths: ['June', 'July'],
  onboardingCompleted: true,
  onboardingSkipped: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('/api/user/preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return user preferences when authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.findUnique.mockResolvedValue(mockPreferences);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences).toEqual(mockPreferences);
      expect(mockPrisma.userPreferences.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });

    it('should return null when no preferences exist', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.findUnique.mockResolvedValue(null);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences).toBeNull();
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle database errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.findUnique.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch preferences');
    });
  });

  describe('POST', () => {
    const createData = {
      motivations: ['weather_sun', 'budget'],
      competitiveLevel: 'casual',
      preferredCities: ['Dublin'],
      preferredCountries: ['Ireland'],
      preferredClubs: [],
      activities: ['hurling'],
      budgetRange: 'mid-range',
      maxFlightTime: 4,
      preferredMonths: ['June', 'July'],
      onboardingCompleted: true,
      onboardingSkipped: false,
    };

    it('should create new preferences when authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.upsert.mockResolvedValue(mockPreferences);

      const { req } = createMocks({
        method: 'POST',
        body: createData,
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences).toEqual(mockPreferences);
      expect(mockPrisma.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        update: expect.objectContaining({
          motivations: createData.motivations,
          competitiveLevel: createData.competitiveLevel,
        }),
        create: expect.objectContaining({
          userId: 'user123',
          motivations: createData.motivations,
          competitiveLevel: createData.competitiveLevel,
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'POST',
        body: createData,
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });



    it('should handle database errors during creation', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.upsert.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'POST',
        body: createData,
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to save preferences');
    });

    it('should handle skip onboarding requests', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const skippedPreferences = { ...mockPreferences, onboardingSkipped: true, onboardingCompleted: false };
      mockPrisma.userPreferences.upsert.mockResolvedValue(skippedPreferences);

      const skipData = {
        motivations: [],
        competitiveLevel: '',
        preferredCities: [],
        preferredCountries: [],
        preferredClubs: [],
        activities: [],
        budgetRange: '',
        maxFlightTime: null,
        preferredMonths: [],
        onboardingCompleted: false,
        onboardingSkipped: true,
      };

      const { req } = createMocks({
        method: 'POST',
        body: skipData,
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.onboardingSkipped).toBe(true);
      expect(data.preferences.onboardingCompleted).toBe(false);
    });
  });

  describe('PATCH', () => {
    const updateData = {
      motivations: ['culture', 'weather'],
      competitiveLevel: 'competitive',
      budgetRange: 'luxury',
    };

    it('should update existing preferences when authenticated', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const updatedPreferences = { ...mockPreferences, ...updateData };
      mockPrisma.userPreferences.update.mockResolvedValue(updatedPreferences);

      const { req } = createMocks({
        method: 'PATCH',
        body: updateData,
      });

      const response = await PATCH(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences).toEqual(updatedPreferences);
      expect(mockPrisma.userPreferences.update).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        data: expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const { req } = createMocks({
        method: 'PATCH',
        body: updateData,
      });

      const response = await PATCH(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });


    it('should handle database errors during update', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.update.mockRejectedValue(new Error('Database error'));

      const { req } = createMocks({
        method: 'PATCH',
        body: updateData,
      });

      const response = await PATCH(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update preferences');
    });

    it('should handle partial updates', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      const partialUpdate = { budgetRange: 'budget' };
      const updatedPreferences = { ...mockPreferences, ...partialUpdate };
      mockPrisma.userPreferences.update.mockResolvedValue(updatedPreferences);

      const { req } = createMocks({
        method: 'PATCH',
        body: partialUpdate,
      });

      const response = await PATCH(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.preferences.budgetRange).toBe('budget');
    });

  });

  describe('Error handling', () => {
    it('should handle malformed request bodies', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const { req } = createMocks({
        method: 'POST',
        body: undefined,
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });

    it('should handle empty request bodies', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const { req } = createMocks({
        method: 'POST',
        body: {},
      });

      const response = await POST(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });

    it('should handle database connection errors', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.userPreferences.findUnique.mockRejectedValue(new Error('Connection failed'));

      const { req } = createMocks({ method: 'GET' });
      const response = await GET(req as unknown as Request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});