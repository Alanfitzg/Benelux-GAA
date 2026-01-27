import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero section skeleton */}
      <div className="bg-gradient-to-r from-primary via-primary-light to-secondary text-white">
        <div className="container mx-auto px-6 py-16 text-center">
          <Skeleton className="h-10 w-80 mx-auto mb-4 bg-white/20" />
          <Skeleton className="h-6 w-96 mx-auto mb-8 bg-white/10" />
          <Skeleton className="h-12 w-40 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Filters skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <Skeleton className="h-6 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Events grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
