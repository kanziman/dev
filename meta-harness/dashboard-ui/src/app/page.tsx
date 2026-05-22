"use client";

import React, { useState } from 'react';
import { Card } from '@/components/Card/Card';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Icon } from '@/components/Icon/Icon';

type CardData = {
  id: string;
  type: 'youtube' | 'github';
  title: string;
  summary: string;
  tags: string[];
  status: 'done' | 'error' | 'processing';
  published: boolean;
  date: string;
};

const MOCK_DATA: CardData[] = [
  {
    id: '1',
    type: 'youtube',
    title: 'How to build an AI agent with Claude 3.5 Sonnet',
    summary: 'A comprehensive guide on utilizing Claude 3.5 Sonnet to build autonomous AI agents. Covers structured outputs, tool use, and memory management for long-running processes.',
    tags: ['AI', 'Claude', 'Agent'],
    status: 'done',
    published: true,
    date: '2026-05-14',
  },
  {
    id: '2',
    type: 'github',
    title: 'vercel/next.js',
    summary: 'The React Framework. This repository contains the source code for Next.js, a powerful framework for building production-ready React applications with SSR, SSG, and ISR support.',
    tags: ['React', 'Next.js', 'Framework'],
    status: 'done',
    published: false,
    date: '2026-05-15',
  },
  {
    id: '3',
    type: 'youtube',
    title: 'Understanding React Server Components in 10 Minutes',
    summary: 'RSC explained simply. Why they matter, how they work under the hood, and how to incrementally adopt them in your existing codebase.',
    tags: ['React', 'RSC', 'Web'],
    status: 'processing',
    published: false,
    date: '2026-05-15',
  }
];

export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  const filteredData = MOCK_DATA.filter((card) => {
    if (filter === 'published') return card.published;
    if (filter === 'unpublished') return !card.published;
    return true;
  });

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-display2">Knowledge Vault</h1>
          <p className="text-body1 text-label-alternative">
            Captured contents automatically summarized and tagged.
          </p>
        </div>
        
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <div className="flex items-center bg-background-elevated-normal border border-line-normal-normal rounded-lg px-4 h-10 w-full max-w-[400px] shadow-normal-xsmall transition-all focus-within:border-primary-normal focus-within:shadow-[0_0_0_2px_rgba(0,102,255,0.2)]">
            <Icon name="search" size={20} className="text-label-assistive mr-2" />
            <input type="text" placeholder="Search cards..." className="border-none bg-transparent outline-none w-full text-label-normal font-sans text-body2 placeholder:text-label-disable" />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'solid' : 'outlined'} 
              color={filter === 'all' ? 'primary' : 'assistive'} 
              onClick={() => setFilter('all')}
              size="small"
            >
              All
            </Button>
            <Button 
              variant={filter === 'published' ? 'solid' : 'outlined'} 
              color={filter === 'published' ? 'primary' : 'assistive'} 
              onClick={() => setFilter('published')}
              size="small"
            >
              Published
            </Button>
            <Button 
              variant={filter === 'unpublished' ? 'solid' : 'outlined'} 
              color={filter === 'unpublished' ? 'primary' : 'assistive'} 
              onClick={() => setFilter('unpublished')}
              size="small"
            >
              Unpublished
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
        {filteredData.map((card) => (
          <Card key={card.id} hoverable onClick={() => setSelectedCard(card)} className="flex flex-col h-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-label-strong">
                <Icon name={card.type} size={20} />
                <span className="text-label1">{card.type === 'youtube' ? 'YouTube' : 'GitHub'}</span>
              </div>
              {card.published && <Badge variant="subtle" color="positive" size="small">Published</Badge>}
            </div>
            
            <h3 className="text-title3 my-3 line-clamp-2">
              {card.title}
            </h3>
            
            <p className="text-body2 text-label-neutral line-clamp-3 mb-4">
              {card.summary}
            </p>
            
            <div className="mt-auto flex justify-between items-center pt-4">
              <div className="flex gap-1 flex-wrap">
                {card.tags.map(tag => (
                  <Badge key={tag} variant="subtle" color="neutral" size="small">#{tag}</Badge>
                ))}
              </div>
              <span className="text-caption1 text-label-assistive">{card.date}</span>
            </div>
          </Card>
        ))}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 bg-material-dimmer z-[1300] flex items-center justify-center p-6 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedCard(null)}>
          <div className="w-full max-w-[800px] max-h-[90vh] bg-background-elevated-normal rounded-[20px] flex flex-col shadow-normal-xlarge overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-line-normal-normal flex justify-between items-center">
              <div className="flex items-center gap-2 text-label-strong">
                <Icon name={selectedCard.type} size={24} />
                <span className="text-title3">{selectedCard.type === 'youtube' ? 'YouTube Video' : 'GitHub Repository'}</span>
              </div>
              <Button variant="outlined" color="assistive" iconOnly size="small" onClick={() => setSelectedCard(null)}>
                <Icon name="close" size={20} />
              </Button>
            </div>
            
            <div className="py-8 px-6 overflow-y-auto flex-1">
              <h2 className="text-display3 mb-4">{selectedCard.title}</h2>
              
              <div className="flex items-center gap-4 mb-8">
                <Badge variant={selectedCard.published ? "solid" : "subtle"} color={selectedCard.published ? "positive" : "neutral"}>
                  {selectedCard.published ? "Published to Astro" : "Not Published"}
                </Badge>
                <div className="flex gap-1 flex-wrap">
                  {selectedCard.tags.map(tag => (
                    <Badge key={tag} variant="subtle" color="primary" size="small">#{tag}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-fill-normal p-6 rounded-xl border border-line-normal-normal">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="file-text" size={20} className="text-primary-normal" />
                  <h4 className="text-heading1 text-label-strong">Auto Summary</h4>
                </div>
                <p className="text-body1 text-label-neutral leading-relaxed">
                  {selectedCard.summary}
                  <br/><br/>
                  (This is where the extended transcript summary or detailed GitHub README analysis would be displayed, generated automatically by Claude Sonnet 4.6.)
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-line-normal-normal flex justify-between items-center bg-background-normal-normal max-md:flex-col max-md:gap-4">
              <div className="flex gap-3 max-md:flex-col max-md:w-full">
                <Button variant="solid" color="primary" leadingContent={<Icon name="book" size={20} />}>
                  Generate TIL
                </Button>
                <Button variant="outlined" color="primary" leadingContent={<Icon name="file-text" size={20} />}>
                  Generate Guide
                </Button>
                <Button variant="outlined" color="assistive" leadingContent={<Icon name="star" size={20} />}>
                  Deep Summary
                </Button>
              </div>
              <Button 
                variant={selectedCard.published ? "outlined" : "solid"} 
                color={selectedCard.published ? "negative" : "positive"}
                className="max-md:w-full"
              >
                {selectedCard.published ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}} />
    </div>
  );
}
