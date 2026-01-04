import Image from "next/image";
import Link from "next/link";

interface TwinClub {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string | null;
}

interface ClubTwinSectionProps {
  twinClub: TwinClub | null;
  clubName: string;
}

export default function ClubTwinSection({
  twinClub,
  clubName,
}: ClubTwinSectionProps) {
  return (
    <section id="twin-club" className="scroll-mt-24">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Twin Club
          <span className="ml-auto text-xs text-gray-400 font-normal">
            GAA Twinning Initiative
          </span>
        </h3>

        {twinClub ? (
          <Link
            href={`/clubs/${twinClub.id}`}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={
                  twinClub.imageUrl ||
                  "https://gaelic-trips-bucket.s3.eu-west-1.amazonaws.com/placeholder-crest.png"
                }
                alt={twinClub.name}
                fill
                className="rounded-full object-contain"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-primary">
                {twinClub.name}
              </h4>
              {twinClub.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {twinClub.location}
                </p>
              )}
            </div>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">No Twin Club Yet</h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {clubName} hasn&apos;t been twinned with an Irish or British club
              yet. The GAA Twinning Initiative connects clubs worldwide with
              clubs in Ireland and Britain.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
