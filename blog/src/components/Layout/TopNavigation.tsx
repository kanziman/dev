"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';

export const TopNavigation = () => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains('dark');
      setTheme(isDarkNow ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="sticky top-0 z-[100] h-16 border-b border-line-normal-normal flex items-center bg-background-normal-alternative">
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <div className="font-bold text-label-strong tracking-tight">
          <span className="text-title3">Zettlink</span>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outlined" 
            color="assistive" 
            size="small" 
            iconOnly
            onClick={() => window.dispatchEvent(new CustomEvent('open-search-modal'))}
          >
            <Icon name="search" size={16} />
          </Button>
          {mounted && (
            <Button 
              variant="outlined" 
              color="assistive" 
              size="small" 
              onClick={toggleTheme}
              leadingContent={<Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-primary-normal text-white flex items-center justify-center font-semibold text-label2">
            A
          </div>
        </div>
      </div>
    </header>
  );
};

