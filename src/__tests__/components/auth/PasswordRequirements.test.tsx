import React from 'react';
import { render, screen } from '@testing-library/react';
import PasswordRequirements from '@/components/auth/PasswordRequirements';

describe('PasswordRequirements', () => {
  it('should render all password requirements when show is true', () => {
    render(<PasswordRequirements password="" show={true} />);
    
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter (A-Z)')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter (a-z)')).toBeInTheDocument();
    expect(screen.getByText('One number (0-9)')).toBeInTheDocument();
  });

  it('should not render when show is false', () => {
    const { container } = render(<PasswordRequirements password="" show={false} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should show all requirements as not met for empty password', () => {
    render(<PasswordRequirements password="" show={true} />);
    
    // Check that all requirement text items have gray icons
    const lengthReq = screen.getByText('At least 8 characters').closest('div')?.parentElement;
    const uppercaseReq = screen.getByText('One uppercase letter (A-Z)').closest('div')?.parentElement;
    const lowercaseReq = screen.getByText('One lowercase letter (a-z)').closest('div')?.parentElement;
    const numberReq = screen.getByText('One number (0-9)').closest('div')?.parentElement;
    
    expect(lengthReq?.querySelector('.text-gray-400')).toBeInTheDocument();
    expect(uppercaseReq?.querySelector('.text-gray-400')).toBeInTheDocument();
    expect(lowercaseReq?.querySelector('.text-gray-400')).toBeInTheDocument();
    expect(numberReq?.querySelector('.text-gray-400')).toBeInTheDocument();
  });

  it('should show length requirement as met for password with 8+ characters', () => {
    render(<PasswordRequirements password="longpass" show={true} />);
    
    const lengthReq = screen.getByText('At least 8 characters').closest('div')?.parentElement;
    expect(lengthReq?.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('should show uppercase requirement as met', () => {
    render(<PasswordRequirements password="Password" show={true} />);
    
    const uppercaseReq = screen.getByText('One uppercase letter (A-Z)').closest('div')?.parentElement;
    expect(uppercaseReq?.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('should show lowercase requirement as met', () => {
    render(<PasswordRequirements password="password" show={true} />);
    
    const lowercaseReq = screen.getByText('One lowercase letter (a-z)').closest('div')?.parentElement;
    expect(lowercaseReq?.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('should show number requirement as met', () => {
    render(<PasswordRequirements password="password1" show={true} />);
    
    const numberReq = screen.getByText('One number (0-9)').closest('div')?.parentElement;
    expect(numberReq?.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('should show all requirements as met for valid password', () => {
    render(<PasswordRequirements password="Password123" show={true} />);
    
    const lengthReq = screen.getByText('At least 8 characters').closest('div')?.parentElement;
    const uppercaseReq = screen.getByText('One uppercase letter (A-Z)').closest('div')?.parentElement;
    const lowercaseReq = screen.getByText('One lowercase letter (a-z)').closest('div')?.parentElement;
    const numberReq = screen.getByText('One number (0-9)').closest('div')?.parentElement;
    
    expect(lengthReq?.querySelector('.text-green-600')).toBeInTheDocument();
    expect(uppercaseReq?.querySelector('.text-green-600')).toBeInTheDocument();
    expect(lowercaseReq?.querySelector('.text-green-600')).toBeInTheDocument();
    expect(numberReq?.querySelector('.text-green-600')).toBeInTheDocument();
    
    // Also check for the "all requirements met" message
    expect(screen.getByText('Password meets all requirements!')).toBeInTheDocument();
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <PasswordRequirements password="test" show={true} className="custom-class" />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });
});