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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Share2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Distribution & Social Media</h1>
            <p className="text-gray-600">Distribute your job postings across multiple platforms and social networks</p>
          </div>
        </div>

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
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob === job.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedJob(job.id)}
                  >
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <p className="text-xs text-gray-500">{job.location} • {job.employmentType}</p>
                    <p className="text-xs text-gray-400 mt-1">Created: {job.createdAt}</p>
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
                    <Share2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No distribution in progress</p>
                    <p className="text-xs text-gray-400">Select a job and click distribute to start</p>
                  </div>
                ) : (
                  distributionStatus.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status.status)}
                        <div>
                          <p className="font-medium text-sm">{status.platform}</p>
                          <p className="text-xs text-gray-500 capitalize">{status.status}</p>
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
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
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
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">Success Rate</span>
                        <span className="text-lg font-bold text-blue-600">{successRate}%</span>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">Total Cost</span>
                        <span className="text-lg font-bold text-green-600">${totalCost}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Platforms</span>
                        <span className="text-lg font-bold text-gray-600">
                          {distributionStatus.filter(s => s.status === 'posted').length} / {distributionStatus.length}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Available Platforms</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePlatforms.map((platform) => (
                      <div key={platform} className="text-xs bg-gray-100 px-2 py-1 rounded text-center">
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Social Media Integration</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>LinkedIn</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Twitter</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Facebook</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Instagram</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 