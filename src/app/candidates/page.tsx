'use client';

import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { useCandidates } from '@/hooks/useCandidates';
import { formatSkills, formatDate } from '@/lib/utils';
import { Users, Mail, Calendar, Briefcase, Plus } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const { candidates, isLoading, error } = useCandidates();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary-900">Candidates</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent>
                  <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-4 bg-secondary-200 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-secondary-200 rounded mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-error-600 mb-4">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">Error loading candidates</h3>
            <p className="text-sm text-secondary-600 mt-2">
              {error.message || 'Something went wrong'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Candidates</h1>
            <p className="text-secondary-600 mt-1">
              Manage your candidate pool and track applications
            </p>
          </div>
          <Link href="/candidates/new" className="btn-primary flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Candidate</span>
          </Link>
        </div>

        {candidates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No candidates yet
              </h3>
              <p className="text-secondary-600 mb-6">
                Get started by adding your first candidate to the system.
              </p>
              <Link href="/candidates/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Your First Candidate</span>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <Card key={candidate.id} variant="elevated" className="card-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-700 font-semibold text-lg">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-900 text-lg">
                          {candidate.name}
                        </h3>
                        <div className="flex items-center text-secondary-600 text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {candidate.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 text-secondary-500 mr-2" />
                      <span className="text-secondary-700">
                        {candidate.experience} years experience
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-secondary-700 mb-1">Skills:</p>
                      <p className="text-sm text-secondary-600">
                        {formatSkills(candidate.skills)}
                      </p>
                    </div>
                    
                    <div className="flex items-center text-xs text-secondary-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {formatDate(candidate.createdAt)}
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <div className="flex space-x-2 w-full">
                    <button className="flex-1 btn-secondary text-sm">
                      View Profile
                    </button>
                    <button className="flex-1 btn-primary text-sm">
                      Schedule Interview
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
} 