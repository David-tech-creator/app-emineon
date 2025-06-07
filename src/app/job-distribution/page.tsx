'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Share2, Globe, DollarSign, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface JobDistributionStatus {
  platform: string;
  status: 'pending' | 'posted' | 'failed';
  cost: number;
  url?: string;
  error?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  createdAt: string;
}

export default function JobDistributionPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [distributionStatus, setDistributionStatus] = useState<JobDistributionStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    setJobs([
      {
        id: '1',
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        employmentType: 'full-time',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'Frontend Developer',
        company: 'Startup XYZ',
        location: 'Remote',
        employmentType: 'contract',
        createdAt: '2024-01-14'
      }
    ]);

    setAvailablePlatforms([
      'Indeed', 'LinkedIn', 'Glassdoor', 'ZipRecruiter', 'Monster',
      'CareerBuilder', 'AngelList', 'Stack Overflow', 'GitHub Jobs', 'Dice'
    ]);
  }, []);

  const handleDistribute = async () => {
    if (!selectedJob) {
      alert('Please select a job to distribute');
      return;
    }

    setIsLoading(true);
    try {
      // First, get available platforms
      const platformsResponse = await fetch(`/api/jobs/${selectedJob}/distribute`);
      const platformsData = await platformsResponse.json();

      // Then initiate distribution
      const distributeResponse = await fetch(`/api/jobs/${selectedJob}/distribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: availablePlatforms,
          socialMedia: true,
          budget: 500 // Example budget
        })
      });

      const result = await distributeResponse.json();
      
      if (result.success) {
        // Simulate status updates
        const mockStatuses: JobDistributionStatus[] = availablePlatforms.map(platform => ({
          platform,
          status: Math.random() > 0.2 ? 'posted' : Math.random() > 0.5 ? 'pending' : 'failed',
          cost: Math.floor(Math.random() * 50) + 10,
          url: Math.random() > 0.3 ? `https://${platform.toLowerCase()}.com/job/${selectedJob}` : undefined,
          error: Math.random() > 0.8 ? 'API limit reached' : undefined
        }));
        
        setDistributionStatus(mockStatuses);
      }
    } catch (error) {
      console.error('Distribution failed:', error);
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const totalCost = distributionStatus.reduce((sum, status) => 
    status.status === 'posted' ? sum + status.cost : sum, 0
  );

  const successRate = distributionStatus.length > 0 
    ? (distributionStatus.filter(s => s.status === 'posted').length / distributionStatus.length * 100).toFixed(1)
    : '0';

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
                    Multi-Platform Job Distribution
                  </h1>
                  <p className="text-xl text-blue-100">
                    Distribute your job postings across multiple platforms and social networks with automated intelligence
                  </p>
                </div>
                
                {/* Features Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Globe className="h-4 w-4 mr-2" />
                    Multi-Platform Reach
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cost Optimization
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Success Tracking
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 text-white">
                  <div>
                    <p className="text-2xl font-bold">{availablePlatforms.length}</p>
                    <p className="text-blue-200 text-sm">Available Platforms</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{successRate}%</p>
                    <p className="text-blue-200 text-sm">Success Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${totalCost}</p>
                    <p className="text-blue-200 text-sm">Total Cost</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{distributionStatus.filter(s => s.status === 'posted').length}</p>
                    <p className="text-blue-200 text-sm">Active Postings</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Large Icon */}
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Share2 className="w-16 h-16 text-white opacity-80" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Selection */}
            <Card>
              <CardHeader title="Select Job to Distribute">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className={`p-4 border rounded-xl cursor-pointer transition-colors hover:shadow-sm ${
                        selectedJob === job.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedJob(job.id)}
                    >
                      <h4 className="font-medium text-neutral-900">{job.title}</h4>
                      <p className="text-sm text-neutral-600">{job.company}</p>
                      <p className="text-xs text-neutral-500">{job.location} • {job.employmentType}</p>
                      <p className="text-xs text-neutral-400 mt-1">Created: {job.createdAt}</p>
                    </div>
                  ))}

                  <Button
                    onClick={handleDistribute}
                    disabled={!selectedJob || isLoading}
                    isLoading={isLoading}
                    fullWidth
                    className="mt-4"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Distribute to All Platforms
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Distribution Status */}
            <Card>
              <CardHeader title="Distribution Status">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {distributionStatus.length === 0 ? (
                    <div className="text-center py-8">
                      <Share2 className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                      <p className="text-neutral-500">No distribution in progress</p>
                      <p className="text-xs text-neutral-400">Select a job and click distribute to start</p>
                    </div>
                  ) : (
                    distributionStatus.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status.status)}
                          <div>
                            <p className="font-medium text-sm">{status.platform}</p>
                            <p className="text-xs text-neutral-500 capitalize">{status.status}</p>
                            {status.error && (
                              <p className="text-xs text-red-500">{status.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {status.status === 'posted' && (
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-green-600">${status.cost}</p>
                              {status.url && (
                                <a
                                  href={status.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-primary-600 hover:text-primary-800"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  View
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analytics & Summary */}
            <Card>
              <CardHeader title="Distribution Analytics">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {distributionStatus.length > 0 && (
                    <>
                      <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary-900">Success Rate</span>
                          <span className="text-lg font-bold text-primary-600">{successRate}%</span>
                        </div>
                      </div>

                      <div className="bg-success-50 p-4 rounded-xl border border-success-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-success-900">Total Cost</span>
                          <span className="text-lg font-bold text-success-600">${totalCost}</span>
                        </div>
                      </div>

                      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-900">Platforms</span>
                          <span className="text-lg font-bold text-neutral-600">
                            {distributionStatus.filter(s => s.status === 'posted').length} / {distributionStatus.length}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Available Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {availablePlatforms.map((platform) => (
                        <span key={platform} className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-200">
                    <h4 className="font-medium text-neutral-900 mb-2">Social Media Integration</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>LinkedIn</span>
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Twitter</span>
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Facebook</span>
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Instagram</span>
                        <CheckCircle className="h-4 w-4 text-success-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
} 