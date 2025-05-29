'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useUser, useOrganization } from '@clerk/nextjs';
import { Users, UserPlus, Building2, Briefcase, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();

  const stats = [
    {
      name: 'Total Candidates',
      value: '24',
      change: '+12%',
      changeType: 'increase' as const,
      icon: Users,
    },
    {
      name: 'Active Jobs',
      value: '8',
      change: '+2',
      changeType: 'increase' as const,
      icon: Briefcase,
    },
    {
      name: 'Clients',
      value: '12',
      change: '-1',
      changeType: 'decrease' as const,
      icon: Building2,
    },
    {
      name: 'Recent Applications',
      value: '6',
      change: 'Last 24h',
      changeType: 'neutral' as const,
      icon: Clock,
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-secondary-600 text-lg">
            Here's what's happening with your recruitment pipeline today.
          </p>
          {organization && (
            <p className="text-sm text-primary-600 mt-2">
              Organization: <span className="font-medium">{organization.name}</span>
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} variant="elevated" className="card-hover">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-primary-900">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${
                      stat.changeType === 'increase' 
                        ? 'text-success-600' 
                        : stat.changeType === 'decrease'
                        ? 'text-error-600'
                        : 'text-secondary-500'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-xl">
                    <stat.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="elevated">
            <CardHeader title="Recent Candidates">
              <div></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary-900">New candidate added</p>
                    <p className="text-sm text-secondary-600">John Smith applied for Senior Developer</p>
                  </div>
                  <span className="text-xs text-secondary-500">2h ago</span>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
                  <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary-900">Interview scheduled</p>
                    <p className="text-sm text-secondary-600">Sarah Johnson - Frontend Developer</p>
                  </div>
                  <span className="text-xs text-secondary-500">4h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Quick Actions">
              <div></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add New Candidate</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Post New Job</span>
                </button>
                
                <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Add Client</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 