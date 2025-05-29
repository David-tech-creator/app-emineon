import { UserProfile } from '@clerk/nextjs';
import { Layout } from '@/components/layout/Layout';

export default function UserPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900">User Profile</h1>
          <p className="text-secondary-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex justify-center">
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