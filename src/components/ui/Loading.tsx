'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  showLogo?: boolean;
}

export function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  className,
  showLogo = true 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      className
    )}>
      {showLogo && (
        <div className="relative">
          {/* Main Logo */}
          <div className={cn(
            'relative animate-pulse',
            sizeClasses[size]
          )}>
            <Image
              src="/images/logos/Emineon logo_tree.png"
              alt="Emineon"
              width={size === 'xl' ? 96 : size === 'lg' ? 64 : size === 'md' ? 48 : 32}
              height={size === 'xl' ? 96 : size === 'lg' ? 64 : size === 'md' ? 48 : 32}
              className="object-contain animate-spin-slow"
              onError={(e) => {
                // Fallback to primary logo
                e.currentTarget.src = "/images/logos/Emineon logo_no background.png";
              }}
            />
          </div>
          
          {/* Spinning Ring */}
          <div className={cn(
            'absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin',
            sizeClasses[size]
          )} />
        </div>
      )}
      
      {text && (
        <div className="text-center">
          <p className={cn(
            'font-medium text-primary-700 animate-pulse',
            textSizeClasses[size]
          )}>
            {text}
          </p>
          <p className="text-xs text-primary-500 mt-1 animate-pulse">
            Powered by Emineon Intelligence
          </p>
        </div>
      )}
    </div>
  );
}

// Full-page loading overlay
export function FullPageLoading({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <Loading size="xl" text={text} />
      </div>
    </div>
  );
}

// Add the slow spin animation to your global CSS or Tailwind config
// @keyframes spin-slow {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// }
// .animate-spin-slow {
//   animation: spin-slow 3s linear infinite;
// } 