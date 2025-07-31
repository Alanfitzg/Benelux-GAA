import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingModal from '@/components/onboarding/OnboardingModal';

jest.mock('@/lib/featureFlags', () => ({
  isFeatureEnabled: jest.fn(() => true),
}));

jest.mock('@/components/onboarding/MotivationSelector', () => {
  return function MockMotivationSelector({ selectedMotivations, onUpdate }: { 
    selectedMotivations: string[]; 
    onUpdate: (motivations: string[]) => void;
  }) {
    return (
      <div data-testid="motivation-selector">
        <button onClick={() => onUpdate(['weather_sun', 'budget'])}>
          Select Motivations
        </button>
        <div>Selected: {selectedMotivations.length}</div>
      </div>
    );
  };
});

const mockOnClose = jest.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
};

global.fetch = jest.fn();

describe('OnboardingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('should render when isOpen is true', () => {
    render(<OnboardingModal {...defaultProps} />);
    
    expect(screen.getByText('Welcome to GAA Trips!')).toBeInTheDocument();
    expect(screen.getByText("Let's personalize your experience")).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<OnboardingModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Welcome to GAA Trips!')).not.toBeInTheDocument();
  });

  it('should display step 1 by default', () => {
    render(<OnboardingModal {...defaultProps} />);
    
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByTestId('motivation-selector')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    render(<OnboardingModal {...defaultProps} />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(4);
    
    expect(progressBars[0]).toHaveClass('bg-primary');
    expect(progressBars[1]).toHaveClass('bg-gray-200');
  });

  it('should allow skipping onboarding', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip for now');
    await user.click(skipButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/preferences', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"onboardingSkipped":true'),
      }));
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should navigate to next step when Next is clicked', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByText('What\'s your competitive level?')).toBeInTheDocument();
  });

  it('should navigate back to previous step', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    const backButton = screen.getByText('Back');
    await user.click(backButton);
    
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('should disable Next button when no motivations selected', () => {
    render(<OnboardingModal {...defaultProps} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should enable Next button when motivations are selected', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('should display competitive level options in step 2', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByText('Social & Fun')).toBeInTheDocument();
    expect(screen.getByText('Mixed Ability')).toBeInTheDocument();
    expect(screen.getByText('Elite Level')).toBeInTheDocument();
  });

  it('should allow selecting competitive level', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    let nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    const casualOption = screen.getByText('Social & Fun');
    await user.click(casualOption);
    
    nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  it('should display destinations step', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    let nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    const casualOption = screen.getByText('Social & Fun');
    await user.click(casualOption);
    
    nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByText('Step 3 of 4')).toBeInTheDocument();
    expect(screen.getByText('Where would you like to travel?')).toBeInTheDocument();
  });

  it('should display preferences step', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton1 = screen.getByText('Next');
    await user.click(nextButton1);
    
    const casualOption = screen.getByText('Social & Fun');
    await user.click(casualOption);
    
    const nextButton2 = screen.getByText('Next');
    await user.click(nextButton2);
    
    const nextButton3 = screen.getByText('Next');
    await user.click(nextButton3);
    
    expect(screen.getByText('Step 4 of 4')).toBeInTheDocument();
    expect(screen.getByText('Travel Preferences')).toBeInTheDocument();
  });

  it('should complete onboarding and save preferences', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton1 = screen.getByText('Next');
    await user.click(nextButton1);
    
    const casualOption = screen.getByText('Social & Fun');
    await user.click(casualOption);
    
    const nextButton2 = screen.getByText('Next');
    await user.click(nextButton2);
    
    const nextButton3 = screen.getByText('Next');
    await user.click(nextButton3);
    
    const completeButton = screen.getByText('Complete Setup');
    await user.click(completeButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/user/preferences', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"onboardingCompleted":true'),
      }));
    });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<OnboardingModal {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip for now');
    await user.click(skipButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving preferences:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<OnboardingModal {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip for now');
    await user.click(skipButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should close modal when clicking outside', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const backdrop = screen.getByRole('dialog').parentElement;
    await user.click(backdrop!);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should prevent closing modal when clicking inside', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const modalContent = screen.getByRole('dialog');
    await user.click(modalContent);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display step titles correctly', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    expect(screen.getByText('What motivates your GAA travel?')).toBeInTheDocument();
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    expect(screen.getByText('What\'s your competitive level?')).toBeInTheDocument();
  });

  it('should maintain form data across steps', async () => {
    const user = userEvent.setup();
    render(<OnboardingModal {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Motivations');
    await user.click(selectButton);
    
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);
    
    const backButton = screen.getByText('Back');
    await user.click(backButton);
    
    expect(screen.getByText('Selected: 2')).toBeInTheDocument();
  });
});