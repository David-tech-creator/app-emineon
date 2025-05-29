'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Users, CheckCircle, Clock, UserCheck, Search } from 'lucide-react';

export default function AssignmentsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Assignments</h1>
          <p className="text-secondary-600 mt-1">Track candidate assignments and pipeline progression</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Applied</h3>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-900 mb-1">Long List</h3>
                  <p className="text-2xl font-bold text-yellow-600">4</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Short List</h3>
                  <p className="text-2xl font-bold text-green-600">1</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-purple-900 mb-1">Outreach</h3>
                  <p className="text-2xl font-bold text-purple-600">3</p>
                </div>
                <Search className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card variant="elevated" className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Screening</h3>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </div>
                <UserCheck className="h-6 w-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card variant="elevated" className="border-2 border-dashed border-gray-300">
          <CardContent>
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Assignment Tracking</h3>
              <p className="text-gray-600 mb-4">Pipeline management with drag & drop, automated workflows, and detailed analytics</p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">Coming Soon</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 