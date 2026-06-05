import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const themeStorageKey = 'mounjaro-theme';

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem(themeStorageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  return prefersDark ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    toggleTheme,
  };
};