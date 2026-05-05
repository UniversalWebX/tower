/**
 * =============================================================================
 * TOWER THEME SYSTEM - Enhanced Visual Customization
 * =============================================================================
 * 
 * This module provides a comprehensive theme system for the Tower social platform
 * with multiple predefined themes, custom color schemes, and dynamic styling.
 * 
 * Key Features:
 * - Multiple predefined themes (Dark, Light, Ocean, Sunset, Forest, etc.)
 * - Custom color palette definitions
 * - Dynamic CSS variable generation
 * - Theme persistence and loading
 * - Accessibility-focused color contrast
 * - Smooth theme transitions
 * 
 * Architecture:
 * - Theme definitions with semantic color names
 * - CSS variable mapping for dynamic styling
 * - Theme validation and fallback handling
 * - User preference integration
 * 
 * @author Tower Development Team
 * @version 2.0.0
 * @since 2026-05-04
 */

/**
 * =============================================================================
 * THEME DEFINITIONS - Complete Visual Style Presets
 * =============================================================================
 * 
 * Each theme includes comprehensive color definitions for all UI elements
 * with semantic naming and accessibility considerations.
 */
const themes = {
  // Dark Theme - Default dark mode with purple accents
  dark: {
    name: 'Dark',
    displayName: 'Dark Mode',
    colors: {
      // Primary colors
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      primaryLight: '#a78bfa',
      primaryDark: '#6d28d9',
      
      // Background colors
      background: '#0f0f23',
      backgroundSecondary: '#1a1a2e',
      backgroundTertiary: '#16213e',
      backgroundCard: '#1e1e3f',
      
      // Surface colors
      surface: '#2a2a4e',
      surfaceHover: '#3a3a5e',
      surfaceBorder: '#4a4a6e',
      
      // Text colors
      textPrimary: '#ffffff',
      textSecondary: '#b8b8d1',
      textTertiary: '#8888aa',
      textMuted: '#666688',
      
      // Accent colors
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentLight: '#67e8f9',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#8b5cf6',
      buttonPrimaryHover: '#7c3aed',
      buttonSecondary: '#4a4a6e',
      buttonSecondaryHover: '#5a5a7e',
      
      // Navigation
      navBackground: '#1a1a2e',
      navBorder: '#4a4a6e',
      navText: '#ffffff',
      navTextHover: '#a78bfa',
      
      // Form elements
      inputBackground: '#2a2a4e',
      inputBorder: '#4a4a6e',
      inputFocus: '#8b5cf6',
      inputText: '#ffffff',
      
      // Chat and messaging
      chatBackground: '#1e1e3f',
      chatBubble: '#2a2a4e',
      chatBubbleOwn: '#8b5cf6',
      chatText: '#ffffff',
      chatTimestamp: '#8888aa'
    }
  },
  
  // Light Theme - Clean light mode with blue accents
  light: {
    name: 'light',
    displayName: 'Light Mode',
    colors: {
      // Primary colors
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#60a5fa',
      primaryDark: '#1d4ed8',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      backgroundCard: '#ffffff',
      
      // Surface colors
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      surfaceBorder: '#e2e8f0',
      
      // Text colors
      textPrimary: '#1e293b',
      textSecondary: '#475569',
      textTertiary: '#64748b',
      textMuted: '#94a3b8',
      
      // Accent colors
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentLight: '#67e8f9',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#3b82f6',
      buttonPrimaryHover: '#2563eb',
      buttonSecondary: '#f1f5f9',
      buttonSecondaryHover: '#e2e8f0',
      
      // Navigation
      navBackground: '#ffffff',
      navBorder: '#e2e8f0',
      navText: '#1e293b',
      navTextHover: '#3b82f6',
      
      // Form elements
      inputBackground: '#ffffff',
      inputBorder: '#e2e8f0',
      inputFocus: '#3b82f6',
      inputText: '#1e293b',
      
      // Chat and messaging
      chatBackground: '#f8fafc',
      chatBubble: '#f1f5f9',
      chatBubbleOwn: '#3b82f6',
      chatText: '#1e293b',
      chatTimestamp: '#64748b'
    }
  },
  
  // Ocean Theme - Deep blue aquatic theme
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    colors: {
      // Primary colors
      primary: '#0891b2',
      primaryHover: '#0e7490',
      primaryLight: '#06b6d4',
      primaryDark: '#164e63',
      
      // Background colors
      background: '#083344',
      backgroundSecondary: '#0c4a6e',
      backgroundTertiary: '#075985',
      backgroundCard: '#0e7490',
      
      // Surface colors
      surface: '#155e75',
      surfaceHover: '#164e63',
      surfaceBorder: '#0e7490',
      
      // Text colors
      textPrimary: '#f0fdfa',
      textSecondary: '#ccfbf1',
      textTertiary: '#99f6e4',
      textMuted: '#5eead4',
      
      // Accent colors
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentLight: '#67e8f9',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#0891b2',
      buttonPrimaryHover: '#0e7490',
      buttonSecondary: '#164e63',
      buttonSecondaryHover: '#155e75',
      
      // Navigation
      navBackground: '#0c4a6e',
      navBorder: '#164e63',
      navText: '#f0fdfa',
      navTextHover: '#67e8f9',
      
      // Form elements
      inputBackground: '#155e75',
      inputBorder: '#164e63',
      inputFocus: '#0891b2',
      inputText: '#f0fdfa',
      
      // Chat and messaging
      chatBackground: '#0e7490',
      chatBubble: '#155e75',
      chatBubbleOwn: '#0891b2',
      chatText: '#f0fdfa',
      chatTimestamp: '#99f6e4'
    }
  },
  
  // Sunset Theme - Warm orange and pink theme
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    colors: {
      // Primary colors
      primary: '#f97316',
      primaryHover: '#ea580c',
      primaryLight: '#fb923c',
      primaryDark: '#c2410c',
      
      // Background colors
      background: '#431407',
      backgroundSecondary: '#7c2d12',
      backgroundTertiary: '#9a3412',
      backgroundCard: '#c2410c',
      
      // Surface colors
      surface: '#9a3412',
      surfaceHover: '#ea580c',
      surfaceBorder: '#dc2626',
      
      // Text colors
      textPrimary: '#fff7ed',
      textSecondary: '#fed7aa',
      textTertiary: '#fdba74',
      textMuted: '#fb923c',
      
      // Accent colors
      accent: '#ec4899',
      accentHover: '#db2777',
      accentLight: '#f9a8d4',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#f97316',
      buttonPrimaryHover: '#ea580c',
      buttonSecondary: '#9a3412',
      buttonSecondaryHover: '#c2410c',
      
      // Navigation
      navBackground: '#7c2d12',
      navBorder: '#c2410c',
      navText: '#fff7ed',
      navTextHover: '#fed7aa',
      
      // Form elements
      inputBackground: '#9a3412',
      inputBorder: '#c2410c',
      inputFocus: '#f97316',
      inputText: '#fff7ed',
      
      // Chat and messaging
      chatBackground: '#c2410c',
      chatBubble: '#9a3412',
      chatBubbleOwn: '#f97316',
      chatText: '#fff7ed',
      chatTimestamp: '#fdba74'
    }
  },
  
  // Forest Theme - Natural green theme
  forest: {
    name: 'forest',
    displayName: 'Forest',
    colors: {
      // Primary colors
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryLight: '#22c55e',
      primaryDark: '#14532d',
      
      // Background colors
      background: '#052e16',
      backgroundSecondary: '#14532d',
      backgroundTertiary: '#166534',
      backgroundCard: '#15803d',
      
      // Surface colors
      surface: '#166534',
      surfaceHover: '#15803d',
      surfaceBorder: '#16a34a',
      
      // Text colors
      textPrimary: '#f0fdf4',
      textSecondary: '#dcfce7',
      textTertiary: '#bbf7d0',
      textMuted: '#86efac',
      
      // Accent colors
      accent: '#84cc16',
      accentHover: '#65a30d',
      accentLight: '#bef264',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#16a34a',
      buttonPrimaryHover: '#15803d',
      buttonSecondary: '#166534',
      buttonSecondaryHover: '#14532d',
      
      // Navigation
      navBackground: '#14532d',
      navBorder: '#16a34a',
      navText: '#f0fdf4',
      navTextHover: '#dcfce7',
      
      // Form elements
      inputBackground: '#166534',
      inputBorder: '#16a34a',
      inputFocus: '#16a34a',
      inputText: '#f0fdf4',
      
      // Chat and messaging
      chatBackground: '#15803d',
      chatBubble: '#166534',
      chatBubbleOwn: '#16a34a',
      chatText: '#f0fdf4',
      chatTimestamp: '#bbf7d0'
    }
  },
  
  // Galaxy Theme - Purple and cosmic theme
  galaxy: {
    name: 'galaxy',
    displayName: 'Galaxy',
    colors: {
      // Primary colors
      primary: '#a855f7',
      primaryHover: '#9333ea',
      primaryLight: '#c084fc',
      primaryDark: '#7c3aed',
      
      // Background colors
      background: '#1e1b4b',
      backgroundSecondary: '#312e81',
      backgroundTertiary: '#4c1d95',
      backgroundCard: '#5b21b6',
      
      // Surface colors
      surface: '#4c1d95',
      surfaceHover: '#5b21b6',
      surfaceBorder: '#6d28d9',
      
      // Text colors
      textPrimary: '#faf5ff',
      textSecondary: '#f3e8ff',
      textTertiary: '#e9d5ff',
      textMuted: '#d8b4fe',
      
      // Accent colors
      accent: '#ec4899',
      accentHover: '#db2777',
      accentLight: '#f9a8d4',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#a855f7',
      buttonPrimaryHover: '#9333ea',
      buttonSecondary: '#4c1d95',
      buttonSecondaryHover: '#5b21b6',
      
      // Navigation
      navBackground: '#312e81',
      navBorder: '#6d28d9',
      navText: '#faf5ff',
      navTextHover: '#f3e8ff',
      
      // Form elements
      inputBackground: '#4c1d95',
      inputBorder: '#6d28d9',
      inputFocus: '#a855f7',
      inputText: '#faf5ff',
      
      // Chat and messaging
      chatBackground: '#5b21b6',
      chatBubble: '#4c1d95',
      chatBubbleOwn: '#a855f7',
      chatText: '#faf5ff',
      chatTimestamp: '#e9d5ff'
    }
  },
  
  // Monochrome Theme - Classic black and white
  monochrome: {
    name: 'monochrome',
    displayName: 'Monochrome',
    colors: {
      // Primary colors
      primary: '#000000',
      primaryHover: '#333333',
      primaryLight: '#666666',
      primaryDark: '#000000',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8f8f8',
      backgroundTertiary: '#e8e8e8',
      backgroundCard: '#ffffff',
      
      // Surface colors
      surface: '#f8f8f8',
      surfaceHover: '#e8e8e8',
      surfaceBorder: '#d8d8d8',
      
      // Text colors
      textPrimary: '#000000',
      textSecondary: '#333333',
      textTertiary: '#666666',
      textMuted: '#999999',
      
      // Accent colors
      accent: '#555555',
      accentHover: '#333333',
      accentLight: '#888888',
      
      // Status colors
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      
      // Interactive elements
      buttonPrimary: '#000000',
      buttonPrimaryHover: '#333333',
      buttonSecondary: '#e8e8e8',
      buttonSecondaryHover: '#d8d8d8',
      
      // Navigation
      navBackground: '#ffffff',
      navBorder: '#d8d8d8',
      navText: '#000000',
      navTextHover: '#666666',
      
      // Form elements
      inputBackground: '#ffffff',
      inputBorder: '#d8d8d8',
      inputFocus: '#000000',
      inputText: '#000000',
      
      // Chat and messaging
      chatBackground: '#f8f8f8',
      chatBubble: '#e8e8e8',
      chatBubbleOwn: '#000000',
      chatText: '#000000',
      chatTimestamp: '#666666'
    }
  }
};

