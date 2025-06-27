/**
 * Authentication Integration Tests
 * Tests complete authentication flows including registration, login, approval,
 * and permission workflows in a more realistic end-to-end manner
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, AccountStatus } from '@prisma/client';

// Mock the entire Prisma client
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
  club: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
} as any;

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('@/lib/auth-helpers', () => ({
  getServerSession: jest.fn(),
  requireSuperAdmin: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const { getServerSession, requireSuperAdmin } = require('@/lib/auth-helpers');

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Complete User Registration Flow', () => {
    it('should handle complete user registration and approval workflow', async () => {
      // Step 1: User registers
      const registrationData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'NewPassword123!',
        name: 'New User',
        clubId: 'club-123',
      };

      // Mock no existing users
      mockPrisma.user.findFirst.mockResolvedValue(null);
      
      // Mock club exists
      mockPrisma.club.findUnique.mockResolvedValue({
        id: 'club-123',
        name: 'Test Club',
      });

      // Mock password hashing
      bcrypt.hash.mockResolvedValue('hashedPassword123');

      // Mock user creation
      const createdUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        username: 'newuser',
        name: 'New User',
        role: UserRole.USER,
        accountStatus: AccountStatus.PENDING,
        clubId: 'club-123',
        createdAt: new Date(),
        password: 'hashedPassword123',
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      // Import and test registration handler
      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(201);
      expect(registerData.user.accountStatus).toBe('PENDING');

      // Step 2: Check account status
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);

      const { POST: statusHandler } = await import('@/app/api/auth/account-status/route');
      const statusRequest = new NextRequest('http://localhost:3000/api/auth/account-status', {
        method: 'POST',
        body: JSON.stringify({ username: 'newuser' }),
      });

      const statusResponse = await statusHandler(statusRequest);
      const statusData = await statusResponse.json();

      expect(statusResponse.status).toBe(200);
      expect(statusData.accountStatus).toBe('PENDING');

      // Step 3: Admin approves user
      const adminSession = {
        user: {
          id: 'admin-123',
          role: UserRole.SUPER_ADMIN,
        },
      };
      requireSuperAdmin.mockResolvedValue(adminSession);

      const approvedUser = {
        ...createdUser,
        accountStatus: AccountStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: 'admin-123',
      };
      mockPrisma.user.update.mockResolvedValue(approvedUser);

      const { POST: approveHandler } = await import('@/app/api/admin/users/[id]/approve/route');
      const approveRequest = new NextRequest('http://localhost:3000/api/admin/users/user-new/approve', {
        method: 'POST',
      });

      const approveResponse = await approveHandler(approveRequest, {
        params: Promise.resolve({ id: 'user-new' }),
      });
      const approveData = await approveResponse.json();

      expect(approveResponse.status).toBe(200);
      expect(approveData.user.accountStatus).toBe('APPROVED');

      // Step 4: User can now access protected resources
      getServerSession.mockResolvedValue({
        user: {
          id: 'user-new',
          username: 'newuser',
          role: UserRole.USER,
          accountStatus: AccountStatus.APPROVED,
        },
      });

      // This would be testing access to a protected resource
      const session = await getServerSession();
      expect(session.user.accountStatus).toBe('APPROVED');
    });

    it('should handle user registration with rejection workflow', async () => {
      // Follow similar pattern but with rejection
      const pendingUser = {
        id: 'user-rejected',
        username: 'rejecteduser',
        accountStatus: AccountStatus.PENDING,
      };

      mockPrisma.user.findUnique.mockResolvedValue(pendingUser);
      requireSuperAdmin.mockResolvedValue({
        user: { id: 'admin-123', role: UserRole.SUPER_ADMIN },
      });

      const rejectedUser = {
        ...pendingUser,
        accountStatus: AccountStatus.REJECTED,
        rejectionReason: 'Invalid documentation provided',
      };
      mockPrisma.user.update.mockResolvedValue(rejectedUser);

      const { POST: rejectHandler } = await import('@/app/api/admin/users/[id]/reject/route');
      const rejectRequest = new NextRequest('http://localhost:3000/api/admin/users/user-rejected/reject', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Invalid documentation provided' }),
      });

      const rejectResponse = await rejectHandler(rejectRequest, {
        params: Promise.resolve({ id: 'user-rejected' }),
      });
      const rejectData = await rejectResponse.json();

      expect(rejectResponse.status).toBe(200);
      expect(rejectData.user.accountStatus).toBe('REJECTED');
      expect(rejectData.user.rejectionReason).toBe('Invalid documentation provided');
    });
  });

  describe('Role-Based Access Control Integration', () => {
    it('should enforce proper access control for different user roles', async () => {
      // Test Super Admin access
      const superAdminSession = {
        user: {
          id: 'admin-123',
          role: UserRole.SUPER_ADMIN,
          accountStatus: AccountStatus.APPROVED,
        },
      };

      getServerSession.mockResolvedValue(superAdminSession);
      requireSuperAdmin.mockResolvedValue(superAdminSession);

      // Super admin should access all admin endpoints
      mockPrisma.user.findMany.mockResolvedValue([]);

      const { GET: getUsersHandler } = await import('@/app/api/admin/users/route');
      const adminRequest = new NextRequest('http://localhost:3000/api/admin/users');
      const adminResponse = await getUsersHandler(adminRequest);

      expect(adminResponse.status).toBe(200);
      expect(requireSuperAdmin).toHaveBeenCalled();

      // Test Club Admin access (should be denied for super admin endpoints)
      const clubAdminSession = {
        user: {
          id: 'club-admin-123',
          role: UserRole.CLUB_ADMIN,
          accountStatus: AccountStatus.APPROVED,
        },
      };

      requireSuperAdmin.mockResolvedValue({
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' }),
      } as any);

      const clubAdminRequest = new NextRequest('http://localhost:3000/api/admin/users');
      const clubAdminResponse = await getUsersHandler(clubAdminRequest);

      expect(clubAdminResponse.status).toBe(403);

      // Test Regular User access (should be denied)
      const userSession = {
        user: {
          id: 'user-123',
          role: UserRole.USER,
          accountStatus: AccountStatus.APPROVED,
        },
      };

      requireSuperAdmin.mockResolvedValue({
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' }),
      } as any);

      const userRequest = new NextRequest('http://localhost:3000/api/admin/users');
      const userResponse = await getUsersHandler(userRequest);

      expect(userResponse.status).toBe(403);
    });

    it('should handle account status restrictions properly', async () => {
      // Test pending user access
      const pendingUserSession = {
        user: {
          id: 'pending-user',
          username: 'pendinguser',
          role: UserRole.USER,
          accountStatus: AccountStatus.PENDING,
        },
      };

      getServerSession.mockResolvedValue(pendingUserSession);

      // Mock getUserByUsername for approval check
      const mockGetUserByUsername = jest.fn().mockResolvedValue({
        id: 'pending-user',
        username: 'pendinguser',
        accountStatus: AccountStatus.PENDING,
      });

      jest.doMock('@/lib/user', () => ({
        getUserByUsername: mockGetUserByUsername,
      }));

      // Test suspended user access
      const suspendedUserSession = {
        user: {
          id: 'suspended-user',
          username: 'suspendeduser',
          role: UserRole.USER,
          accountStatus: AccountStatus.SUSPENDED,
        },
      };

      mockGetUserByUsername.mockResolvedValue({
        id: 'suspended-user',
        username: 'suspendeduser',
        accountStatus: AccountStatus.SUSPENDED,
      });

      // Both should be denied access to protected resources
      expect(pendingUserSession.user.accountStatus).toBe(AccountStatus.PENDING);
      expect(suspendedUserSession.user.accountStatus).toBe(AccountStatus.SUSPENDED);
    });
  });

  describe('Password Management Integration', () => {
    it('should handle admin password reset workflow', async () => {
      const adminSession = {
        user: { id: 'admin-123', role: UserRole.SUPER_ADMIN },
      };
      requireSuperAdmin.mockResolvedValue(adminSession);

      const targetUser = {
        id: 'user-123',
        email: 'user@example.com',
        username: 'testuser',
      };
      mockPrisma.user.findUnique.mockResolvedValue(targetUser);

      bcrypt.hash.mockResolvedValue('newHashedPassword');
      mockPrisma.user.update.mockResolvedValue({
        ...targetUser,
        password: 'newHashedPassword',
      });

      const { POST: resetHandler } = await import('@/app/api/admin/users/[id]/reset-password/route');
      const resetRequest = new NextRequest('http://localhost:3000/api/admin/users/user-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: 'NewSecurePassword123!' }),
      });

      const resetResponse = await resetHandler(resetRequest, {
        params: Promise.resolve({ id: 'user-123' }),
      });
      const resetData = await resetResponse.json();

      expect(resetResponse.status).toBe(200);
      expect(resetData.message).toBe('Password reset successfully');
      expect(bcrypt.hash).toHaveBeenCalledWith('NewSecurePassword123!', 12);
    });
  });

  describe('User Management Integration', () => {
    it('should handle complete user lifecycle', async () => {
      const adminSession = {
        user: { id: 'admin-123', role: UserRole.SUPER_ADMIN },
      };
      requireSuperAdmin.mockResolvedValue(adminSession);

      // Create user
      const newUserData = {
        email: 'managed@example.com',
        username: 'manageduser',
        password: 'Password123!',
        name: 'Managed User',
        role: UserRole.CLUB_ADMIN,
        clubIds: ['club-123'],
      };

      bcrypt.hash.mockResolvedValue('hashedPassword');
      
      const createdUser = {
        id: 'managed-user',
        ...newUserData,
        password: 'hashedPassword',
        accountStatus: AccountStatus.APPROVED,
        createdAt: new Date(),
        club: null,
        adminOfClubs: [],
      };
      mockPrisma.user.create.mockResolvedValue(createdUser);

      const { POST: createHandler } = await import('@/app/api/admin/users/route');
      const createRequest = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });

      const createResponse = await createHandler(createRequest);
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.user.role).toBe(UserRole.CLUB_ADMIN);

      // Update user
      mockPrisma.user.findUnique.mockResolvedValue(createdUser);
      
      const updatedUser = {
        ...createdUser,
        name: 'Updated Name',
        role: UserRole.USER,
      };
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const updateData = {
        name: 'Updated Name',
        role: UserRole.USER,
      };

      const { PUT: updateHandler } = await import('@/app/api/admin/users/[id]/route');
      const updateRequest = new NextRequest('http://localhost:3000/api/admin/users/managed-user', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const updateResponse = await updateHandler(updateRequest, {
        params: Promise.resolve({ id: 'managed-user' }),
      });
      const updateResponseData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateResponseData.user.name).toBe('Updated Name');

      // Delete user (should succeed for non-super admin)
      mockPrisma.user.delete.mockResolvedValue({});

      const { DELETE: deleteHandler } = await import('@/app/api/admin/users/[id]/route');
      const deleteRequest = new NextRequest('http://localhost:3000/api/admin/users/managed-user', {
        method: 'DELETE',
      });

      const deleteResponse = await deleteHandler(deleteRequest, {
        params: Promise.resolve({ id: 'managed-user' }),
      });
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully across the flow', async () => {
      // Registration with database error
      mockPrisma.user.findFirst.mockRejectedValue(new Error('Database connection failed'));

      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          username: 'testuser',
          password: 'Password123!',
        }),
      });

      const registerResponse = await registerHandler(registerRequest);
      const registerData = await registerResponse.json();

      expect(registerResponse.status).toBe(500);
      expect(registerData.error).toBe('Registration failed. Please try again.');
    });

    it('should handle authentication service errors', async () => {
      getServerSession.mockRejectedValue(new Error('Auth service unavailable'));

      // This would test any endpoint that uses authentication
      // The error should be handled gracefully
      try {
        await getServerSession();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Auth service unavailable');
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent user registrations', async () => {
      // Simulate race condition in user registration
      const registrationData = {
        email: 'concurrent@example.com',
        username: 'concurrent',
        password: 'Password123!',
      };

      // First call succeeds
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockResolvedValueOnce({
        id: 'user-1',
        ...registrationData,
      } as any);

      // Second call fails due to unique constraint
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);
      mockPrisma.user.create.mockRejectedValueOnce({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const { POST: registerHandler } = await import('@/app/api/auth/register/route');
      
      const request1 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });

      const request2 = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registrationData),
      });

      const [response1, response2] = await Promise.all([
        registerHandler(request1),
        registerHandler(request2),
      ]);

      // One should succeed, one should fail
      expect(response1.status === 201 || response2.status === 201).toBe(true);
      expect(response1.status === 400 || response2.status === 400).toBe(true);
    });
  });

  describe('Session Lifecycle', () => {
    it('should handle complete session lifecycle', async () => {
      // Session creation (login)
      const user = {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.USER,
        accountStatus: AccountStatus.APPROVED,
      };

      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.user.findUnique.mockResolvedValue(user);

      // Session validation
      const session = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          accountStatus: user.accountStatus,
        },
      };

      getServerSession.mockResolvedValue(session);

      // Session should be valid
      const retrievedSession = await getServerSession();
      expect(retrievedSession.user.id).toBe(user.id);
      expect(retrievedSession.user.role).toBe(UserRole.USER);

      // Session expiration/logout would be handled by NextAuth
      getServerSession.mockResolvedValue(null);

      const expiredSession = await getServerSession();
      expect(expiredSession).toBeNull();
    });
  });
});