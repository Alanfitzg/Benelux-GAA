import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateEventButton from '@/components/CreateEventButton';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useAuthCheck');
jest.mock('@/components/AuthModal', () => {
  const MockAuthModal = ({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="auth-modal">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
  MockAuthModal.displayName = 'MockAuthModal';
  return MockAuthModal;
});

const mockRequireAuth = jest.fn();
const mockCloseAuthModal = jest.fn();

describe('CreateEventButton', () => {
  // Get the mocked router from jest.setup.js
  const mockRouter = useRouter();
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (mockRouter as typeof mockRouter & { push: jest.Mock }).push = mockPush;
    
    (useAuthCheck as jest.Mock).mockReturnValue({
      requireAuth: mockRequireAuth,
      showAuthModal: false,
      closeAuthModal: mockCloseAuthModal,
      isLoading: false,
    });
  });

  it('should render the button with correct text', () => {
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.getByText('CREATE EVENT')).toBeInTheDocument();
  });

  it('should have type="button" to prevent form submission', () => {
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should call requireAuth when clicked', async () => {
    const user = userEvent.setup();
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockRequireAuth).toHaveBeenCalledTimes(1);
    expect(mockRequireAuth).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should navigate to create event page when authenticated', async () => {
    const user = userEvent.setup();
    mockRequireAuth.mockImplementation((callback) => callback());
    
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/events/create');
  });

  it('should show auth modal when not authenticated', async () => {
    (useAuthCheck as jest.Mock).mockReturnValue({
      requireAuth: mockRequireAuth,
      showAuthModal: true,
      closeAuthModal: mockCloseAuthModal,
      isLoading: false,
    });
    
    render(<CreateEventButton />);
    
    const modal = screen.getByTestId('auth-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/You need to be signed in to create an event/)).toBeInTheDocument();
  });

  it('should not trigger action when loading', async () => {
    const user = userEvent.setup();
    (useAuthCheck as jest.Mock).mockReturnValue({
      requireAuth: mockRequireAuth,
      showAuthModal: false,
      closeAuthModal: mockCloseAuthModal,
      isLoading: true,
    });
    
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockRequireAuth).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should close auth modal when close button is clicked', async () => {
    const user = userEvent.setup();
    (useAuthCheck as jest.Mock).mockReturnValue({
      requireAuth: mockRequireAuth,
      showAuthModal: true,
      closeAuthModal: mockCloseAuthModal,
      isLoading: false,
    });
    
    render(<CreateEventButton />);
    
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    
    expect(mockCloseAuthModal).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling classes', () => {
    render(<CreateEventButton />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'inline-block',
      'bg-red-600',
      'text-white',
      'rounded-lg',
      'hover:bg-red-700',
      'transition',
      'font-semibold',
      'shadow-sm',
      'hover:shadow-md'
    );
  });

  it('should show different text on mobile', () => {
    render(<CreateEventButton />);
    
    expect(screen.getByText('CREATE EVENT')).toHaveClass('hidden', 'md:inline');
    expect(screen.getByText('Create Event')).toHaveClass('md:hidden');
  });
});