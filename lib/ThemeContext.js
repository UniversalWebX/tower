/**
 * =============================================================================
 * GLOBAL THEME CONTEXT - Cross-Page Theme System
 * =============================================================================
 * 
 * This module provides a React context for managing themes
 * across the entire Tower platform, ensuring theme changes
 * work globally on all pages.
 * 
 * Key Features:
 * - Global theme state management
 * - Cross-page theme persistence
 * - Automatic theme application
 * - CSS variable management
 * - Theme change event handling
 * 
 * Architecture:
 * - React Context API for state management
 * - localStorage for persistence
 * - ThemeManager for CSS variable application
 * - Component-level theme hooks
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-05
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeManager } from './themes';

// Theme context type definition
const ThemeContext = createContext({
  currentTheme: 'dark',
  setTheme: () => {},
  themeManager: null,
  themes: [],
  applyTheme: () => {}
});

// Theme provider component
export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [themeManager, setThemeManager] = useState(null);

  // Available themes
  const themes = [
    { code: 'dark', name: 'Dark Mode', icon: '🌙', description: 'Classic dark theme with purple accents' },
    { code: 'light', name: 'Light Mode', icon: '☀️', description: 'Clean light theme with blue accents' },
    { code: 'ocean', name: 'Ocean', icon: '🌊', description: 'Deep blue aquatic theme' },
    { code: 'sunset', name: 'Sunset', icon: '🌅', description: 'Warm orange and pink theme' },
    { code: 'forest', name: 'Forest', icon: '🌲', description: 'Natural green theme' },
    { code: 'galaxy', name: 'Galaxy', icon: '🌌', description: 'Purple cosmic theme' },
    { code: 'monochrome', name: 'Monochrome', icon: '⚫', description: 'Classic black and white' },
    { code: 'auto', name: 'Auto', icon: '🌓', description: 'Follow system preference' }
  ];

  // Initialize theme manager and load saved theme
  useEffect(() => {
    const manager = new ThemeManager();
    setThemeManager(manager);

    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('tower-theme');
    if (savedTheme && manager.getTheme(savedTheme)) {
      setCurrentTheme(savedTheme);
      manager.applyTheme(savedTheme);
    } else {
      // Apply default theme
      manager.applyTheme('dark');
    }

    // Listen for system preference changes if auto theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (currentTheme === 'auto') {
        const prefersDark = mediaQuery.matches;
        manager.applyTheme(prefersDark ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Set theme and persist to localStorage
  const setTheme = (themeCode) => {
    if (themeManager && themeManager.getTheme(themeCode)) {
      setCurrentTheme(themeCode);
      localStorage.setItem('tower-theme', themeCode);
      applyTheme(themeCode);
      console.log('Theme changed globally to:', themeCode);
    }
  };

  // Apply theme function
  const applyTheme = (themeCode) => {
    if (themeManager) {
      const success = themeManager.applyTheme(themeCode);
      if (success) {
        console.log('Theme applied successfully:', themeCode);
      } else {
        console.error('Failed to apply theme:', themeCode);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      themeManager,
      themes,
      applyTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using themes
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Export context for direct access
export { ThemeContext };
