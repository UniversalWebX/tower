"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const steps = [
  {
    id: 'welcome',
    title: 'Welcome to Tower! 🚀',
    description: 'Let\'s get you set up with a quick tour of the platform.',
    icon: '👋'
  },
  {
    id: 'interests',
    title: 'Choose Your Interests',
    description: 'Select topics you\'re passionate about to personalize your feed.',
    icon: '🎯'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add a bio and profile picture to make your account stand out.',
    icon: '👤'
  },
  {
    id: 'explore',
    title: 'Explore Tower',
    description: 'Discover posts, connect with others, and start sharing your content.',
    icon: '🔍'
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [profile, setProfile] = useState({ bio: '', avatar: '' });
  const router = useRouter();

  const commonInterests = [
    'Technology', 'Art', 'Music', 'Gaming', 'Sports', 'Science',
    'Travel', 'Food', 'Fashion', 'Movies', 'Books', 'Fitness',
    'Photography', 'Writing', 'Coding', 'Design', 'Business'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to feed
      localStorage.setItem('onboarding-complete', 'true');
      router.push('/feed');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding-complete', 'true');
    localStorage.setItem('user-interests', JSON.stringify(interests));
    localStorage.setItem('user-profile', JSON.stringify(profile));
    router.push('/feed');
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding-complete', 'true');
    router.push('/feed');
  };

  useEffect(() => {
    // Check if user already completed onboarding
    if (localStorage.getItem('onboarding-complete') === 'true') {
      router.push('/feed');
    }
  }, [router]);

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'welcome':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">{step.icon}</div>
            <h1 className="text-3xl font-bold text-white mb-4">{step.title}</h1>
            <p className="text-lg text-zinc-300 mb-8 max-w-md mx-auto">{step.description}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Get Started
              </button>
              <button
                onClick={skipOnboarding}
                className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        );

      case 'interests':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-2xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-6">{step.title}</h2>
            <p className="text-zinc-300 text-center mb-8">{step.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`p-3 rounded-lg border transition-all ${
                    interests.includes(interest)
                      ? 'bg-violet-600 border-violet-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-violet-500 hover:text-violet-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={interests.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                Continue ({interests.length} selected)
              </button>
            </div>
          </motion.div>
        );

      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-lg mx-auto"
          >
            <h2 className="text-2xl font-bold text-white text-center mb-6">{step.title}</h2>
            <p className="text-zinc-300 text-center mb-8">{step.description}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Profile Picture URL</label>
                <input
                  type="url"
                  value={profile.avatar}
                  onChange={(e) => setProfile(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={completeOnboarding}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Complete Setup
              </button>
            </div>
          </motion.div>
        );

      case 'explore':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">{step.icon}</div>
            <h1 className="text-3xl font-bold text-white mb-4">{step.title}</h1>
            <p className="text-lg text-zinc-300 mb-8">{step.description}</p>
            <div className="space-y-4 max-w-md mx-auto">
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-white mb-2">🎯 Ready to Explore?</h3>
                <p className="text-zinc-300 mb-4">Your personalized feed is waiting! Posts will be ranked based on your interests and preferences.</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-white mb-2">📝 Create Your First Rack</h3>
                <p className="text-zinc-300 mb-4">Share your thoughts, media, and connect with the community.</p>
              </div>
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h3 className="font-semibold text-white mb-2">👥 Connect with Others</h3>
                <p className="text-zinc-300 mb-4">Find users with similar interests and start conversations.</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handlePrevious}
                className="px-6 py-3 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={completeOnboarding}
                className="px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Go to Feed
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index <= currentStep
                    ? 'bg-violet-500 w-8'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-zinc-400 text-sm">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Current Step */}
        <div className="min-h-[400px] flex items-center justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
