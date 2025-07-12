"use client";

import { useState } from 'react';

export interface AccountStatusInfo {
  status: 'PENDING' | 'REJECTED' | 'SUSPENDED' | null;
  message: string;
  rejectionReason?: string;
}

export function useAccountStatus() {
  const [accountStatus, setAccountStatus] = useState<AccountStatusInfo | null>(null);

  const checkAccountStatus = async (username: string): Promise<AccountStatusInfo | null> => {
    try {
      const response = await fetch('/api/auth/account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.status ? {
          status: data.status,
          message: getStatusMessage(data.status),
          rejectionReason: data.rejectionReason,
        } : null;
      }
    } catch (error) {
      console.error('Failed to check account status:', error);
    }
    return null;
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'Your account is pending approval from an administrator. You will receive an email notification once approved.';
      case 'REJECTED':
        return 'Your account application was not approved.';
      case 'SUSPENDED':
        return 'Your account has been suspended. Please contact support for assistance.';
      default:
        return 'Account status unknown.';
    }
  };

  return {
    accountStatus,
    setAccountStatus,
    checkAccountStatus,
  };
}