// Google Analytics event tracking utilities

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

// GAA-specific event types
export const GA_EVENTS = {
  // Authentication events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Club events
  CLUB_REGISTRATION: 'club_registration',
  CLUB_ADMIN_REQUEST: 'club_admin_request',
  CLUB_VIEW: 'club_view',
  CLUB_CONTACT: 'club_contact',
  
  // Event/Tournament events
  EVENT_REGISTRATION: 'event_registration',
  TOURNAMENT_TEAM_SIGNUP: 'tournament_team_signup',
  EVENT_VIEW: 'event_view',
  TOURNAMENT_INTEREST: 'tournament_interest',
  
  // Form submissions
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  SURVEY_SUBMIT: 'survey_submit',
  
  // User preferences
  ONBOARDING_COMPLETE: 'onboarding_complete',
  ONBOARDING_SKIP: 'onboarding_skip',
  PREFERENCES_UPDATE: 'preferences_update',
  
  // Search
  SEARCH: 'search',
  
  // Social
  SHARE: 'share',
} as const;

// Custom event parameters
interface EventParams {
  // User properties
  user_role?: string;
  account_status?: string;
  
  // Club properties
  club_id?: string;
  club_name?: string;
  club_location?: string;
  
  // Event properties
  event_id?: string;
  event_type?: string;
  event_name?: string;
  
  // Form properties
  form_type?: string;
  
  // Search properties
  search_term?: string;
  search_type?: string;
  
  // Other
  method?: string;
  value?: number;
  currency?: string;
  items?: unknown[];
  [key: string]: unknown;
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      // Add timestamp for better analysis
      event_timestamp: new Date().toISOString(),
    });
  }
};

// Track page views with custom properties
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
      page_title: title,
    });
  }
};

// Set user properties
export const setUserProperties = (properties: {
  user_id?: string;
  user_role?: string;
  account_status?: string;
  club_count?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

// Ecommerce tracking (for future use with payments)
export const trackPurchase = (transactionData: {
  transaction_id: string;
  value: number;
  currency: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', transactionData);
  }
};

// Enhanced search tracking
export const trackSearch = (searchTerm: string, searchType: 'clubs' | 'events' | 'global') => {
  trackEvent(GA_EVENTS.SEARCH, {
    search_term: searchTerm,
    search_type: searchType,
  });
};

// Track form submissions with validation
export const trackFormSubmit = (formType: string, success: boolean, errorMessage?: string) => {
  trackEvent(GA_EVENTS.CONTACT_FORM_SUBMIT, {
    form_type: formType,
    success: success,
    error_message: errorMessage,
  });
};

// Track social shares
export const trackShare = (method: string, contentType: string, itemId?: string) => {
  trackEvent(GA_EVENTS.SHARE, {
    method: method, // 'facebook', 'twitter', 'email', etc.
    content_type: contentType, // 'club', 'event', etc.
    item_id: itemId,
  });
};