"use client";

interface ClubContactCardProps {
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactCountryCode?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  isSuperAdmin?: boolean;
}

export default function ClubContactCard({
  contactEmail,
  contactPhone,
  contactCountryCode,
  contactFirstName,
  contactLastName,
  isSuperAdmin = false,
}: ClubContactCardProps) {
  const contactName = [contactFirstName, contactLastName]
    .filter(Boolean)
    .join(" ");

  if (!isSuperAdmin) {
    return null;
  }

  const hasAnyContact = contactName || contactEmail || contactPhone;

  if (!hasAnyContact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Contact Info
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Admin Only
          </span>
        </h3>
        <p className="text-gray-500 text-sm italic">
          No contact information available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
        Contact Info
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
          Admin Only
        </span>
      </h3>

      <div className="space-y-4">
        {contactName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <span className="text-gray-700">{contactName}</span>
          </div>
        )}

        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="truncate">{contactEmail}</span>
          </a>
        )}

        {contactPhone && (
          <a
            href={`tel:${contactCountryCode ? `+${contactCountryCode}` : ""}${contactPhone}`}
            className="flex items-center gap-3 text-gray-700 hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <span>
              {contactCountryCode && `+${contactCountryCode} `}
              {contactPhone}
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
