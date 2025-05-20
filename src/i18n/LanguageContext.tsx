
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import idTranslations from './locales/id.json';
import suTranslations from './locales/su.json';
import enTranslations from './locales/en.json';

// Define supported languages
export type Language = 'id' | 'su' | 'en';
export type TranslationKey = string;

interface TranslationMap {
  [key: string]: any;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  availableLanguages: { [key in Language]: string };
}

const translations: Record<Language, TranslationMap> = {
  id: idTranslations,
  su: suTranslations,
  en: enTranslations
};

export const availableLanguages: { [key in Language]: string } = {
  id: 'Bahasa Indonesia',
  su: 'Basa Sunda',
  en: 'English'
};

const DEFAULT_LANGUAGE: Language = 'en';

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize with saved language or default
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('mekarmap-language') as Language;
    return savedLanguage || DEFAULT_LANGUAGE;
  });

  // Update language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('mekarmap-language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Function to set language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    // Split the key by dots to access nested properties
    const keys = key.split('.');
    let value = translations[language];
    
    // Navigate through the nested keys
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} in language ${language}`);
        return key; // Return the key itself as fallback
      }
    }

    // If the value is not a string, return the key
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }

    // Replace parameters in the string if provided
    if (params) {
      return Object.entries(params).reduce((str: string, [paramKey, paramValue]) => {
        const searchStr = `{{${paramKey}}}`;
        return str.replace(new RegExp(searchStr, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
