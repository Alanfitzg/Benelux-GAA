import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreferencesSection from '@/components/profile/PreferencesSection';
import { isFeatureEnabled } from '@/lib/featureFlags';

jest.mock('@/lib/featureFlags', () => ({
  isFeatureEnabled: jest.fn(),
}));

jest.mock('@/components/onboarding/OnboardingModal', () => {
  return function MockOnboardingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return isOpen ? (
      <div data-testid="onboarding-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null;
  };
});

const mockIsFeatureEnabled = isFeatureEnabled as jest.Mock;

global.fetch = jest.fn();

const mockPreferences = {
  motivations: ['weather_sun', 'budget', 'culture'],
  competitiveLevel: 'casual',
  preferredCities: ['Dublin', 'London'],
  preferredCountries: ['Ireland', 'UK'],
  preferredClubs: [],
  activities: ['hurling', 'football'],
  budgetRange: 'mid-range',
  maxFlightTime: 4,
  preferredMonths: ['June', 'July', 'August'],
  onboardingCompleted: true,
  onboardingSkipped: false,
};

const mockSkippedPreferences = {
  ...mockPreferences,
  onboardingCompleted: false,
  onboardingSkipped: true,
};

describe('PreferencesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFeatureEnabled.mockReturnValue(true);
  });

  it('should not render when feature flag is disabled', () => {
    mockIsFeatureEnabled.mockReturnValue(false);
    
    const { container } = render(<PreferencesSection />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render while loading', () => {
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    const { container } = render(<PreferencesSection />);
    expect(container.firstChild).toBeNull();
  });

  it('should render section title and edit button', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Travel Preferences')).toBeInTheDocument();
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });
  });

  it('should show "Set Preferences" when no preferences exist', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: null }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Set Preferences')).toBeInTheDocument();
      expect(screen.getByText("You haven't set your travel preferences yet.")).toBeInTheDocument();
    });
  });

  it('should show skipped preferences message', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockSkippedPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('You skipped setting preferences. Set them now to get personalized recommendations!')).toBeInTheDocument();
    });
  });

  it('should display travel motivations in ranked order', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Travel Priorities (ranked)')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display competitive level', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Competitive Level')).toBeInTheDocument();
      expect(screen.getByText('Social & Fun')).toBeInTheDocument();
    });
  });

  it('should display preferred destinations', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Preferred Destinations')).toBeInTheDocument();
      expect(screen.getByText('Cities: Dublin, London')).toBeInTheDocument();
      expect(screen.getByText('Countries: Ireland, UK')).toBeInTheDocument();
    });
  });

  it('should display budget range', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Budget Range')).toBeInTheDocument();
      expect(screen.getByText('mid range')).toBeInTheDocument();
    });
  });

  it('should display preferred travel months', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Preferred Travel Months')).toBeInTheDocument();
      expect(screen.getByText('June, July, August')).toBeInTheDocument();
    });
  });

  it('should open onboarding modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Edit Preferences')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit Preferences');
    await user.click(editButton);

    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
  });

  it('should open onboarding modal when set preferences button is clicked', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: null }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Set Your Preferences')).toBeInTheDocument();
    });

    const setButton = screen.getByText('Set Your Preferences');
    await user.click(setButton);

    expect(screen.getByTestId('onboarding-modal')).toBeInTheDocument();
  });

  it('should close modal and refetch preferences', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ preferences: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ preferences: mockPreferences }),
      });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.getByText('Set Your Preferences')).toBeInTheDocument();
    });

    const setButton = screen.getByText('Set Your Preferences');
    await user.click(setButton);

    const closeButton = screen.getByText('Close Modal');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('onboarding-modal')).not.toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching preferences:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should not display sections for empty data', async () => {
    const emptyPreferences = {
      motivations: [],
      competitiveLevel: '',
      preferredCities: [],
      preferredCountries: [],
      preferredClubs: [],
      activities: [],
      budgetRange: '',
      maxFlightTime: null,
      preferredMonths: [],
      onboardingCompleted: true,
      onboardingSkipped: false,
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: emptyPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      expect(screen.queryByText('Travel Priorities (ranked)')).not.toBeInTheDocument();
      expect(screen.queryByText('Competitive Level')).not.toBeInTheDocument();
      expect(screen.queryByText('Preferred Destinations')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Range')).not.toBeInTheDocument();
      expect(screen.queryByText('Preferred Travel Months')).not.toBeInTheDocument();
    });
  });

  it('should handle missing motivation data gracefully', async () => {
    const preferencesWithInvalidMotivation = {
      ...mockPreferences,
      motivations: ['weather_sun', 'invalid-motivation', 'budget'],
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: preferencesWithInvalidMotivation }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      const motivationItems = screen.getAllByText(/\d+/);
      expect(motivationItems).toHaveLength(2); // Only valid motivations should render
    });
  });

  it('should fetch preferences on component mount', async () => {
    render(<PreferencesSection />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/preferences');
    });
  });

  it('should show settings icon', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      const icon = screen.getByText('Travel Preferences').previousElementSibling;
      expect(icon).toBeInTheDocument();
    });
  });

  it('should show edit icon in button', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ preferences: mockPreferences }),
    });

    render(<PreferencesSection />);

    await waitFor(() => {
      const editButton = screen.getByText('Edit Preferences');
      const icon = editButton.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });
});