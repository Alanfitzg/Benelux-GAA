import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FloatingContactButton from '@/components/ui/FloatingContactButton';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string } & Record<string, unknown>) => {
    return <a href={href} {...props}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('FloatingContactButton', () => {
  it('should render the contact button', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link', { name: /contact us/i });
    expect(link).toBeInTheDocument();
  });

  it('should have correct href attribute', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link', { name: /contact us/i });
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('should have proper accessibility attributes', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Contact us');
  });

  it('should render the envelope icon', () => {
    render(<FloatingContactButton />);
    
    const svg = screen.getByRole('link').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('should have the correct CSS classes for positioning', () => {
    render(<FloatingContactButton />);
    
    const container = screen.getByRole('link').parentElement;
    expect(container).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-40');
  });

  it('should have the correct CSS classes for styling', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass(
      'group',
      'relative',
      'flex',
      'items-center',
      'justify-center',
      'bg-gradient-to-r',
      'from-primary',
      'to-primary-light',
      'text-white',
      'rounded-full',
      'shadow-lg'
    );
  });

  it('should render the pulse animation element', () => {
    render(<FloatingContactButton />);
    
    const pulseElement = screen.getByRole('link').querySelector('.animate-ping');
    expect(pulseElement).toBeInTheDocument();
    expect(pulseElement).toHaveClass('absolute', 'inset-0', 'rounded-full', 'bg-primary', 'animate-ping', 'opacity-20');
  });

  it('should render the tooltip', () => {
    render(<FloatingContactButton />);
    
    // The tooltip text should be in the document
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('should have responsive size classes', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('w-14', 'h-14', 'md:w-16', 'md:h-16');
  });

  it('should be clickable and navigate to contact page', async () => {
    const user = userEvent.setup();
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link', { name: /contact us/i });
    
    // Verify the link is clickable
    await user.click(link);
    
    // Since we're mocking Next.js Link, we just verify the href
    expect(link).toHaveAttribute('href', '/contact');
  });

  it('should have hover effect classes', () => {
    render(<FloatingContactButton />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('hover:shadow-xl');
    
    const gradientSpan = link.querySelector('.group-hover\\:from-primary-dark');
    expect(gradientSpan).toBeInTheDocument();
  });
});