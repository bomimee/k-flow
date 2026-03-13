"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, UserProfile } from '../services/users';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id).then(setProfile);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Please sign in to view your profile</h2>
          <p className="text-gray-500 mb-6">You need an account to track your progress and saved items.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-xl shadow-md hover:bg-blue-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const userLevel = profile?.ttmik_level || user.user_metadata?.level || 1;
  const xp = profile?.experience || 0;
  const levelTitle = userLevel <= 3 ? 'Beginner' : userLevel <= 6 ? 'Intermediate' : 'Advanced';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">
                {user.user_metadata?.full_name || 'Korean Learner'}
              </h1>
              <p className="text-gray-500 mt-1">{user.email}</p>
              
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <div className="bg-[var(--lemon)] text-black px-4 py-1.5 rounded-full font-bold shadow-sm inline-flex items-center gap-2">
                  <span>🏆</span> Level {userLevel}
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-full font-medium transition-colors text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/curriculum" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-8xl">🗺️</span>
            </div>
            <div className="relative z-10">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Curriculum</h3>
              <p className="text-gray-500 text-sm">View your personalized learning roadmap and track your progress.</p>
            </div>
          </Link>
          
          <Link href="/saved-items" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-8xl">🔖</span>
            </div>
            <div className="relative z-10">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">🔖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Saved Items</h3>
              <p className="text-gray-500 text-sm">Review your saved expressions, vocabulary, and grammar points.</p>
            </div>
          </Link>
        </div>

        {/* User Info Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>👤</span> Account Information
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 pb-4">
              <div className="text-sm font-medium text-gray-500">Full Name</div>
              <div className="sm:col-span-2 text-gray-900 font-medium">{user.user_metadata?.full_name || 'Not provided'}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 pb-4">
              <div className="text-sm font-medium text-gray-500">Email Address</div>
              <div className="sm:col-span-2 text-gray-900 font-medium">{user.email}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 pb-4">
              <div className="text-sm font-medium text-gray-500">Current Level</div>
              <div className="sm:col-span-2 text-gray-900 font-medium">Level {userLevel} <span className="text-gray-400 text-sm ml-2">({levelTitle})</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-50 pb-4">
              <div className="text-sm font-medium text-gray-500">Experience</div>
              <div className="sm:col-span-2 text-gray-900 font-medium">{xp} XP</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-sm font-medium text-gray-500">Account status</div>
              <div className="sm:col-span-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
