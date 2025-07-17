import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

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
        onClick={() => applyTheme('light')}
        className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
      >
        ☀️ Light Mode
      </button>
      <button
        onClick={() => applyTheme('dark')}
        className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
      >
        🌙 Dark Mode
      </button>
    </div>
  );
};

export default ThemeToggle;
