import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useAnalytics } from '@/hooks/useAnalytics';
import * as analytics from '@/lib/analytics';

jest.mock('next-auth/react');
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  setUserProperties: jest.fn(),
  trackSearch: jest.fn(),
  trackFormSubmit: jest.fn(),
  trackShare: jest.fn(),
  GA_EVENTS: {
    SIGN_UP: 'sign_up',
    LOGIN: 'login',
    LOGOUT: 'logout',
    CLUB_VIEW: 'club_view',
    CLUB_ADMIN_REQUEST: 'club_admin_request',
    CLUB_CONTACT: 'club_contact',
    EVENT_VIEW: 'event_view',
    TOURNAMENT_INTEREST: 'tournament_interest',
    ONBOARDING_COMPLETE: 'onboarding_complete',
    ONBOARDING_SKIP: 'onboarding_skip',
  },
}));

describe('useAnalytics', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockTrackEvent = analytics.trackEvent as jest.Mock;
  const mockSetUserProperties = analytics.setUserProperties as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
  });

  describe('trackSignUp', () => {
    it('should track sign up with method', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackSignUp('google');

      expect(mockTrackEvent).toHaveBeenCalledWith('sign_up', {
        method: 'google',
        user_role: 'USER',
      });
    });

    it('should default to credentials method', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackSignUp();

      expect(mockTrackEvent).toHaveBeenCalledWith('sign_up', {
        method: 'credentials',
        user_role: 'USER',
      });
    });
  });

  describe('trackLogin', () => {
    it('should track login with method', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackLogin('google');

      expect(mockTrackEvent).toHaveBeenCalledWith('login', {
        method: 'google',
      });
    });

    it('should default to credentials method', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackLogin();

      expect(mockTrackEvent).toHaveBeenCalledWith('login', {
        method: 'credentials',
      });
    });
  });

  describe('trackLogout', () => {
    it('should track logout', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackLogout();

      expect(mockTrackEvent).toHaveBeenCalledWith('logout');
    });
  });

  describe('trackClubView', () => {
    it('should track club view with all details', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackClubView('club123', 'Test Club', 'Dublin');

      expect(mockTrackEvent).toHaveBeenCalledWith('club_view', {
        club_id: 'club123',
        club_name: 'Test Club',
        club_location: 'Dublin',
      });
    });

    it('should handle missing location', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackClubView('club123', 'Test Club');

      expect(mockTrackEvent).toHaveBeenCalledWith('club_view', {
        club_id: 'club123',
        club_name: 'Test Club',
        club_location: undefined,
      });
    });
  });

  describe('trackClubAdminRequest', () => {
    it('should track club admin request with user role', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', role: 'USER' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackClubAdminRequest('club123', 'Test Club');

      expect(mockTrackEvent).toHaveBeenCalledWith('club_admin_request', {
        club_id: 'club123',
        club_name: 'Test Club',
        user_role: 'USER',
      });
    });

    it('should handle missing session', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackClubAdminRequest('club123', 'Test Club');

      expect(mockTrackEvent).toHaveBeenCalledWith('club_admin_request', {
        club_id: 'club123',
        club_name: 'Test Club',
        user_role: 'USER',
      });
    });
  });

  describe('trackClubContact', () => {
    it('should track club contact with method', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackClubContact('club123', 'Test Club', 'email');

      expect(mockTrackEvent).toHaveBeenCalledWith('club_contact', {
        club_id: 'club123',
        club_name: 'Test Club',
        method: 'email',
      });
    });
  });

  describe('trackEventView', () => {
    it('should track event view with all details', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackEventView('event123', 'Test Tournament', 'tournament');

      expect(mockTrackEvent).toHaveBeenCalledWith('event_view', {
        event_id: 'event123',
        event_name: 'Test Tournament',
        event_type: 'tournament',
      });
    });
  });

  describe('trackTournamentInterest', () => {
    it('should track tournament interest with dates', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackTournamentInterest('tour123', 'Test Tournament', ['2024-06-01', '2024-06-02']);

      expect(mockTrackEvent).toHaveBeenCalledWith('tournament_interest', {
        tournament_id: 'tour123',
        tournament_name: 'Test Tournament',
        selected_dates: ['2024-06-01', '2024-06-02'],
        date_count: 2,
      });
    });
  });

  describe('updateUserProperties', () => {
    it('should update user properties when session exists', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'user123', role: 'CLUB_ADMIN' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAnalytics());
      
      result.current.updateUserProperties();

      expect(mockSetUserProperties).toHaveBeenCalledWith({
        user_id: 'user123',
        user_role: 'CLUB_ADMIN',
        account_status: 'approved',
      });
    });

    it('should not update properties when no session', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.updateUserProperties();

      expect(mockSetUserProperties).not.toHaveBeenCalled();
    });
  });

  describe('trackOnboardingComplete', () => {
    it('should track onboarding completion', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackOnboardingComplete();

      expect(mockTrackEvent).toHaveBeenCalledWith('onboarding_complete', {
        user_role: 'USER',
      });
    });

    it('should track onboarding with user role from session', () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: '1', role: 'CLUB_ADMIN' } },
        status: 'authenticated',
      });

      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackOnboardingComplete();

      expect(mockTrackEvent).toHaveBeenCalledWith('onboarding_complete', {
        user_role: 'CLUB_ADMIN',
      });
    });
  });

  describe('trackOnboardingSkip', () => {
    it('should track onboarding skip', () => {
      const { result } = renderHook(() => useAnalytics());
      
      result.current.trackOnboardingSkip();

      expect(mockTrackEvent).toHaveBeenCalledWith('onboarding_skip', {
        user_role: 'USER',
      });
    });
  });
});