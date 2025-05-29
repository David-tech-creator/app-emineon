'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { MessageSquare, Clock, Plus } from 'lucide-react';

export default function NotesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Notes & Communications</h1>
            <p className="text-secondary-600 mt-1">Track candidate interactions and recruitment notes</p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        </div>
        
        <Card variant="elevated">
          <CardHeader title="Recent Notes">
            <div></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">Interview Notes - John Smith</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>2 hours ago</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Candidate showed strong technical skills in React and Node.js. Excellent problem-solving approach during coding interview.</p>
              </div>
              
              <div className="border-l-4 border-green-400 pl-4 py-3 bg-green-50 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">Follow-up Scheduled - Sarah Johnson</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>1 day ago</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Scheduled second interview for frontend developer position. Client expressed strong interest.</p>
              </div>
              
              <div className="border-l-4 border-yellow-400 pl-4 py-3 bg-yellow-50 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900">Reference Check - Mike Chen</span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>3 days ago</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Positive feedback from previous manager at Tech Corp. Highlighted leadership and technical expertise.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="elevated" className="border-2 border-dashed border-gray-300">
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Advanced note-taking features</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">Coming Soon</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 