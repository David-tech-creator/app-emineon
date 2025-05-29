export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics & Insights</h1>
      <p className="text-gray-600 mb-6">Advanced analytics and recruitment insights coming soon...</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Avg. Time to Hire</h3>
          <p className="text-3xl font-bold">18.5</p>
          <p className="text-blue-100 text-sm">days</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <p className="text-3xl font-bold">87%</p>
          <p className="text-green-100 text-sm">placements</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Pipeline Health</h3>
          <p className="text-3xl font-bold">92%</p>
          <p className="text-purple-100 text-sm">efficiency</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Client Satisfaction</h3>
          <p className="text-3xl font-bold">4.8</p>
          <p className="text-orange-100 text-sm">/ 5.0 rating</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recruitment Funnel</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications</span>
              <span className="font-medium">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Screened</span>
              <span className="font-medium">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Interviewed</span>
              <span className="font-medium">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Offers</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Hired</span>
              <span className="font-medium text-green-600">8</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Detailed funnel analysis coming soon...</p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performing Sources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">LinkedIn</span>
              <span className="font-medium">42%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Indeed</span>
              <span className="font-medium">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Referrals</span>
              <span className="font-medium">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Company Website</span>
              <span className="font-medium">12%</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Source performance tracking coming soon...</p>
        </div>
      </div>
    </div>
  );
} 