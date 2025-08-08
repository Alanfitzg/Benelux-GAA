import { renderHook, act } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAuthCheck } from '@/hooks/useAuthCheck';

jest.mock('next-auth/react');

describe('useAuthCheck', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('isLoading', () => {
    it('should return true when session is loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.isLoading).toBe(true);
    });

    it('should return false when session is not loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('should execute action when user is authenticated', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 'authenticated',
      });

      const mockAction = jest.fn();
      const { result } = renderHook(() => useAuthCheck());

      act(() => {
        result.current.requireAuth(mockAction);
      });

      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(result.current.showAuthModal).toBe(false);
    });

    it('should show auth modal when user is not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const mockAction = jest.fn();
      const { result } = renderHook(() => useAuthCheck());

      act(() => {
        result.current.requireAuth(mockAction);
      });

      expect(mockAction).not.toHaveBeenCalled();
      expect(result.current.showAuthModal).toBe(true);
    });

    it('should not execute action or show modal when loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const mockAction = jest.fn();
      const { result } = renderHook(() => useAuthCheck());

      act(() => {
        result.current.requireAuth(mockAction);
      });

      expect(mockAction).not.toHaveBeenCalled();
      expect(result.current.showAuthModal).toBe(false);
    });
  });

  describe('closeAuthModal', () => {
    it('should close auth modal', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuthCheck());

      act(() => {
        result.current.requireAuth(() => {});
      });

      expect(result.current.showAuthModal).toBe(true);

      act(() => {
        result.current.closeAuthModal();
      });

      expect(result.current.showAuthModal).toBe(false);
    });
  });

  describe('session', () => {
    it('should return session data when authenticated', () => {
      const sessionData = { user: { id: '1', email: 'test@example.com' } };
      mockUseSession.mockReturnValue({
        data: sessionData,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.session).toEqual(sessionData);
    });

    it('should return null when not authenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useAuthCheck());
      expect(result.current.session).toBeNull();
    });
  });

  describe('multiple calls', () => {
    it('should maintain consistent state across multiple calls', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result, rerender } = renderHook(() => useAuthCheck());

      act(() => {
        result.current.requireAuth(() => {});
      });

      expect(result.current.showAuthModal).toBe(true);

      rerender();

      expect(result.current.showAuthModal).toBe(true);

      act(() => {
        result.current.closeAuthModal();
      });

      expect(result.current.showAuthModal).toBe(false);
    });
  });

  describe('session status changes', () => {
    it('should update isAuthenticated when session changes', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result, rerender } = renderHook(() => useAuthCheck());
      expect(result.current.isAuthenticated).toBe(false);

      mockUseSession.mockReturnValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        status: 'authenticated',
      });

      rerender();
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});