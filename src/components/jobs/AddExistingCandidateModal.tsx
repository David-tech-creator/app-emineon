'use client';

import { useState, useEffect } from 'react';
import { X, Search, User, MapPin, Mail, Phone, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';

interface AddExistingCandidateModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  onCandidateAdded: (candidate: any) => void;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentLocation?: string;
  technicalSkills?: string[];
  experienceYears?: number;
  summary?: string;
  profileToken?: string;
  status?: string;
  createdAt?: string;
  lastUpdated?: string;
}

export function AddExistingCandidateModal({ 
  open, 
  onClose, 
  jobId, 
  onCandidateAdded 
}: AddExistingCandidateModalProps) {
  const { getToken } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch candidates from API
  useEffect(() => {
    if (open) {
      fetchCandidates();
    }
  }, [open]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/candidates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch candidates:', errorData);
        alert(`Failed to fetch candidates: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      alert('Error fetching candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter candidates based on search query
  const filteredCandidates = candidates.filter(candidate => {
    const searchLower = searchQuery.toLowerCase();
    return (
      candidate.firstName?.toLowerCase().includes(searchLower) ||
      candidate.lastName?.toLowerCase().includes(searchLower) ||
      candidate.email?.toLowerCase().includes(searchLower) ||
      candidate.currentTitle?.toLowerCase().includes(searchLower) ||
      candidate.technicalSkills?.some(skill => skill?.toLowerCase().includes(searchLower))
    );
  });

  const handleCandidateToggle = (candidateId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleAddCandidates = async () => {
    if (selectedCandidates.length === 0) return;
    
    setIsSubmitting(true);
    try {
      console.log('Adding candidates to job:', { jobId, selectedCandidates });
      
      const token = await getToken();
      console.log('Auth token obtained:', token ? 'Yes' : 'No');
      
      const response = await fetch(`/api/jobs/${jobId}/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateIds: selectedCandidates }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error(`Server returned invalid JSON. Status: ${response.status}, Response: ${responseText}`);
      }

      if (!response.ok) {
        console.error('API Error Response:', result);
        throw new Error(result.error || result.message || `Failed to add candidates. Server responded with status ${response.status}`);
      }

      console.log('Success! Added candidates:', result);
      
      // Notify parent component
      selectedCandidates.forEach(candidateId => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
          onCandidateAdded(candidate);
        }
      });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error adding candidates:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to add candidates: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCandidates([]);
    setSearchQuery('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Add Existing Candidates</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select candidates from your database to add to this job
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates by name, email, title, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2F5A] focus:border-[#0A2F5A]"
            />
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#0A2F5A]" />
              <span className="ml-2 text-gray-600">Loading candidates...</span>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No candidates found' : 'No candidates in database'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms or create a new candidate.'
                  : 'Create your first candidate to get started.'
                }
              </p>
            </div>
                        ) : (
            <div className="space-y-3">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedCandidates.includes(candidate.id);
                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleCandidateToggle(candidate.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#0A2F5A] bg-[#0A2F5A]/5' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {candidate.firstName?.[0] || '?'}{candidate.lastName?.[0] || '?'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">
                            {candidate.firstName || 'Unknown'} {candidate.lastName || 'Unknown'}
                          </h4>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#0A2F5A] bg-[#0A2F5A]' : 'border-gray-300'
                          }`}>
                            {isSelected && <Plus className="h-3 w-3 text-white rotate-45" />}
                          </div>
                        </div>
                        
                        {candidate.currentTitle && (
                          <p className="text-sm text-gray-600 mt-1">{candidate.currentTitle}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {candidate.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{candidate.email}</span>
                            </div>
                          )}
                          {candidate.currentLocation && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{candidate.currentLocation}</span>
                            </div>
                          )}
                          {candidate.experienceYears && (
                            <span>{candidate.experienceYears} years exp.</span>
                          )}
                        </div>
                        
                        {candidate.technicalSkills && candidate.technicalSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.technicalSkills.slice(0, 4).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {candidate.technicalSkills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{candidate.technicalSkills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedCandidates.length > 0 && (
              <span>{selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <button
              onClick={handleAddCandidates}
              disabled={selectedCandidates.length === 0 || isSubmitting}
              className="px-6 py-2.5 bg-[#0A2F5A] text-white rounded-lg hover:bg-[#083248] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add Selected</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 