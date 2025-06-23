'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, UserPlus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AddCandidateDropdownProps {
  onAddExisting: () => void;
  onCreateNew: () => void;
  className?: string;
}

export function AddCandidateDropdown({ onAddExisting, onCreateNew, className = '' }: AddCandidateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Candidate</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onAddExisting();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Add Existing Candidate</div>
                <div className="text-sm text-gray-500">Select from your database</div>
              </div>
            </button>
            
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Create New Candidate</div>
                <div className="text-sm text-gray-500">Upload CV, LinkedIn, or manual entry</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 