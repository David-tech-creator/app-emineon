export default function AssignmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Assignments</h1>
      <p className="text-gray-600 mb-4">Advanced assignment tracking with pipeline stages coming soon...</p>
      
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Applied</h3>
          <p className="text-2xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-medium text-yellow-900">Long List</h3>
          <p className="text-2xl font-bold text-yellow-600">4</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-medium text-green-900">Short List</h3>
          <p className="text-2xl font-bold text-green-600">1</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-medium text-purple-900">Outreach</h3>
          <p className="text-2xl font-bold text-purple-600">3</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-medium text-red-900">Screening</h3>
          <p className="text-2xl font-bold text-red-600">2</p>
        </div>
      </div>
    </div>
  );
} 