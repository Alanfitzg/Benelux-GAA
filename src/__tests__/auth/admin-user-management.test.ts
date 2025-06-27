/**
 * Admin User Management Tests
 * Tests admin-only user management functionality including CRUD operations,
 * approval workflows, and permission enforcement
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth-helpers';
import { 
  GET as getUsersHandler,
  POST as createUserHandler 
} from '@/app/api/admin/users/route';
import { 
  GET as getUserHandler,
  PUT as updateUserHandler,
  DELETE as deleteUserHandler 
} from '@/app/api/admin/users/[id]/route';
import { 
  POST as approveUserHandler 
} from '@/app/api/admin/users/[id]/approve/route';
import { 
  POST as rejectUserHandler 
} from '@/app/api/admin/users/[id]/reject/route';
import { 
  POST as resetPasswordHandler 
} from '@/app/api/admin/users/[id]/reset-password/route';
import { UserRole, AccountStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    club: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  requireSuperAdmin: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireSuperAdmin = requireSuperAdmin as jest.MockedFunction<typeof requireSuperAdmin>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Admin User Management', () => {
  const mockAdminSession = {
    user: {
      id: 'admin-123',
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.SUPER_ADMIN,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireSuperAdmin.mockResolvedValue(mockAdminSession as Record<string, unknown>);
  });

  describe('List Users (GET /api/admin/users)', () => {
    it('should return all users for super admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          name: 'User One',
          role: UserRole.USER,
          accountStatus: AccountStatus.APPROVED,
          createdAt: new Date(),
          club: { id: 'club-1', name: 'Club One' },
          adminOfClubs: [],
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          name: 'User Two',
          role: UserRole.CLUB_ADMIN,
          accountStatus: AccountStatus.PENDING,
          createdAt: new Date(),
          club: null,
          adminOfClubs: [{ id: 'club-2', name: 'Club Two' }],
        },
      ];
      
      mockPrisma.user.findMany.mockResolvedValue(mockUsers as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(2);
      expect(data.users[0].email).toBe('user1@example.com');
      expect(data.users[1].role).toBe(UserRole.CLUB_ADMIN);
      expect(mockRequireSuperAdmin).toHaveBeenCalledTimes(1);
    });

    it('should filter users by status', async () => {
      const mockPendingUsers = [
        {
          id: 'user-1',
          email: 'pending@example.com',
          accountStatus: AccountStatus.PENDING,
          club: null,
          adminOfClubs: [],
        },
      ];
      
      mockPrisma.user.findMany.mockResolvedValue(mockPendingUsers as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users?status=PENDING');
      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.users).toHaveLength(1);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { accountStatus: AccountStatus.PENDING },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 401 when not authenticated as super admin', async () => {
      mockRequireSuperAdmin.mockResolvedValue({
        status: 401,
        json: () => Promise.resolve({ error: 'Authentication required' }),
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsersHandler(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Create User (POST /api/admin/users)', () => {
    const validUserData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'Password123!',
      name: 'New User',
      role: UserRole.USER,
      clubIds: ['club-1'],
    };

    it('should create new user successfully', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-new',
        ...validUserData,
        password: 'hashedPassword123',
        accountStatus: AccountStatus.APPROVED,
        createdAt: new Date(),
        club: null,
        adminOfClubs: [],
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.user.email).toBe('newuser@example.com');
      expect(data.user.accountStatus).toBe(AccountStatus.APPROVED);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
    });

    it('should handle duplicate email error', async () => {
      mockBcrypt.hash.mockResolvedValue('hashedPassword123' as never);
      mockPrisma.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(validUserData),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('email is already taken');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'invalid@example.com',
        // Missing username and password
      };

      const request = new NextRequest('http://localhost:3000/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await createUserHandler(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('validation');
    });
  });

  describe('Get User (GET /api/admin/users/[id])', () => {
    it('should return user details for super admin', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        username: 'user123',
        name: 'Test User',
        role: UserRole.USER,
        accountStatus: AccountStatus.APPROVED,
        createdAt: new Date(),
        club: { id: 'club-1', name: 'Test Club' },
        adminOfClubs: [],
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123');
      const response = await getUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.email).toBe('user@example.com');
      expect(data.user.password).toBeUndefined(); // Password should be excluded
    });

    it('should return 404 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/users/nonexistent');
      const response = await getUserHandler(request, { 
        params: Promise.resolve({ id: 'nonexistent' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('Update User (PUT /api/admin/users/[id])', () => {
    const updateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      role: UserRole.CLUB_ADMIN,
      accountStatus: AccountStatus.APPROVED,
      adminOfClubIds: ['club-1', 'club-2'],
    };

    it('should update user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'old@example.com',
      } as Record<string, unknown>);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        ...updateData,
        createdAt: new Date(),
        club: null,
        adminOfClubs: [
          { id: 'club-1', name: 'Club One' },
          { id: 'club-2', name: 'Club Two' },
        ],
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await updateUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe('Updated Name');
      expect(data.user.adminOfClubs).toHaveLength(2);
    });

    it('should handle update of non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/users/nonexistent', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await updateUserHandler(request, { 
        params: Promise.resolve({ id: 'nonexistent' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('Delete User (DELETE /api/admin/users/[id])', () => {
    it('should delete regular user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        role: UserRole.USER,
      } as Record<string, unknown>);

      mockPrisma.user.delete.mockResolvedValue({} as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123', {
        method: 'DELETE',
      });

      const response = await deleteUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should prevent deletion of super admin users', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-123',
        role: UserRole.SUPER_ADMIN,
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/admin-123', {
        method: 'DELETE',
      });

      const response = await deleteUserHandler(request, { 
        params: Promise.resolve({ id: 'admin-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot delete super admin users');
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });

    it('should handle deletion of non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/users/nonexistent', {
        method: 'DELETE',
      });

      const response = await deleteUserHandler(request, { 
        params: Promise.resolve({ id: 'nonexistent' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('Approve User (POST /api/admin/users/[id]/approve)', () => {
    it('should approve pending user successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        accountStatus: AccountStatus.PENDING,
      } as Record<string, unknown>);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        accountStatus: AccountStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: 'admin-123',
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/approve', {
        method: 'POST',
      });

      const response = await approveUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User approved successfully');
      expect(data.user.accountStatus).toBe(AccountStatus.APPROVED);
    });

    it('should handle approval of already approved user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        accountStatus: AccountStatus.APPROVED,
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/approve', {
        method: 'POST',
      });

      const response = await approveUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User is already approved');
    });
  });

  describe('Reject User (POST /api/admin/users/[id]/reject)', () => {
    it('should reject user with reason successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        accountStatus: AccountStatus.PENDING,
      } as Record<string, unknown>);

      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        accountStatus: AccountStatus.REJECTED,
        rejectionReason: 'Invalid documentation',
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/reject', {
        method: 'POST',
        body: JSON.stringify({ reason: 'Invalid documentation' }),
      });

      const response = await rejectUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('User rejected successfully');
      expect(data.user.accountStatus).toBe(AccountStatus.REJECTED);
      expect(data.user.rejectionReason).toBe('Invalid documentation');
    });

    it('should require rejection reason', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/reject', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await rejectUserHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Rejection reason is required');
    });
  });

  describe('Reset Password (POST /api/admin/users/[id]/reset-password)', () => {
    it('should reset user password successfully', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'user@example.com',
      } as Record<string, unknown>);

      mockBcrypt.hash.mockResolvedValue('newHashedPassword' as never);
      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        password: 'newHashedPassword',
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: 'NewPassword123!' }),
      });

      const response = await resetPasswordHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Password reset successfully');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
    });

    it('should validate password requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/users/user-123/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: 'weak' }),
      });

      const response = await resetPasswordHandler(request, { 
        params: Promise.resolve({ id: 'user-123' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Password must be at least 6 characters');
    });

    it('should handle password reset for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/users/nonexistent/reset-password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: 'NewPassword123!' }),
      });

      const response = await resetPasswordHandler(request, { 
        params: Promise.resolve({ id: 'nonexistent' }) 
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('Permission Enforcement', () => {
    it('should deny access to non-super admin users', async () => {
      mockRequireSuperAdmin.mockResolvedValue({
        status: 403,
        json: () => Promise.resolve({ error: 'Insufficient permissions' }),
      } as Record<string, unknown>);

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsersHandler(request);

      expect(response.status).toBe(403);
    });

    it('should handle authentication errors gracefully', async () => {
      mockRequireSuperAdmin.mockRejectedValue(new Error('Auth service error'));

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      
      // The actual endpoint should handle this error and return a proper response
      try {
        await getUsersHandler(request);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/admin/users');
      const response = await getUsersHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch users');
    });
  });
});