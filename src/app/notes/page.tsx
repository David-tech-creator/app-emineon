export default function NotesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Notes & Communications</h1>
      <p className="text-gray-600 mb-6">Advanced note-taking and communication tracking coming soon...</p>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Notes</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-400 pl-4 py-2">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-gray-900">Interview Notes - John Smith</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <p className="text-gray-600 text-sm">Candidate showed strong technical skills in React and Node.js...</p>
          </div>
          
          <div className="border-l-4 border-green-400 pl-4 py-2">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-gray-900">Follow-up Scheduled - Sarah Johnson</span>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
            <p className="text-gray-600 text-sm">Scheduled second interview for frontend developer position...</p>
          </div>
          
          <div className="border-l-4 border-yellow-400 pl-4 py-2">
            <div className="flex justify-between items-start mb-1">
              <span className="font-medium text-gray-900">Reference Check - Mike Chen</span>
              <span className="text-sm text-gray-500">3 days ago</span>
            </div>
            <p className="text-gray-600 text-sm">Positive feedback from previous manager at Tech Corp...</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500">Advanced note-taking features</p>
          <button className="mt-2 text-blue-600 hover:text-blue-800 font-medium">Coming Soon</button>
        </div>
      </div>
    </div>
  );
} 