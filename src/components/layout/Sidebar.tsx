'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
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
  Mail,
  Bot,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

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
    name: 'Jobs',
    icon: Briefcase,
    items: [
      {
        name: 'Jobs',
        href: '/jobs',
        icon: Briefcase,
      },
    ],
    collapsible: false,
  },
  {
    name: 'Projects',
    icon: ClipboardList,
    items: [
      {
        name: 'Projects',
        href: '/projects',
        icon: ClipboardList,
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
        name: 'Competence Files',
        href: '/competence-files',
        icon: FileText,
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
    name: 'Clients',
    icon: Building2,
    items: [
      {
        name: 'Clients',
        href: '/clients',
        icon: Building2,
      },
      {
        name: 'Portal Manager',
        href: '/admin/portal-manager',
        icon: Share2,
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
    name: 'AI Tools',
    icon: Brain,
    items: [
      {
        name: 'AI Tools',
        href: '/ai-tools',
        icon: Brain,
      },
      {
        name: 'AI Co-pilot',
        href: '/ai-copilot',
        icon: Bot,
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

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  // Initialize with only collapsible sections collapsed by default
  const [collapsedSections, setCollapsedSections] = useState<string[]>(
    navigationSections.filter(section => section.collapsible).map(section => section.name)
  );

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
    <div className={cn(
      "flex flex-col bg-white border-r border-secondary-200 h-screen transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header with Toggle Button */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-secondary-200">
        {!collapsed && (
          <Link href="/" className="flex items-center group">
            <div className="relative w-8 h-8 mr-2 transition-transform group-hover:scale-105">
              <Image
                src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png"
                alt="Emineon ATS"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary-900 leading-tight">
                Emineon
              </span>
              <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                ATS
              </span>
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <Menu className="h-5 w-5 text-secondary-600" />
          ) : (
            <X className="h-5 w-5 text-secondary-600" />
          )}
        </button>
      </div>

      {/* Logo - Collapsed State */}
      {collapsed && (
        <div className="flex-shrink-0 flex items-center justify-center px-2 py-4">
          <Link href="/" className="group">
            <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
              <Image
                src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png"
                alt="Emineon ATS"
                width={32}
                height={32}
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png";
                }}
              />
            </div>
          </Link>
        </div>
      )}

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-2 pb-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigationSections.map((section) => {
          const sectionActive = isSectionActive(section);
          const isCollapsed = collapsedSections.includes(section.name);
          const showItems = !section.collapsible || !isCollapsed;
          const mainItem = section.items[0]; // First item is considered the main page
          const subItems = section.items.slice(1); // Rest are sub-items

          return (
            <div key={section.name} className="space-y-1">
              {/* Main Section Item */}
              {!collapsed ? (
                <div className="flex items-center">
                  <Link
                    href={mainItem.href}
                    className={cn(
                      'flex-1 group flex items-center rounded-lg transition-all duration-200 px-3 py-2',
                      isItemActive(mainItem.href)
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                    )}
                  >
                    <section.icon
                      className={cn(
                        'h-4 w-4 mr-3 transition-colors',
                        isItemActive(mainItem.href)
                          ? 'text-primary-700'
                          : 'text-secondary-500 group-hover:text-secondary-700'
                      )}
                    />
                    <span className="text-sm font-medium">{section.name}</span>
                    {isItemActive(mainItem.href) && (
                      <ChevronRight className="ml-auto h-3 w-3 text-primary-700" />
                    )}
                  </Link>
                  
                  {/* Expand/Collapse Button for sections with sub-items */}
                  {section.collapsible && subItems.length > 0 && (
                    <button
                      onClick={() => toggleSection(section.name)}
                      className="ml-1 p-1 rounded hover:bg-secondary-100 transition-colors"
                      title={isCollapsed ? `Expand ${section.name}` : `Collapse ${section.name}`}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3 text-secondary-500" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-secondary-500" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                // Collapsed sidebar - show only icon with expand functionality
                <button
                  onClick={() => {
                    if (onToggle) {
                      onToggle(); // Expand the sidebar first
                      // Navigate after a short delay to allow sidebar to expand
                      setTimeout(() => {
                        router.push(mainItem.href);
                      }, 150);
                    }
                  }}
                  className={cn(
                    'group flex items-center rounded-lg transition-all duration-200 px-3 py-3 justify-center w-full',
                    isItemActive(mainItem.href)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                  )}
                  title={`Expand ${section.name}`}
                >
                  <section.icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isItemActive(mainItem.href)
                        ? 'text-primary-700'
                        : 'text-secondary-500 group-hover:text-secondary-700'
                    )}
                  />
                </button>
              )}

              {/* Sub-items */}
              {!collapsed && showItems && subItems.length > 0 && (
                <div className="ml-6 space-y-1">
                  {subItems.map((item) => {
                    const isActive = isItemActive(item.href);
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'group flex items-center rounded-lg transition-all duration-200 px-3 py-2',
                          isActive
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-4 w-4 mr-3 transition-colors',
                            isActive
                              ? 'text-primary-700'
                              : 'text-secondary-500 group-hover:text-secondary-700'
                          )}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
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