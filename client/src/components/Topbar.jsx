import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Compute page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/contacts':
        return 'Contacts';
      case '/deals':
        return 'Deals Pipeline';
      case '/activities':
        return 'Activity Log';
      default:
        return 'YOURCRM';
    }
  };

  return (
    <header className="h-[60px] bg-surface border-b border-borderTheme flex items-center justify-between px-6 fixed right-0 top-0 left-[240px] z-10">
      {/* Page Title */}
      <h1 className="text-lg font-semibold tracking-tight text-primary">
        {getPageTitle()}
      </h1>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-secondary hover:text-primary transition-all duration-150"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            {isDark ? (
              <Sun size={18} className="transition-all duration-150 transform scale-100 rotate-0 opacity-100" />
            ) : (
              <Moon size={18} className="transition-all duration-150 transform scale-100 rotate-0 opacity-100" />
            )}
          </div>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-4 bg-borderTheme"></div>

        {/* User profile identifier */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent text-accentFg font-bold text-xs flex items-center justify-center uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="text-[13px] font-medium text-secondary hidden sm:inline-block">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
