
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

export const BottomNavigation: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const { pathname } = location;

  // Navigation items with their respective paths, labels, and icons
  const navItems: NavigationItem[] = [
    {
      path: '/home',
      label: t('navigation.home'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12h6v10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['Resident', 'GovernmentOfficial', 'Administrator']
    },
    {
      path: '/map',
      label: t('navigation.map'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="10" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['Resident', 'GovernmentOfficial', 'Administrator']
    },
    {
      path: '/reports',
      label: t('navigation.reports'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['Resident', 'GovernmentOfficial', 'Administrator']
    },
    {
      path: '/profile',
      label: t('navigation.profile'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      roles: ['Resident', 'GovernmentOfficial', 'Administrator']
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background border-t border-border">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center py-2 px-4 text-xs',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'mb-1',
                isActive && 'text-primary'
              )}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
