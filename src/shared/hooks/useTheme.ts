import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const themeStorageKey = 'mounjaro-theme';

const themeColors: Record<Theme, string> = {
  light: '#F7F7F2',
  dark: '#0C1513',
};

const getInitialTheme = (): Theme => {
  const savedTheme = localStorage.getItem(themeStorageKey);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  return prefersDark ? 'dark' : 'light';
};

const updateThemeColorMeta = (theme: Theme) => {
  let metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }

  metaThemeColor.content = themeColors[theme];
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(themeStorageKey, theme);
    updateThemeColorMeta(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    toggleTheme,
  };
};
