"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  description: string;
  badge?: string;
  isNew?: boolean;
}

export default function ModernNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Level Assessment',
      href: '/level-assessment',
      icon: '📊',
      description: 'Find your Korean level',
      isNew: true
    },
    {
      name: 'My Curriculum',
      href: '/curriculum',
      icon: '🗺️',
      description: 'Personalized learning roadmap',
      isNew: true
    },
    {
      name: 'Vocabulary Quiz',
      href: '/vocabulary-quiz',
      icon: '🎮',
      description: 'Gamified word learning',
      badge: 'NEW',
      isNew: true
    },
    {
      name: 'SRS Study',
      href: '/srs-study',
      icon: '🧠',
      description: 'Spaced repetition practice',
      isNew: true
    },
    {
      name: 'Drama Practice',
      href: '/drama-practice',
      icon: '🎬',
      description: 'Learn with K-dramas',
      badge: 'HOT',
      isNew: true
    },
    {
      name: 'Habits',
      href: '/habits',
      icon: '🎯',
      description: 'Build learning habits',
      isNew: true
    },
    {
      name: 'Achievements',
      href: '/achievements',
      icon: '🏆',
      description: 'Track your progress',
      isNew: true
    }
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="mx-auto px-6">
          <div className="grid grid-cols-3 items-center h-20">
            {/* Left: Logo */}
            <div className="flex items-center justify-start space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Link href="/" className="text-white text-xl font-bold">K</Link>
              </div>
              <div>
                <Link href="/" className="text-xl font-bold text-gray-900">K-Flow</Link>
              </div>
            </div>

            {/* Center: Navigation Items */}
            <div className="flex items-center justify-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`absolute -top-1 -right-1 px-2 py-0.5 text-xs rounded-full ${item.badge === 'NEW'
                          ? 'bg-green-500 text-white'
                          : item.badge === 'HOT'
                            ? 'bg-red-500 text-white'
                            : 'bg-blue-500 text-white'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button className="px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95">
                Join Now
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">K-Flow</h1>
                <p className="text-xs text-gray-500">Korean Learning</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-6 h-0.5 bg-gray-600 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${item.badge === 'NEW' ? 'bg-green-500 text-white' :
                          item.badge === 'HOT' ? 'bg-red-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.isNew && !item.badge && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}