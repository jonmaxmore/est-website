'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';

type Lang = 'th' | 'en';

interface LangContextType {
  lang: Lang;
  toggle: () => void;
  t: (th: string, en: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: 'th',
  toggle: () => {},
  t: (th) => th,
});

// Simple external store for language preference
let currentLang: Lang = 'th';
const listeners = new Set<() => void>();

function getLang(): Lang {
  return currentLang;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setLang(lang: Lang) {
  currentLang = lang;
  if (typeof window !== 'undefined') {
    localStorage.setItem('est-lang', lang);
  }
  listeners.forEach(l => l());
}

// Initialize from localStorage (runs once on module load)
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('est-lang');
  if (saved === 'en' || saved === 'th') currentLang = saved;
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getLang, () => 'th' as Lang);

  const toggle = useCallback(() => {
    setLang(lang === 'th' ? 'en' : 'th');
  }, [lang]);

  const t = useCallback((th: string, en: string) => lang === 'th' ? th : en, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