/**
 * =============================================================================
 * THEME MANAGER CLASS - Dynamic Theme Application
 * =============================================================================
 * 
 * Handles theme switching, CSS variable generation, and persistence.
 */
class ThemeManager {
  
  /**
   * Initialize theme manager
   * 
   * @constructor
   * Sets up theme system and applies default theme
   */
  constructor() {
    this.currentTheme = 'dark';
    this.themes = themes;
  }
  
  /**
   * Get all available themes
   * 
   * @returns {Array} Array of theme objects with name and displayName
   */
  getAvailableThemes() {
    return Object.keys(this.themes).map(key => ({
      name: key,
      displayName: this.themes[key].displayName
    }));
  }
  
  /**
   * Get theme by name
   * 
   * @param {string} themeName - Theme identifier
   * @returns {Object|null} Theme object or null if not found
   */
  getTheme(themeName) {
    return this.themes[themeName] || null;
  }
  
  /**
   * Apply theme to the application
   * 
   * @param {string} themeName - Theme identifier
   * @returns {boolean} Success status
   * 
   * Features:
   * - CSS variable generation
   * - DOM element styling
   * - Theme validation
   * - Fallback handling
   */
  applyTheme(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) {
      console.warn(`Theme "${themeName}" not found, falling back to default`);
      return this.applyTheme('dark');
    }
    
