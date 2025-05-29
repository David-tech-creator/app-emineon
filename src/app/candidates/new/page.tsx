'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { candidateFormSchema, type CandidateFormData } from '@/lib/validation';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewCandidatePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
  });

  const onSubmit = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      // Transform the form data to match API expectations
      const candidateData = {
        name: data.name,
        email: data.email,
        skills: data.skills, // Already transformed by Zod
        experience: data.experience, // Already transformed by Zod
      };

      const response = await api.candidates.create(candidateData, token || undefined);
      
      if (response.success) {
        reset();
        router.push('/candidates');
      } else {
        throw new Error(response.error || 'Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      alert('Failed to create candidate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/candidates" 
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Add New Candidate</h1>
            <p className="text-secondary-600 mt-1">
              Enter candidate information to add them to your talent pool
            </p>
          </div>
        </div>

        <Card variant="elevated">
          <CardHeader title="Candidate Information" />
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="input-field"
                  placeholder="Enter candidate's full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="input-field"
                  placeholder="candidate@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-2">
                  Skills *
                </label>
                <input
                  {...register('skills')}
                  type="text"
                  id="skills"
                  className="input-field"
                  placeholder="JavaScript, React, Node.js, TypeScript"
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Separate skills with commas
                </p>
                {errors.skills && (
                  <p className="mt-1 text-sm text-error-600">{errors.skills.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-secondary-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  {...register('experience')}
                  type="number"
                  id="experience"
                  min="0"
                  max="50"
                  className="input-field"
                  placeholder="5"
                />
                {errors.experience && (
                  <p className="mt-1 text-sm text-error-600">{errors.experience.message}</p>
                )}
              </div>

              <div className="flex space-x-4 pt-6">
                <Link 
                  href="/candidates" 
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Create Candidate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 