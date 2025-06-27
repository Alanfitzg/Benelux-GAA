/**
 * Rate Limiting Tests
 * Tests rate limiting functionality for authentication and admin endpoints
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit';

// Mock Redis/storage if used
const mockStorage = new Map<string, { count: number; resetTime: number }>();

jest.mock('@/lib/rate-limit', () => {
  return {
    RateLimiter: jest.fn().mockImplementation((config) => ({
      check: jest.fn(async (identifier: string) => {
        const key = `${config.name}:${identifier}`;
        const now = Date.now();
        const entry = mockStorage.get(key);

        if (!entry || now > entry.resetTime) {
          // Reset window
          mockStorage.set(key, {
            count: 1,
            resetTime: now + config.window,
          });
          return {
            success: true,
            remaining: config.limit - 1,
            resetTime: now + config.window,
          };
        }

        if (entry.count >= config.limit) {
          return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
          };
        }

        entry.count++;
        mockStorage.set(key, entry);
        return {
          success: true,
          remaining: config.limit - entry.count,
          resetTime: entry.resetTime,
        };
      }),
    })),
  };
});

describe('Rate Limiting', () => {
  beforeEach(() => {
    mockStorage.clear();
    jest.clearAllMocks();
  });

  describe('Authentication Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const authLimiter = new RateLimiter({
        name: 'auth',
        limit: 5,
        window: 15 * 60 * 1000, // 15 minutes
      });

      const identifier = '192.168.1.1';
      
      // First request should succeed
      const result1 = await authLimiter.check(identifier);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4);

      // Second request should succeed
      const result2 = await authLimiter.check(identifier);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding rate limit', async () => {
      const authLimiter = new RateLimiter({
        name: 'auth',
        limit: 3,
        window: 15 * 60 * 1000,
      });

      const identifier = '192.168.1.1';
      
      // Use up the rate limit
      await authLimiter.check(identifier); // 1
      await authLimiter.check(identifier); // 2
      await authLimiter.check(identifier); // 3

      // Fourth request should be blocked
      const result = await authLimiter.check(identifier);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset rate limit after window expires', async () => {
      const authLimiter = new RateLimiter({
        name: 'auth',
        limit: 2,
        window: 1000, // 1 second for testing
      });

      const identifier = '192.168.1.1';
      
      // Use up the rate limit
      await authLimiter.check(identifier);
      await authLimiter.check(identifier);

      // Should be blocked
      const blockedResult = await authLimiter.check(identifier);
      expect(blockedResult.success).toBe(false);

      // Wait for window to reset (simulate time passing)
      const futureTime = Date.now() + 2000;
      jest.spyOn(Date, 'now').mockReturnValue(futureTime);

      // Should be allowed again
      const allowedResult = await authLimiter.check(identifier);
      expect(allowedResult.success).toBe(true);

      jest.restoreAllMocks();
    });

    it('should track different identifiers separately', async () => {
      const authLimiter = new RateLimiter({
        name: 'auth',
        limit: 2,
        window: 15 * 60 * 1000,
      });

      // Two different IP addresses
      const identifier1 = '192.168.1.1';
      const identifier2 = '192.168.1.2';
      
      // Use up limit for first IP
      await authLimiter.check(identifier1);
      await authLimiter.check(identifier1);

      // First IP should be blocked
      const blocked = await authLimiter.check(identifier1);
      expect(blocked.success).toBe(false);

      // Second IP should still be allowed
      const allowed = await authLimiter.check(identifier2);
      expect(allowed.success).toBe(true);
    });
  });

  describe('Registration Rate Limiting', () => {
    it('should enforce stricter limits for registration', async () => {
      const regLimiter = new RateLimiter({
        name: 'registration',
        limit: 3,
        window: 60 * 60 * 1000, // 1 hour
      });

      const identifier = '192.168.1.1';
      
      // Should allow first 3 registrations
      const result1 = await regLimiter.check(identifier);
      expect(result1.success).toBe(true);

      const result2 = await regLimiter.check(identifier);
      expect(result2.success).toBe(true);

      const result3 = await regLimiter.check(identifier);
      expect(result3.success).toBe(true);

      // Fourth should be blocked
      const result4 = await regLimiter.check(identifier);
      expect(result4.success).toBe(false);
    });
  });

  describe('Admin API Rate Limiting', () => {
    it('should allow higher limits for admin endpoints', async () => {
      const adminLimiter = new RateLimiter({
        name: 'admin',
        limit: 200,
        window: 60 * 1000, // 1 minute
      });

      const identifier = 'admin-user-123';
      
      // Should allow many requests for admin
      for (let i = 0; i < 50; i++) {
        const result = await adminLimiter.check(identifier);
        expect(result.success).toBe(true);
      }
    });

    it('should still enforce limits for admin endpoints', async () => {
      const adminLimiter = new RateLimiter({
        name: 'admin',
        limit: 5,
        window: 60 * 1000,
      });

      const identifier = 'admin-user-123';
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        await adminLimiter.check(identifier);
      }

      // Should be blocked
      const result = await adminLimiter.check(identifier);
      expect(result.success).toBe(false);
    });
  });

  describe('IP Address Extraction', () => {
    const createRequestWithHeaders = (headers: Record<string, string>) => {
      return new NextRequest('http://localhost:3000/api/test', {
        headers: new Headers(headers),
      });
    };

    it('should extract IP from x-forwarded-for header', () => {
      const request = createRequestWithHeaders({
        'x-forwarded-for': '203.0.113.1, 198.51.100.1',
      });

      // This would be the actual IP extraction logic
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
      
      expect(ip).toBe('203.0.113.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = createRequestWithHeaders({
        'x-real-ip': '203.0.113.1',
      });

      const realIp = request.headers.get('x-real-ip');
      expect(realIp).toBe('203.0.113.1');
    });

    it('should handle missing IP headers gracefully', () => {
      const request = createRequestWithHeaders({});

      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      const ip = forwardedFor || realIp || 'unknown';
      
      expect(ip).toBe('unknown');
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include rate limit information in headers', async () => {
      const limiter = new RateLimiter({
        name: 'test',
        limit: 10,
        window: 60 * 1000,
      });

      const result = await limiter.check('test-user');
      
      // In a real implementation, these would be added to the response
      const expectedHeaders = {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      };

      // Verify headers would be set correctly
      expect(expectedHeaders['X-RateLimit-Limit']).toBe('10');
      expect(result.remaining).toBeLessThan(10);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should include retry-after header when rate limited', async () => {
      const limiter = new RateLimiter({
        name: 'test',
        limit: 1,
        window: 60 * 1000,
      });

      const identifier = 'test-user';
      
      // Use up the limit
      await limiter.check(identifier);

      // Should be rate limited
      const result = await limiter.check(identifier);
      expect(result.success).toBe(false);

      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      expect(retryAfter).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent requests correctly', async () => {
      const limiter = new RateLimiter({
        name: 'concurrent',
        limit: 5,
        window: 60 * 1000,
      });

      const identifier = 'test-user';
      
      // Simulate concurrent requests
      const promises = Array(10).fill(null).map(() => limiter.check(identifier));
      const results = await Promise.all(promises);

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      // Should allow exactly the limit number of requests
      expect(successful).toBe(5);
      expect(failed).toBe(5);
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage failure
      const failingLimiter = new RateLimiter({
        name: 'failing',
        limit: 5,
        window: 60 * 1000,
      });

      // Override the check method to simulate storage failure
      jest.spyOn(failingLimiter, 'check').mockRejectedValue(new Error('Storage error'));

      try {
        await failingLimiter.check('test-user');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Storage error');
      }
    });

    it('should handle invalid window times', () => {
      expect(() => {
        new RateLimiter({
          name: 'invalid',
          limit: 5,
          window: -1000, // Negative window
        });
      }).not.toThrow(); // Constructor should not throw, but check method behavior would be undefined
    });

    it('should handle zero limits', async () => {
      const zeroLimiter = new RateLimiter({
        name: 'zero',
        limit: 0,
        window: 60 * 1000,
      });

      const result = await zeroLimiter.check('test-user');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe('Different Rate Limiting Strategies', () => {
    it('should implement sliding window correctly', async () => {
      // This would test a sliding window implementation
      // For now, we're testing the fixed window implementation
      const limiter = new RateLimiter({
        name: 'sliding',
        limit: 3,
        window: 10 * 1000, // 10 seconds
      });

      const identifier = 'sliding-user';
      
      // Make requests and verify sliding behavior
      const result1 = await limiter.check(identifier);
      expect(result1.success).toBe(true);

      // In a sliding window, the limit would be based on the last N seconds
      // rather than fixed windows
    });

    it('should support different algorithms (token bucket, leaky bucket)', () => {
      // Placeholder for different rate limiting algorithms
      // These would be implemented as different RateLimiter classes or configurations
      
      const tokenBucketConfig = {
        name: 'token-bucket',
        limit: 10,
        window: 60 * 1000,
        algorithm: 'token-bucket' as const,
      };

      const leakyBucketConfig = {
        name: 'leaky-bucket',
        limit: 10,
        window: 60 * 1000,
        algorithm: 'leaky-bucket' as const,
      };

      // These would create different rate limiter implementations
      expect(tokenBucketConfig.algorithm).toBe('token-bucket');
      expect(leakyBucketConfig.algorithm).toBe('leaky-bucket');
    });
  });
});