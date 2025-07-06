'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Users, CheckCircle, Clock, UserCheck, Search, FileText, Target, BarChart3, Workflow } from 'lucide-react';

export default function AssignmentsPage() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-primary-600 to-primary-800 rounded-3xl">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-8 right-40 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-white leading-tight mb-2">
                    Project Assignment Hub
                  </h1>
                  <p className="text-xl text-blue-100">
                    Track candidate assignments and pipeline progression with intelligent workflow management
                  </p>
                </div>
                
                {/* Features Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Workflow className="h-4 w-4 mr-2" />
                    Pipeline Tracking
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Target className="h-4 w-4 mr-2" />
                    Progress Monitoring
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics Dashboard
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 text-white">
                  <div>
                    <p className="text-2xl font-bold">13</p>
                    <p className="text-blue-200 text-sm">Active Assignments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-blue-200 text-sm">In Progress</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-blue-200 text-sm">Completion Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.2</p>
                    <p className="text-blue-200 text-sm">Avg. Days to Complete</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Large Icon */}
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FileText className="w-16 h-16 text-white opacity-80" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
                    <h3 className="font-medium text-purple-900 mb-1">Communication</h3>
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
                <Button variant="ghost">Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 