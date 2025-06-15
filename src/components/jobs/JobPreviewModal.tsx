'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { X, Download, Eye, FileText, Image } from 'lucide-react';
import { type JobTemplate } from '@/data/job-templates';

interface JobPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobData: {
    title: string;
    company: string;
    location: string;
    contractType: string;
    workMode: string;
    description: string;
    skills: string[];
    salary?: string;
    department?: string;
    startDate?: string;
    languages?: string[];
    priority?: string;
  };
  logoUrl?: string;
  selectedFields: {
    title: boolean;
    company: boolean;
    location: boolean;
    contractType: boolean;
    workMode: boolean;
    department: boolean;
    salary: boolean;
    description: boolean;
    skills: boolean;
    languages: boolean;
    startDate: boolean;
    duration: boolean;
    priority: boolean;
  };
  selectedTemplate?: JobTemplate | null;
  onDownload: (format: 'pdf' | 'docx') => void;
}

export function JobPreviewModal({ 
  isOpen, 
  onClose, 
  jobData, 
  logoUrl, 
  selectedFields, 
  selectedTemplate,
  onDownload 
}: JobPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get template colors or use default blue
  const primaryColor = selectedTemplate?.colorHex || '#3B82F6';
  const fontFamily = selectedTemplate?.font || 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';

  if (!isOpen) return null;

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setIsDownloading(true);
    try {
      await onDownload(format);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Eye className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Job Description Preview</h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={() => handleDownload('docx')}
              disabled={isDownloading}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download DOCX
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardContent className="p-8">
              <div 
                className="w-full bg-white text-black"
                style={{ 
                  fontFamily: fontFamily,
                  lineHeight: '1.6'
                }}
              >
                {/* Header */}
                <div 
                  className="flex items-start justify-between mb-8 pb-6 border-b-2"
                  style={{ borderColor: primaryColor }}
                >
                  <div className="flex-1">
                    {selectedFields.title && (
                      <h1 
                        className="text-3xl font-bold mb-2"
                        style={{ color: primaryColor }}
                      >
                        {jobData.title || 'Job Title'}
                      </h1>
                    )}
                    {selectedFields.company && (
                      <h2 className="text-xl text-gray-600 mb-2 font-normal">
                        {jobData.company || 'Company Name'}
                      </h2>
                    )}
                    {selectedFields.location && (
                      <div className="text-gray-500 text-base">
                        📍 {jobData.location || 'Location'}
                      </div>
                    )}
                  </div>
                  <div className="ml-6">
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt="Company logo" 
                        className="max-h-20 max-w-48 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                  {selectedFields.contractType && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Contract Type</div>
                      <div className="text-gray-900 capitalize">
                        {jobData.contractType || 'Permanent'}
                      </div>
                    </div>
                  )}
                  {selectedFields.workMode && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Work Mode</div>
                      <div className="text-gray-900 capitalize">
                        {jobData.workMode || 'Hybrid'}
                      </div>
                    </div>
                  )}
                  {selectedFields.department && jobData.department && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Department</div>
                      <div className="text-gray-900">{jobData.department}</div>
                    </div>
                  )}
                  {selectedFields.salary && jobData.salary && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Salary</div>
                      <div className="text-gray-900">{jobData.salary}</div>
                    </div>
                  )}
                  {selectedFields.startDate && jobData.startDate && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Start Date</div>
                      <div className="text-gray-900">
                        {new Date(jobData.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {selectedFields.priority && jobData.priority && (
                    <div className="text-center">
                      <div className="font-bold text-gray-600 text-sm mb-1">Priority</div>
                      <div className="text-gray-900 capitalize">{jobData.priority}</div>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                {selectedFields.description && (
                  <div className="mb-8">
                    <h3 
                      className="text-xl font-semibold mb-4 pb-2 border-b border-gray-300"
                      style={{ color: primaryColor }}
                    >
                      Job Description
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {jobData.description || 'Job description will be provided.'}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {selectedFields.skills && jobData.skills && jobData.skills.length > 0 && (
                  <div className="mb-8">
                    <h3 
                      className="text-xl font-semibold mb-4 pb-2 border-b border-gray-300"
                      style={{ color: primaryColor }}
                    >
                      Required Skills
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {jobData.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="text-white px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedFields.languages && jobData.languages && jobData.languages.length > 0 && (
                  <div className="mb-8">
                    <h3 
                      className="text-xl font-semibold mb-4 pb-2 border-b border-gray-300"
                      style={{ color: primaryColor }}
                    >
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {jobData.languages.map((language, index) => (
                        <span 
                          key={index}
                          className="text-white px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
                  Generated on {new Date().toLocaleDateString()} | {jobData.company}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 