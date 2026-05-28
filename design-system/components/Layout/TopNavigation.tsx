"use client";

import React, { useEffect, useState } from 'react';
import { Icon } from '../Icon/Icon';
import { Button } from '../Button/Button';
import { useTheme } from 'next-themes';

export const TopNavigation = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-sticky h-16 border-b border-line-normal-normal flex items-center bg-background-normal-alternative">
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <div className="font-bold text-label-strong tracking-tight">
          <span className="text-title3">Zettlink</span>
        </div>
        <div className="flex items-center gap-4">
          {mounted && (
            <Button 
              variant="outlined" 
              color="assistive" 
              size="small" 
              onClick={toggleTheme}
              leadingContent={<Icon name={resolvedTheme === 'dark' ? 'sun' : 'moon'} size={16} />}
            >
              {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
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
