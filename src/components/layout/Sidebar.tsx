'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Building2, 
  Briefcase,
  ChevronRight,
  ClipboardList,
  BarChart3,
  FileText,
  Activity
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Candidates',
    href: '/candidates',
    icon: Users,
  },
  {
    name: 'Add Candidate',
    href: '/candidates/new',
    icon: UserPlus,
  },
  {
    name: 'Assignments',
    href: '/assignments',
    icon: ClipboardList,
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: Building2,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: FileText,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: Activity,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-secondary-200 h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-8">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="ml-3 text-xl font-semibold text-primary-900">
            Emineon ATS
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 transition-colors',
                  isActive
                    ? 'text-primary-700'
                    : 'text-secondary-500 group-hover:text-secondary-700'
                )}
              />
              {item.name}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-primary-700" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 