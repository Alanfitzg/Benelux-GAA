import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import SurveyExportButton from '@/components/SurveyExportButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trip Requests | Admin Dashboard',
  description: 'View and analyze custom trip requests for GAA travel preferences and insights.',
};

interface SurveyResponse {
  id: string;
  eventId: string | null;
  role: string;
  clubName: string | null;
  country: string;
  city: string | null;
  hasTraveledAbroad: string;
  travelFrequency: string | null;
  destinationsVisited: string[];
  preferredTravelTime: string;
  teamSize: string;
  budgetPerPerson: string;
  biggestChallenge: string;
  interestedServices: string[];
  wouldHost: string;
  wouldPayForPlatform: string;
  improvementSuggestion: string | null;
  additionalFeedback: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  submittedAt: Date;
  event: {
    id: string;
    title: string;
    location: string;
    startDate: Date;
  } | null;
}

async function getSurveyResponses() {
  try {
    const responses = await prisma.surveyResponse.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
          },
        },
      },
    });
    return responses;
  } catch (error) {
    console.error('Failed to fetch survey responses:', error);
    return [];
  }
}

async function getSurveyStats() {
  try {
    const [total, byRole, byCountry, budgetRanges] = await Promise.all([
      prisma.surveyResponse.count(),
      prisma.surveyResponse.groupBy({
        by: ['role'],
        _count: { role: true },
        orderBy: { _count: { role: 'desc' } },
      }),
      prisma.surveyResponse.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
      }),
      prisma.surveyResponse.groupBy({
        by: ['budgetPerPerson'],
        _count: { budgetPerPerson: true },
        orderBy: { _count: { budgetPerPerson: 'desc' } },
      }),
    ]);

    return { total, byRole, byCountry, budgetRanges };
  } catch (error) {
    console.error('Failed to fetch survey stats:', error);
    return { total: 0, byRole: [], byCountry: [], budgetRanges: [] };
  }
}

export default async function SurveyResponsesPage() {
  const [responses, stats] = await Promise.all([
    getSurveyResponses(),
    getSurveyStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Custom Trip Requests</h1>
        <p className="text-gray-600">View and analyze custom trip requests and travel preferences</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Responses</h3>
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Role</h3>
          <p className="text-lg font-semibold text-gray-700">
            {stats.byRole[0]?.role || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {stats.byRole[0]?._count.role || 0} responses
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Country</h3>
          <p className="text-lg font-semibold text-gray-700">
            {stats.byCountry[0]?.country || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {stats.byCountry[0]?._count.country || 0} responses
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Popular Budget</h3>
          <p className="text-lg font-semibold text-gray-700">
            {stats.budgetRanges[0]?.budgetPerPerson || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {stats.budgetRanges[0]?._count.budgetPerPerson || 0} responses
          </p>
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <SurveyExportButton responses={responses as SurveyResponse[]} />
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Travel Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget & Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {response.contactName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {response.contactEmail}
                      </div>
                      {response.contactPhone && (
                        <div className="text-sm text-gray-500">
                          {response.contactPhone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {response.role}
                      </div>
                      <div className="text-sm text-gray-500">
                        {response.clubName && `${response.clubName}, `}
                        {response.city ? `${response.city}, ` : ''}{response.country}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        Traveled: {response.hasTraveledAbroad}
                      </div>
                      <div className="text-sm text-gray-500">
                        Prefers: {response.preferredTravelTime}
                      </div>
                      {response.travelFrequency && (
                        <div className="text-sm text-gray-500">
                          Frequency: {response.travelFrequency}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {response.budgetPerPerson}
                      </div>
                      <div className="text-sm text-gray-500">
                        Team: {response.teamSize}
                      </div>
                      <div className="text-sm text-gray-500">
                        Challenge: {response.biggestChallenge}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {response.event ? (
                      <div>
                        <Link
                          href={`/events/${response.event.id}`}
                          className="text-sm font-medium text-primary hover:text-primary/80"
                        >
                          {response.event.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {response.event.location}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">General Request</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/admin/survey-responses/${response.id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {responses.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No trip requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            Custom trip requests will appear here once users start submitting them.
          </p>
          <div className="mt-6">
            <Link
              href="/survey"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
            >
              View Trip Planner
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

