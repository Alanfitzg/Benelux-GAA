'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users, TrendingUp, Package, MessageSquare } from 'lucide-react';

interface DashboardStats {
  totalEarnings: number;
  monthlyEarnings: number;
  totalBookings: number;
  activeBookings: number;
  inquiries: number;
  packages: number;
}

interface Booking {
  id: string;
  teamName: string;
  contactName: string;
  arrivalDate: string;
  departureDate: string;
  teamSize: number;
  totalAmount: number;
  clubEarnings: number;
  status: string;
  package?: {
    name: string;
  };
}

interface RecentInquiry {
  id: string;
  name: string;
  email: string;
  type: string;
  submittedAt: string;
  message?: string;
}

export default function HostDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, inquiriesRes] = await Promise.all([
        fetch('/api/dashboard/host/stats'),
        fetch('/api/dashboard/host/bookings'),
        fetch('/api/dashboard/host/inquiries')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setRecentBookings(bookingsData.bookings || []);
      }

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json();
        setRecentInquiries(inquiriesData.inquiries || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'DEPOSIT_PAID': return 'bg-blue-100 text-blue-800';
      case 'FULL_PAID': return 'bg-emerald-100 text-emerald-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      case 'INQUIRY': return 'bg-yellow-100 text-yellow-800';
      case 'QUOTE_SENT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to access the host dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          {session?.user?.role === 'SUPER_ADMIN' && (
            <p className="text-gray-600 mt-1">Viewing aggregated data from all clubs</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Manage Packages
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalEarnings) : '€0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time hosting revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.monthlyEarnings) : '€0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.activeBookings : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Confirmed & upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? stats.inquiries : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-4">Start hosting teams to see your bookings here</p>
              <Button>Create Your First Package</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{booking.teamName}</h3>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Contact: {booking.contactName}</p>
                      <p>Dates: {formatDate(booking.arrivalDate)} - {formatDate(booking.departureDate)}</p>
                      <p>Team Size: {booking.teamSize} players</p>
                      {booking.package && <p>Package: {booking.package.name}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(booking.clubEarnings)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total: {formatCurrency(booking.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No new inquiries</h3>
              <p className="text-gray-500">New team inquiries will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{inquiry.name}</h3>
                      <Badge variant="outline">
                        {inquiry.type === 'contact' ? 'Contact' : 'Interest'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Email: {inquiry.email}</p>
                      <p>Date: {formatDate(inquiry.submittedAt)}</p>
                      {inquiry.message && (
                        <p className="italic">&quot;{inquiry.message}&quot;</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Button variant="outline" size="sm">
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}