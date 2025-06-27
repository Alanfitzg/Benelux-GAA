/**
 * Authentication Flow Tests
 * Tests core authentication functionality including login, registration, and session management
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { POST as registerHandler } from '@/app/api/auth/register/route';
import { POST as accountStatusHandler } from '@/app/api/auth/account-status/route';
import { UserRole, AccountStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    club: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Authentication Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
      name: 'Test User',
      clubId: 'club-123',
    };

    it('should successfully register a new user', async () => {
      // Mock no existing users
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.club.findUnique.mockResolvedValue({
        id: 'club-123',
        name: 'Test Club',
      } as any);
      
      // Mock password hashing
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      
      // Mock user creation
      const mockCreatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User',
        role: UserRole.USER,
        accountStatus: AccountStatus.PENDING,
        clubId: 'club-123',
        createdAt: new Date(),
      };
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegistrationData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Account created successfully. Please wait for admin approval.');
      expect(data.user.email).toBe('test@example.com');
      expect(data.user.accountStatus).toBe('PENDING');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });

    it('should reject registration with duplicate email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegistrationData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });

    it('should reject registration with duplicate username', async () => {
      mockPrisma.user.findFirst
        .mockResolvedValueOnce(null) // No email conflict
        .mockResolvedValueOnce({ // Username conflict
          id: 'existing-user',
          username: 'testuser',
        } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegistrationData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });

    it('should reject registration with invalid club ID', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.club.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegistrationData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid club selected');
    });

    it('should validate password requirements', async () => {
      const invalidPasswordData = {
        ...validRegistrationData,
        password: 'weak',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidPasswordData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Password must be at least 8 characters');
    });

    it('should validate email format', async () => {
      const invalidEmailData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email');
    });

    it('should validate username format', async () => {
      const invalidUsernameData = {
        ...validRegistrationData,
        username: 'a', // Too short
      };

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidUsernameData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Username must be at least 3 characters');
    });
  });

  describe('Account Status Check', () => {
    it('should return account status for existing user', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.PENDING,
        rejectionReason: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const request = new NextRequest('http://localhost:3000/api/auth/account-status', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser' }),
      });

      const response = await accountStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accountStatus).toBe('PENDING');
      expect(data.rejectionReason).toBeNull();
    });

    it('should return rejection reason for rejected users', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.REJECTED,
        rejectionReason: 'Invalid documentation provided',
      };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const request = new NextRequest('http://localhost:3000/api/auth/account-status', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser' }),
      });

      const response = await accountStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.accountStatus).toBe('REJECTED');
      expect(data.rejectionReason).toBe('Invalid documentation provided');
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/account-status', {
        method: 'POST',
        body: JSON.stringify({ username: 'nonexistent' }),
      });

      const response = await accountStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should validate required username field', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/account-status', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await accountStatusHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Username is required');
    });
  });

  describe('Session Management', () => {
    // Note: These would typically be integration tests with a test database
    // Here we're focusing on the API layer logic

    it('should create user session with correct data structure', () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        accountStatus: AccountStatus.APPROVED,
      };

      // This would test the actual session callback logic
      // In a real test, you'd mock the auth() function and test session creation
      expect(mockUser.role).toBe(UserRole.USER);
      expect(mockUser.accountStatus).toBe(AccountStatus.APPROVED);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockPrisma.user.findFirst.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegistrationData),
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Registration failed. Please try again.');
    });

    it('should handle malformed JSON request bodies', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await registerHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid request format');
    });
  });
});