'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Building2, 
  Briefcase,
  ChevronRight,
  ChevronDown,
  ClipboardList,
  BarChart3,
  FileText,
  Activity,
  Brain,
  Share2,
  Video,
  Workflow,
  User,
  Settings,
  TrendingUp,
  Plus,
  Mail
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface NavigationSection {
  name: string;
  icon: any;
  items: NavigationItem[];
  collapsible?: boolean;
}

const navigationSections: NavigationSection[] = [
  {
    name: 'Home',
    icon: LayoutDashboard,
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
    collapsible: false,
  },
  {
    name: 'Talent',
    icon: Users,
    items: [
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
        name: 'Assessments',
        href: '/assessments',
        icon: ClipboardList,
      },
      {
        name: 'Video Interviews',
        href: '/video-interviews',
        icon: Video,
      },
      {
        name: 'Tasks',
        href: '/assignments',
        icon: ClipboardList,
      },
    ],
    collapsible: true,
  },
  {
    name: 'Jobs',
    icon: Briefcase,
    items: [
      {
        name: 'Jobs',
        href: '/jobs',
        icon: Briefcase,
      },
      {
        name: 'Job Distribution',
        href: '/job-distribution',
        icon: Share2,
      },
      {
        name: 'AI Tools',
        href: '/ai-tools',
        icon: Brain,
      },
      {
        name: 'Outreach',
        href: '/outreach',
        icon: Mail,
      },
    ],
    collapsible: true,
  },
  {
    name: 'Clients',
    icon: Building2,
    items: [
      {
        name: 'Clients',
        href: '/clients',
        icon: Building2,
      },
      {
        name: 'Notes',
        href: '/notes',
        icon: FileText,
      },
    ],
    collapsible: true,
  },
  {
    name: 'Automation',
    icon: Workflow,
    items: [
      {
        name: 'Workflows',
        href: '/workflows',
        icon: Workflow,
      },
    ],
    collapsible: true,
  },
  {
    name: 'Insights',
    icon: TrendingUp,
    items: [
      {
        name: 'Reports',
        href: '/reports',
        icon: BarChart3,
      },
      {
        name: 'Analytics',
        href: '/analytics',
        icon: Activity,
      },
    ],
    collapsible: true,
  },
  {
    name: 'Account',
    icon: User,
    items: [
      {
        name: 'Profile',
        href: '/user',
        icon: User,
      },
    ],
    collapsible: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isItemActive = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href));
  };

  const isSectionActive = (section: NavigationSection) => {
    return section.items.some(item => isItemActive(item.href));
  };

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

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <Link
              href="/candidates/new"
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Candidate
            </Link>
            <Link
              href="/jobs"
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus className="h-3 w-3 mr-2" />
              Add Job
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-2">
        {navigationSections.map((section) => {
          const sectionActive = isSectionActive(section);
          const isCollapsed = collapsedSections.includes(section.name);
          const showItems = !section.collapsible || !isCollapsed;

          return (
            <div key={section.name} className="space-y-1">
              {/* Section Header */}
              {section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-lg transition-all duration-200',
                    sectionActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-secondary-500 hover:text-secondary-700 hover:bg-secondary-50'
                  )}
                >
                  <div className="flex items-center">
                    <section.icon className="h-4 w-4 mr-2" />
                    {section.name}
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              ) : (
                <div className="px-3 py-2 text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                  <div className="flex items-center">
                    <section.icon className="h-4 w-4 mr-2" />
                    {section.name}
                  </div>
                </div>
              )}

              {/* Section Items */}
              {showItems && (
                <div className="space-y-1 ml-2">
                  {section.items.map((item) => {
                    const isActive = isItemActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-4 w-4 transition-colors',
                            isActive
                              ? 'text-primary-700'
                              : 'text-secondary-500 group-hover:text-secondary-700'
                          )}
                        />
                        {item.name}
                        {isActive && (
                          <ChevronRight className="ml-auto h-3 w-3 text-primary-700" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
} 