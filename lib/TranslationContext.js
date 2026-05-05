/**
 * =============================================================================
 * GLOBAL TRANSLATION CONTEXT - Cross-Page Translation System
 * =============================================================================
 * 
 * This module provides a React context for managing translations
 * across the entire Tower platform, ensuring language changes
 * work globally on all pages.
 * 
 * Key Features:
 * - Global translation state management
 * - Cross-page language persistence
 * - Automatic text translation
 * - Fallback to English for missing translations
 * 
 * Architecture:
 * - React Context API for state management
 * - localStorage for persistence
 * - Translation key lookup system
 * - Component-level translation hooks
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-05
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import translations from './translations';

// Translation context type definition
const TranslationContext = createContext({
  currentLanguage: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languages: []
});

// Translation provider component
export function TranslationProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tower-language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Set language and persist to localStorage
  const setLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('tower-language', languageCode);
      console.log('Language changed globally to:', languageCode);
    }
  };

  // Translation function
  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  return (
    <TranslationContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      languages
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

// Hook for using translations
export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Export context for direct access
export { TranslationContext };
