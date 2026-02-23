// src/app/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import ModernNavigation from "./components/ModernNavigation";

export default function HomePage() {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);

  const features = [
    {
      id: 1,
      title: "Level Assessment",
      description: "Find your perfect starting point with TTMIK 1-10 level system",
      icon: "📊",
      href: "/level-assessment",
      color: "from-blue-500 to-indigo-600",
      stats: "10 Levels",
      isNew: true
    },
    {
      id: 2,
      title: "Personalized Curriculum",
      description: "Get a custom learning roadmap based on your goals and timeline",
      icon: "🗺️",
      href: "/curriculum",
      color: "from-purple-500 to-pink-600",
      stats: "Custom Plans",
      isNew: true
    },
    {
      id: 3,
      title: "Vocabulary Quiz",
      description: "Gamified learning with Hanja integration and SRS algorithm",
      icon: "🎮",
      href: "/vocabulary-quiz",
      color: "from-green-500 to-teal-600",
      stats: "4 Quiz Types",
      badge: "NEW"
    },
    {
      id: 4,
      title: "K-Drama Practice",
      description: "Learn with real K-drama clips and pronunciation analysis",
      icon: "🎬",
      href: "/drama-practice",
      color: "from-red-500 to-orange-600",
      stats: "Video Learning",
      badge: "HOT"
    },
    {
      id: 5,
      title: "Habit Formation",
      description: "Build sustainable habits using BJ Fogg behavior model",
      icon: "🎯",
      href: "/habits",
      color: "from-yellow-500 to-amber-600",
      stats: "B=M×A×P",
      isNew: true
    },
    {
      id: 6,
      title: "Achievements",
      description: "Track progress and unlock achievements with gamification",
      icon: "🏆",
      href: "/achievements",
      color: "from-indigo-500 to-purple-600",
      stats: "50+ Badges",
      isNew: true
    }
  ];

  const testimonials = [
    {
      name: "Sarah Kim",
      role: "Beginner Learner",
      content: "K-Flow made learning Korean so much fun! The K-drama practice is my favorite feature.",
      rating: 5,
      avatar: "👩‍🎓"
    },
    {
      name: "John Lee",
      role: "Intermediate Learner",
      content: "The personalized curriculum helped me reach TTMIK Level 5 in just 3 months!",
      rating: 5,
      avatar: "👨‍💼"
    },
    {
      name: "Emily Park",
      role: "Advanced Learner",
      content: "The habit formation system keeps me consistent. Best Korean learning app I've used!",
      rating: 5,
      avatar: "👩‍🔬"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ModernNavigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Now with AI-powered learning</span>
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Master Korean with
              <span className="block text-gradient">K-Flow</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-in">
              Learn Korean through K-dramas, gamified quizzes, and personalized curriculum. 
              Build sustainable habits and achieve fluency faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link
                href="/level-assessment"
                className="btn-primary text-lg px-8 py-4 shadow-xl"
              >
                Start Free Assessment
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive learning system combines proven methods with cutting-edge technology 
              to make your Korean learning journey effective and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative"
                onMouseEnter={() => setSelectedFeature(feature.id)}
                onMouseLeave={() => setSelectedFeature(null)}
              >
                <div className={`card-elevated p-8 h-full transition-all duration-300 ${
                  selectedFeature === feature.id ? 'transform scale-105' : ''
                }`}>
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                        {feature.icon}
                      </div>
                      <div className="flex items-center space-x-2">
                        {feature.badge && (
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            feature.badge === 'NEW' ? 'bg-green-500 text-white' :
                            feature.badge === 'HOT' ? 'bg-red-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {feature.badge}
                          </span>
                        )}
                        {feature.isNew && !feature.badge && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {feature.stats}
                      </span>
                      <div className="flex items-center text-primary group-hover:text-primary-dark transition-colors">
                        <span className="text-sm font-medium">Explore</span>
                        <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Join Thousands of Learners</h2>
            <p className="text-xl text-white/90">
              See why K-Flow is the fastest way to learn Korean
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/80">K-Drama Clips</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-white/80">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-white/80">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Learners Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                
                <p className="text-gray-700 italic">
                  {testimonial.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent to-accent-light text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Start Your Korean Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of learners who have transformed their Korean skills with K-Flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/level-assessment"
              className="btn-primary bg-white text-accent hover:bg-gray-100 text-lg px-8 py-4 shadow-xl"
            >
              Start Free Assessment
            </Link>
            <Link
              href="/vocabulary-quiz"
              className="btn-outline border-white text-white hover:bg-white hover:text-accent text-lg px-8 py-4"
            >
              Try Sample Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
