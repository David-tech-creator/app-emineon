export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      <p className="text-gray-600 mb-6">Advanced reporting and candidate analytics coming soon...</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Candidate Reports</h3>
          <p className="text-gray-600 text-sm mb-4">Generate detailed candidate profiles and assessments</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Pipeline Analytics</h3>
          <p className="text-gray-600 text-sm mb-4">Track conversion rates and bottlenecks</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Performance Metrics</h3>
          <p className="text-gray-600 text-sm mb-4">Time-to-hire and success metrics</p>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
        </div>
      </div>
    </div>
  );
} 