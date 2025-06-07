'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Brain, Shield, Zap, Users, Building2, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-teal-50">
      <div className="flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
            <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-32 left-40 w-16 h-16 border border-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center px-12 py-20">
            {/* Logo */}
            <div className="mb-12">
              <Link href="/" className="flex items-center group">
                <div className="relative w-16 h-16 mr-4 transition-transform group-hover:scale-105">
                  <Image
                    src="/images/logos/Emineon logo_tree_white.png"
                    alt="Emineon"
                    width={64}
                    height={64}
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/logos/Emineon logo_no background.png";
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-white leading-tight">
                    Emineon
                  </span>
                  <span className="text-sm font-medium text-blue-100 uppercase tracking-wide">
                    ATS Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Value Proposition */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                Intelligent Recruitment
                <br />
                <span className="text-blue-200">Redefined</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Harness the power of AI to transform your talent acquisition process. 
                From smart candidate matching to predictive analytics, Emineon empowers 
                your team to make better hiring decisions faster.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: 'AI-Powered Matching',
                  description: 'Advanced algorithms find the perfect candidates'
                },
                {
                  icon: Shield,
                  title: 'Enterprise Security',
                  description: 'GDPR compliant with bank-level encryption'
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Reduce time-to-hire by 60% on average'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '10k+', label: 'Companies' },
                  { value: '500k+', label: 'Candidates' },
                  { value: '99.9%', label: 'Uptime' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex justify-center mb-8 lg:hidden">
              <Link href="/" className="flex items-center">
                <div className="relative w-12 h-12 mr-3">
                  <Image
                    src="/images/logos/Emineon logo_no background.png"
                    alt="Emineon"
                    width={48}
                    height={48}
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/images/logos/Emineon logo_tree.png";
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-primary-900">
                    Emineon
                  </span>
                  <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                    ATS Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-neutral-600">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-emineon p-8">
              {children}
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-neutral-500">
              <p>
                Trusted by leading companies worldwide
              </p>
              <div className="flex justify-center items-center space-x-6 mt-4 opacity-60">
                <Users className="h-4 w-4" />
                <Building2 className="h-4 w-4" />
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 