import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const getPreferredTheme = () => {
    if (localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  const [theme, setTheme] = useState(getPreferredTheme());

  const applyTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);
    document.documentElement.setAttribute('data-theme', selectedTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <span className="font-medium">Select Theme:</span>
      <button
        aria-pressed={theme === 'light'}
        onClick={() => applyTheme('light')}
        className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
      >
        ☀️ Light Mode
      </button>
      <button
        aria-pressed={theme === 'dark'}
        onClick={() => applyTheme('dark')}
        className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
      >
        🌙 Dark Mode
      </button>
    </div>
  );
};

export default ThemeToggle;
