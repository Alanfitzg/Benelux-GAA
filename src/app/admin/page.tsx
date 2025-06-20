import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/admin/events" 
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Events
              </h2>
              <p className="text-gray-600 mt-1">Create, edit, and delete tournament events</p>
            </div>
          </div>
        </Link>
        
        <Link 
          href="/admin/clubs" 
          className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-primary/30"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🏛️</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-primary transition-colors">
                Manage Clubs
              </h2>
              <p className="text-gray-600 mt-1">Create, edit, and delete club information</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 