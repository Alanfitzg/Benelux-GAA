import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  trackEvent, 
  trackPageView, 
  setUserProperties, 
  GA_EVENTS,
  trackSearch,
  trackFormSubmit,
  trackShare
} from '@/lib/analytics';

// Custom hook for Google Analytics tracking
export const useAnalytics = () => {
  const { data: session } = useSession();

  // Track user properties when session changes
  const updateUserProperties = useCallback(() => {
    if (session?.user) {
      setUserProperties({
        user_id: session.user.id,
        user_role: session.user.role || 'USER',
        account_status: 'approved', // Since all users are auto-approved now
      });
    }
  }, [session]);

  // Track authentication events
  const trackSignUp = useCallback((method: 'credentials' | 'google' = 'credentials') => {
    trackEvent(GA_EVENTS.SIGN_UP, {
      method: method,
      user_role: 'USER',
    });
  }, []);

  const trackLogin = useCallback((method: 'credentials' | 'google' = 'credentials') => {
    trackEvent(GA_EVENTS.LOGIN, {
      method: method,
    });
  }, []);

  const trackLogout = useCallback(() => {
    trackEvent(GA_EVENTS.LOGOUT);
  }, []);

  // Track club-related events
  const trackClubView = useCallback((clubId: string, clubName: string, clubLocation?: string) => {
    trackEvent(GA_EVENTS.CLUB_VIEW, {
      club_id: clubId,
      club_name: clubName,
      club_location: clubLocation,
    });
  }, []);

  const trackClubAdminRequest = useCallback((clubId: string, clubName: string) => {
    trackEvent(GA_EVENTS.CLUB_ADMIN_REQUEST, {
      club_id: clubId,
      club_name: clubName,
      user_role: session?.user?.role || 'USER',
    });
  }, [session]);

  const trackClubContact = useCallback((clubId: string, clubName: string, method: 'email' | 'phone' | 'website') => {
    trackEvent(GA_EVENTS.CLUB_CONTACT, {
      club_id: clubId,
      club_name: clubName,
      method: method,
    });
  }, []);

  // Track event/tournament related events
  const trackEventView = useCallback((eventId: string, eventName: string, eventType?: string) => {
    trackEvent(GA_EVENTS.EVENT_VIEW, {
      event_id: eventId,
      event_name: eventName,
      event_type: eventType,
    });
  }, []);

  const trackTournamentInterest = useCallback((tournamentId: string, tournamentName: string, selectedDates: string[]) => {
    trackEvent(GA_EVENTS.TOURNAMENT_INTEREST, {
      event_id: tournamentId,
      event_name: tournamentName,
      selected_dates_count: selectedDates.length,
    });
  }, []);

  // Track onboarding events
  const trackOnboardingComplete = useCallback((preferences: {
    motivations: string[];
    competitiveLevel: string;
    preferredCities: string[];
    preferredCountries: string[];
  }) => {
    trackEvent(GA_EVENTS.ONBOARDING_COMPLETE, {
      motivations_count: preferences.motivations.length,
      competitive_level: preferences.competitiveLevel,
      cities_count: preferences.preferredCities.length,
      countries_count: preferences.preferredCountries.length,
    });
  }, []);

  const trackOnboardingSkip = useCallback(() => {
    trackEvent(GA_EVENTS.ONBOARDING_SKIP);
  }, []);

  // Track form submissions
  const trackContactForm = useCallback((success: boolean, errorMessage?: string) => {
    trackFormSubmit('contact', success, errorMessage);
  }, []);

  const trackSurveySubmit = useCallback((surveyType: string, responses: Record<string, unknown>) => {
    trackEvent(GA_EVENTS.SURVEY_SUBMIT, {
      form_type: surveyType,
      response_count: Object.keys(responses).length,
    });
  }, []);

  // Track search
  const trackClubSearch = useCallback((searchTerm: string) => {
    trackSearch(searchTerm, 'clubs');
  }, []);

  const trackEventSearch = useCallback((searchTerm: string) => {
    trackSearch(searchTerm, 'events');
  }, []);

  // Track page views
  const trackPage = useCallback((url: string, title?: string) => {
    trackPageView(url, title);
  }, []);

  // Track social sharing
  const trackSocialShare = useCallback((method: string, contentType: 'club' | 'event', itemId: string) => {
    trackShare(method, contentType, itemId);
  }, []);

  return {
    updateUserProperties,
    trackSignUp,
    trackLogin,
    trackLogout,
    trackClubView,
    trackClubAdminRequest,
    trackClubContact,
    trackEventView,
    trackTournamentInterest,
    trackOnboardingComplete,
    trackOnboardingSkip,
    trackContactForm,
    trackSurveySubmit,
    trackClubSearch,
    trackEventSearch,
    trackPage,
    trackSocialShare,
  };
};