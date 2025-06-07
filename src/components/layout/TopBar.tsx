'use client';

import { UserButton, useUser, useOrganization } from '@clerk/nextjs';
import { Bell, Settings } from 'lucide-react';
import Image from 'next/image';

export function TopBar() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          {/* Organization Info */}
          {organization && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-secondary-50 rounded-lg">
              <span className="text-sm text-secondary-600">Organization:</span>
              <span className="text-sm font-medium text-secondary-900">
                {organization.name}
              </span>
            </div>
          )}

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-primary-50 rounded-lg">
            <span className="text-sm text-primary-600">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>

          {/* Notifications */}
          <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* Settings */}
          <button className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* User Menu */}
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
                userButtonPopoverCard: "shadow-lg border border-secondary-200",
                userButtonPopoverActions: "text-secondary-700"
              }
            }}
            afterSignOutUrl="/sign-in"
          />
        </div>
      </div>
    </header>
  );
} 