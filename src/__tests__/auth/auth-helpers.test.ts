/**
 * Authentication Helpers Tests
 * Tests auth helper functions for role-based access control and permissions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextResponse } from 'next/server';
import { 
  getServerSession,
  requireAuth,
  requireRole,
  requireSuperAdmin,
  requireClubAdmin,
  requireApprovedUser,
  requireApprovedRole,
  requireApprovedSuperAdmin,
  requireApprovedClubAdmin
} from '@/lib/auth-helpers';
import { getUserByUsername } from '@/lib/user';
import { UserRole, AccountStatus } from '@prisma/client';

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/user', () => ({
  getUserByUsername: jest.fn(),
}));

const mockAuth = require('@/lib/auth').auth as jest.MockedFunction<any>;
const mockGetUserByUsername = getUserByUsername as jest.MockedFunction<typeof getUserByUsername>;

describe('Authentication Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getServerSession', () => {
    it('should return session from auth function', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const session = await getServerSession();

      expect(session).toEqual(mockSession);
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it('should return null when no session exists', async () => {
      mockAuth.mockResolvedValue(null);

      const session = await getServerSession();

      expect(session).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should return session for authenticated user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireAuth();

      expect(result).toEqual(mockSession);
    });

    it('should return 401 response for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await requireAuth();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 response for session without user', async () => {
      mockAuth.mockResolvedValue({ user: null });

      const result = await requireAuth();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });
  });

  describe('requireRole', () => {
    it('should return session for user with allowed role', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.CLUB_ADMIN,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireRole([UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN]);

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for user with insufficient role', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireRole([UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN]);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should return 401 response for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await requireRole([UserRole.USER]);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });
  });

  describe('requireSuperAdmin', () => {
    it('should return session for super admin user', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'admin',
          role: UserRole.SUPER_ADMIN,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireSuperAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for non-super admin user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.CLUB_ADMIN,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireSuperAdmin();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(403);
    });
  });

  describe('requireClubAdmin', () => {
    it('should return session for club admin user', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'clubadmin',
          role: UserRole.CLUB_ADMIN,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireClubAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return session for super admin user', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'superadmin',
          role: UserRole.SUPER_ADMIN,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireClubAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for regular user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      mockAuth.mockResolvedValue(mockSession);

      const result = await requireClubAdmin();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(403);
    });
  });

  describe('requireApprovedUser', () => {
    it('should return session for approved user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedUser();

      expect(result).toEqual(mockSession);
      expect(mockGetUserByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return 403 response for pending user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.PENDING,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Account pending approval');
      expect(data.accountStatus).toBe(AccountStatus.PENDING);
    });

    it('should return 403 response for rejected user with reason', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.REJECTED,
        rejectionReason: 'Invalid documentation',
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Account has been rejected');
      expect(data.accountStatus).toBe(AccountStatus.REJECTED);
      expect(data.rejectionReason).toBe('Invalid documentation');
    });

    it('should return 403 response for suspended user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.SUSPENDED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Account has been suspended');
      expect(data.accountStatus).toBe(AccountStatus.SUSPENDED);
    });

    it('should return 403 response when user not found', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(null);

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Account not approved');
    });

    it('should return 401 response for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });
  });

  describe('requireApprovedRole', () => {
    it('should return session for approved user with correct role', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'clubadmin',
          role: UserRole.CLUB_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'clubadmin',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedRole([UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN]);

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for approved user with insufficient role', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedRole([UserRole.CLUB_ADMIN, UserRole.SUPER_ADMIN]);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should return 403 response for pending user even with correct role', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'clubadmin',
          role: UserRole.CLUB_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'clubadmin',
        accountStatus: AccountStatus.PENDING,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedRole([UserRole.CLUB_ADMIN]);

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      const data = await response.json();
      expect(response.status).toBe(403);
      expect(data.error).toBe('Account pending approval');
    });
  });

  describe('requireApprovedSuperAdmin', () => {
    it('should return session for approved super admin', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'superadmin',
          role: UserRole.SUPER_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'superadmin',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedSuperAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for non-super admin', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'clubadmin',
          role: UserRole.CLUB_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'clubadmin',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedSuperAdmin();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(403);
    });
  });

  describe('requireApprovedClubAdmin', () => {
    it('should return session for approved club admin', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'clubadmin',
          role: UserRole.CLUB_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'clubadmin',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedClubAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return session for approved super admin', async () => {
      const mockSession = {
        user: {
          id: 'admin-123',
          username: 'superadmin',
          role: UserRole.SUPER_ADMIN,
        },
      };
      const mockUser = {
        id: 'admin-123',
        username: 'superadmin',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedClubAdmin();

      expect(result).toEqual(mockSession);
    });

    it('should return 403 response for regular user', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        accountStatus: AccountStatus.APPROVED,
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockResolvedValue(mockUser as any);

      const result = await requireApprovedClubAdmin();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle auth function errors gracefully', async () => {
      mockAuth.mockRejectedValue(new Error('Auth service unavailable'));

      const result = await requireAuth();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(401);
    });

    it('should handle getUserByUsername errors gracefully', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
        },
      };
      
      mockAuth.mockResolvedValue(mockSession);
      mockGetUserByUsername.mockRejectedValue(new Error('Database error'));

      const result = await requireApprovedUser();

      expect(result).toBeInstanceOf(NextResponse);
      const response = result as NextResponse;
      expect(response.status).toBe(403);
    });
  });
});