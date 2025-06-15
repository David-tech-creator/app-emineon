'use client';

import { UserProfile, SignOutButton, useUser } from '@clerk/nextjs';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  Mail, 
  Calendar,
  Activity,
  Bell,
  Lock,
  Smartphone
} from 'lucide-react';
import { useState } from 'react';

export default function UserPage() {
  const { user, isLoaded } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isLoaded) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const userRole = (user?.publicMetadata as any)?.role || 'user';
  const lastSignIn = user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never';
  const accountCreated = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900">Account Settings</h1>
          <p className="text-secondary-600 mt-1">
            Manage your account settings, preferences, and security
          </p>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900">Account Info</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Role:</span>
                <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member since:</span>
                <span className="text-sm font-medium">{accountCreated}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Activity</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last sign in:</span>
                <span className="text-sm font-medium">{lastSignIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sessions:</span>
                <span className="text-sm font-medium">1 active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Security</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">2FA:</span>
                <Badge variant={user?.twoFactorEnabled ? 'default' : 'secondary'}>
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email verified:</span>
                <Badge variant={user?.primaryEmailAddress?.verification?.status === 'verified' ? 'default' : 'secondary'}>
                  {user?.primaryEmailAddress?.verification?.status === 'verified' ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Settings className="h-5 w-5 text-primary-600" />
              <span>Quick Actions</span>
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex items-center space-x-2 justify-start h-auto py-3"
                onClick={() => {
                  const profileElement = document.querySelector('[data-clerk-element="profile"]');
                  if (profileElement) {
                    profileElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <User className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 justify-start h-auto py-3"
                onClick={() => {
                  const securityElement = document.querySelector('[data-clerk-element="security"]');
                  if (securityElement) {
                    securityElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Lock className="h-4 w-4" />
                <span>Security Settings</span>
              </Button>

              <Button
                variant="outline"
                className="flex items-center space-x-2 justify-start h-auto py-3"
                onClick={() => {
                  const notificationsElement = document.querySelector('[data-clerk-element="notifications"]');
                  if (notificationsElement) {
                    notificationsElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </Button>

              <Button
                variant="danger"
                className="flex items-center space-x-2 justify-start h-auto py-3"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <LogOut className="h-5 w-5 text-red-600" />
                  <span>Confirm Sign Out</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to sign out of your account?
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowLogoutConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <SignOutButton>
                    <Button variant="danger" className="flex-1">
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Profile Component */}
        <div className="flex justify-center" data-clerk-element="profile">
          <UserProfile
            appearance={{
              elements: {
                card: 'shadow-medium border border-secondary-200',
                headerTitle: 'text-primary-900',
                headerSubtitle: 'text-secondary-600',
                formButtonPrimary: 'btn-primary',
                formButtonSecondary: 'btn-secondary',
                navbarButton: 'text-secondary-700 hover:text-primary-700',
                navbarButtonIcon: 'text-secondary-500',
              }
            }}
          />
        </div>
      </div>
    </Layout>
  );
} 