    // Apply CSS variables to root element
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
    
    // Set data-theme attribute for CSS targeting
    root.setAttribute('data-theme', themeName);
    
    // Apply theme class for legacy support
    root.className = themeName === 'light' ? 'light' : 'dark';
    
    // Update current theme
    this.currentTheme = themeName;
    
    console.log('Theme applied:', themeName, 'with colors:', theme.colors);
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: themeName, themeData: theme }
    }));
    
    return true;
  }
  
  /**
   * Get current theme
   * 
   * @returns {string} Current theme name
   */
  getCurrentTheme() {
    return this.currentTheme;
  }
  
  /**
   * Generate CSS for theme variables
   * 
   * @param {string} themeName - Theme identifier
   * @returns {string} CSS string with variables
   */
  generateThemeCSS(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) return '';
    
    let css = `:root[data-theme="${themeName}"] {\n`;
    Object.entries(theme.colors).forEach(([key, value]) => {
      css += `  --theme-${key}: ${value};\n`;
    });
    css += '}\n';
    
    return css;
  }
  
  /**
   * Generate CSS for all themes
   * 
   * @returns {string} Complete CSS string for all themes
   */
  generateAllThemesCSS() {
    let css = '';
    Object.keys(this.themes).forEach(themeName => {
      css += this.generateThemeCSS(themeName);
    });
    return css;
  }
  
  /**
   * Validate theme colors for accessibility
   * 
   * @param {string} themeName - Theme identifier
   * @returns {Object} Accessibility report
   */
  validateThemeAccessibility(themeName) {
    const theme = this.getTheme(themeName);
    if (!theme) return { valid: false, errors: ['Theme not found'] };
    
    const errors = [];
    const warnings = [];
    
    // Check contrast ratios for text
    const contrastChecks = [
      { name: 'Primary Text', foreground: theme.colors.textPrimary, background: theme.colors.background },
      { name: 'Secondary Text', foreground: theme.colors.textSecondary, background: theme.colors.background },
      { name: 'Button Text', foreground: theme.colors.textPrimary, background: theme.colors.buttonPrimary }
    ];
    
    contrastChecks.forEach(check => {
      const ratio = this.calculateContrastRatio(check.foreground, check.background);
      if (ratio < 4.5) {
        errors.push(`${check.name} contrast ratio too low: ${ratio.toFixed(2)}`);
      } else if (ratio < 7) {
        warnings.push(`${check.name} contrast ratio could be improved: ${ratio.toFixed(2)}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      theme: themeName
    };
  }
  
  /**
   * Calculate contrast ratio between two colors
   * 
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio
   */
  calculateContrastRatio(color1, color2) {
    const luminance1 = this.calculateLuminance(color1);
    const luminance2 = this.calculateLuminance(color2);
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  /**
   * Calculate relative luminance of a color
   * 
   * @param {string} color - Color in hex format
   * @returns {number} Relative luminance
   */
  calculateLuminance(color) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;
    
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  /**
   * Convert hex color to RGB
   * 
   * @param {string} hex - Hex color string
   * @returns {Object|null} RGB object or null
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

/**
 * =============================================================================
 * MODULE EXPORT - Theme System
 * =============================================================================
 * 
 * Exports theme definitions and theme manager for use throughout the application.
 * 
 * Usage:
 * ```javascript
 * const { themes, ThemeManager } = require('./themes');
 * const themeManager = new ThemeManager();
 * themeManager.applyTheme('ocean');
 * ```
 */
module.exports = {
  themes,
  ThemeManager
};
