"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

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
  const { user, signInWithGoogle, signOut } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      name: 'Level Assessment',
      href: '/level-assessment',
      icon: '📊',
      description: 'Find your Korean level',
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
      name: 'Youtube Practice',
      href: '/drama-practice',
      icon: '🎬',
      description: 'Learn with K-contents',
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
              <div className="w-15 h-15 bg-gradient-primary rounded-xl flex items-center justify-center">
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
                    ? 'bg-primary text-var(--background) shadow-sm'
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

            {/* Right: User Profile & Auth */}
            <div className="flex items-center justify-end">
              {user ? (
                <div className="relative group">
                  <div className="flex items-center space-x-4 cursor-pointer py-2">
                    <div className="flex flex-col items-end">
                      <Link href="/profile" className="text-sm font-medium text-gray-900 hover:text-primary transition-colors">
                        {user.user_metadata.full_name || user.email}
                      </Link>
                      <Link href="/profile" className="text-xs text-gray-500 hover:text-gray-900">My Level</Link>
                    </div>
                    <Link href="/profile" className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden hover:opacity-90">
                      {user.user_metadata.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {(user.user_metadata.full_name || user.email || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-0 w-64 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-right group-hover:translate-y-0 translate-y-2">
                    <div className="px-4 py-3 border-b border-gray-100 mb-2 bg-gray-50/50">
                      <Link href="/profile" className="block text-sm font-medium text-gray-900 truncate hover:text-[var(--background)] transition-colors">
                        {user.user_metadata.full_name || 'User'}
                      </Link>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {user.email}
                      </p>
                    </div>

                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--background)] transition-colors">
                      <span className="text-lg w-6 text-center">👤</span> My Info
                    </Link>
                    <Link href="/my-videos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--background)] transition-colors">
                      <span className="text-lg w-6 text-center">📺</span> My Videos
                    </Link>
                    <Link href="/curriculum" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--background)] transition-colors">
                      <span className="text-lg w-6 text-center">🗺️</span> My Curriculum
                    </Link>
                    <Link href="/saved-items" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--background)] transition-colors">
                      <span className="text-lg w-6 text-center">🔖</span> My Saved Items
                    </Link>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                      <span className="text-lg w-6 text-center">🚪</span> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">K</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">K-Flow</h1>
                <p className="text-xs text-gray-500">Korean Learning</p>
              </div>
            </Link>

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

              {user ? (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
                  <div className="px-4 py-2 mb-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                      {user.user_metadata.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {(user.user_metadata.full_name || user.email || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.user_metadata.full_name || 'User'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">👤</span>
                    <span>My Info</span>
                  </Link>
                  <Link
                    href="/my-videos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">📺</span>
                    <span>My Videos</span>
                  </Link>
                  <Link
                    href="/curriculum"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">🗺️</span>
                    <span>My Curriculum</span>
                  </Link>
                  <Link
                    href="/saved-items"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">🔖</span>
                    <span>My Saved Items</span>
                  </Link>

                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}