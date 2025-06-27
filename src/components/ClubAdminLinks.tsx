'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Club {
  id: string;
  name: string;
}

export default function ClubAdminLinks({ 
  className, 
  onClick 
}: { 
  className?: string;
  onClick?: () => void;
}) {
  const { data: session } = useSession();
  const [adminClubs, setAdminClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAdminClubs();
    }
  }, [session]);

  const fetchAdminClubs = async () => {
    try {
      const response = await fetch('/api/user/admin-clubs');
      if (response.ok) {
        const data = await response.json();
        setAdminClubs(data.clubs || []);
      }
    } catch (error) {
      console.error('Error fetching admin clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user || session.user.role === 'USER' || loading) {
    return null;
  }

  if (adminClubs.length === 0 && session.user.role === 'CLUB_ADMIN') {
    return null;
  }

  return (
    <>
      {adminClubs.map((club) => (
        <Link
          key={club.id}
          href={`/club-admin/${club.id}`}
          className={className}
          onClick={onClick}
        >
          <svg
            className="w-4 h-4 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="font-medium">{club.name} Dashboard</span>
        </Link>
      ))}
    </>
  );
}