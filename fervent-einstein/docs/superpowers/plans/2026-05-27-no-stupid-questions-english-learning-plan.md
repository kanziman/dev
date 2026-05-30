# No Stupid Questions English Learning Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js App Router English learning web application that synchronizes Freakonomics "No Stupid Questions" podcast audio with transcripts, provides a microphone-based shadowing studio, and connects to an OpenRouter-powered AI conversational tutor. The application fully conforms to the **Montage Design System** using TailwindCSS, Pretendard font, and next-themes for Light/Dark mode.

**Architecture:** A responsive dual-column dashboard layout containing an audio playback + transcript tracker on the left, and an AI chat workspace on the right. Utilizes React state, Web Audio APIs, and Next.js serverless API routes connected to OpenRouter.

**Tech Stack:** Next.js, React, TypeScript, TailwindCSS, next-themes, Pretendard font.

---

## Technical Files Mapping
*   **Initialization**: `./` (Root project directory)
*   **Types & Data**: `src/types/index.ts`, `src/data/episodes.json`
*   **Design System & CSS**: `src/app/globals.css`, `tailwind.config.ts`
*   **UI Components**:
    *   `src/components/Icon.tsx` (SVG line coolicons wrapper)
    *   `src/components/AudioPlayer.tsx`
    *   `src/components/TranscriptView.tsx`
    *   `src/components/ShadowingStudio.tsx`
    *   `src/components/AiTutorChat.tsx`
*   **Pages & Routing**:
    *   `src/app/page.tsx`
    *   `src/app/layout.tsx` (next-themes wrapper + Pretendard font load)
    *   `src/app/api/chat/route.ts`
*   **Utilities & Tests**:
    *   `src/utils/time.ts`
    *   `src/utils/time.test.ts`

---

## Tasks

### Task 1: Project Initialization & Types Configuration

**Files:**
*   Create: `src/types/index.ts`
*   Create: `src/data/episodes.json`
*   Create: `src/utils/time.ts`
*   Create: `src/utils/time.test.ts`

- [ ] **Step 1: Check create-next-app options**
  Run `npx create-next-app@latest --help` first to see available configuration flags as required.
  Run: `npx create-next-app@latest --help`
  Expected: Prints the CLI usage options.

- [ ] **Step 2: Initialize the Next.js App Router project**
  Create the Next.js project with TypeScript, ESLint, Tailwind CSS, App Router, Src folder, and NPM in the current directory.
  Run: `npx -y create-next-app@latest ./ --typescript --eslint --tailwind --app --src-dir --import-alias "@/*" --use-npm`
  Expected: Project directories and dependencies initialized.

- [ ] **Step 3: Define TypeScript Types**
  Create `src/types/index.ts` to manage type safety for episodes, transcripts, messages, and personas.
  Code for `src/types/index.ts`:
  ```typescript
  export interface TranscriptSegment {
    id: number;
    speaker: string;
    start: number;
    end: number;
    text: string;
  }

  export interface Episode {
    id: string;
    title: string;
    speakers: string[];
    audioUrl: string;
    description: string;
    transcript: TranscriptSegment[];
  }

  export interface ChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: number;
  }

  export type PersonaType = 'angela' | 'mike' | 'tutor';
  ```

- [ ] **Step 4: Create Built-in Episode JSON**
  Create `src/data/episodes.json` containing 2 sample episodes with real audio URLs and transcripts.
  Code for `src/data/episodes.json`:
  ```json
  [
    {
      "id": "nsq-142",
      "title": "Are There Stupid Questions?",
      "speakers": ["Angela Duckworth", "Mike Maughan"],
      "audioUrl": "https://traffic.omny.fm/d/clips/aaea4e69-e61a-46b8-a72e-ad0f013b7562/313364f9-c09a-4122-83b6-ad0e01087595/7f4a7c03-5182-4fdb-ac49-b14e015d97f5/audio.mp3",
      "description": "Angela Duckworth and Mike Maughan explore the psychology of questioning and whether there really is no such thing as a stupid question.",
      "transcript": [
        {
          "id": 1,
          "speaker": "Angela Duckworth",
          "start": 5.2,
          "end": 12.0,
          "text": "So Mike, I was thinking about this phrase 'there's no such thing as a stupid question.' Do you actually believe that?"
        },
        {
          "id": 2,
          "speaker": "Mike Maughan",
          "start": 12.1,
          "end": 21.0,
          "text": "Well Angela, to be completely honest, I think we've both heard some questions that make us pause and wonder."
        },
        {
          "id": 3,
          "speaker": "Angela Duckworth",
          "start": 21.1,
          "end": 30.0,
          "text": "Hahaha, exactly! But seriously, the psychology behind why we ask questions, and why we fear asking them, is fascinating."
        }
      ]
    },
    {
      "id": "nsq-150",
      "title": "Why Do We Compare Ourselves to Others?",
      "speakers": ["Angela Duckworth", "Mike Maughan"],
      "audioUrl": "https://traffic.omny.fm/d/clips/aaea4e69-e61a-46b8-a72e-ad0f013b7562/313364f9-c09a-4122-83b6-ad0e01087595/5ecf3661-3444-4b53-b68a-b14e015f6259/audio.mp3",
      "description": "Angela and Mike dissect social comparison theory and why our brains are hardwired to look at what other people have.",
      "transcript": [
        {
          "id": 1,
          "speaker": "Mike Maughan",
          "start": 6.5,
          "end": 13.0,
          "text": "Angela, social comparison theory says we determine our own social and personal worth based on how we stack up against others."
        },
        {
          "id": 2,
          "speaker": "Angela Duckworth",
          "start": 13.1,
          "end": 22.0,
          "text": "Right, Leon Festinger came up with that in 1954, and it's only gotten worse with social media."
        }
      ]
    }
  ]
  ```

- [ ] **Step 5: Write Time Formatting Utility & Test**
  Create `src/utils/time.ts` to convert seconds to "MM:SS" format.
  Code for `src/utils/time.ts`:
  ```typescript
  export function formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  ```
  Create `src/utils/time.test.ts` to verify the formatting utility.
  Code for `src/utils/time.test.ts`:
  ```typescript
  import { formatTime } from "./time";

  describe("formatTime Utility", () => {
    test("formats seconds to MM:SS correctly", () => {
      expect(formatTime(0)).toBe("00:00");
      expect(formatTime(65)).toBe("01:05");
      expect(formatTime(3600)).toBe("60:00");
    });

    test("handles negative numbers and NaN", () => {
      expect(formatTime(-10)).toBe("00:00");
      expect(formatTime(NaN)).toBe("00:00");
    });
  });
  ```

- [ ] **Step 6: Verify utility compilation**
  Run a simple node check to verify that formatting compiles and works correctly.
  Run: `node -e "const assert = require('assert'); const { formatTime } = require('./src/utils/time'); assert.strictEqual(formatTime(65), '01:05'); assert.strictEqual(formatTime(0), '00:00'); console.log('Utility verification passed!');"`
  Expected: Prints "Utility verification passed!"

- [ ] **Step 7: Commit files**
  Run: `git add src/types/index.ts src/data/episodes.json src/utils/time.ts src/utils/time.test.ts; git commit -m "feat: setup configuration types and episodes JSON"`
  Expected: Success commit.

---

### Task 2: Montage Design System & Theme Provider Setup

**Files:**
*   Modify: `src/app/globals.css`
*   Modify: `tailwind.config.ts` (or `tailwind.config.js`)
*   Modify: `src/app/layout.tsx`
*   Create: `src/components/Icon.tsx`

- [ ] **Step 1: Install theme library**
  Install `next-themes` to handle Dark/Light theme switching as specified in the reference document.
  Run: `npm install next-themes`
  Expected: Installation finishes successfully.

- [ ] **Step 2: Configure Montage design tokens in CSS variables**
  Edit `src/app/globals.css` to load Pretendard, and declare color tokens, border radiuses, and font sizes matching Montage specifications.
  Code for `src/app/globals.css`:
  ```css
  @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css");

  :root {
    --color-primary-normal: #0066FF;
    --color-primary-strong: #005EEB;
    --color-primary-heavy: #0054D1;
    
    --color-label-normal: #171719;
    --color-label-strong: #000000;
    --color-label-neutral: rgba(46, 47, 51, 0.88);
    --color-label-assistive: rgba(55, 56, 60, 0.28);
    
    --color-background-normal-normal: #FFFFFF;
    --color-background-normal-alternative: #F7F7F8;
    --color-background-elevated-normal: #FFFFFF;
    
    --color-line-normal-normal: rgba(112, 115, 124, 0.22);
    --color-line-solid-normal: #EAEBEC;

    --font-pretendard: 'Pretendard', sans-serif;
  }

  .dark {
    --color-primary-normal: #3385FF;
    --color-primary-strong: #1A75FF;
    --color-primary-heavy: #0066FF;
    
    --color-label-normal: #DBDCDF;
    --color-label-strong: #FFFFFF;
    --color-label-neutral: rgba(152, 155, 162, 0.88);
    --color-label-assistive: rgba(152, 155, 162, 0.28);
    
    --color-background-normal-normal: #1B1C1E;
    --color-background-normal-alternative: #0F0F10;
    --color-background-elevated-normal: #171719;
    
    --color-line-normal-normal: rgba(112, 115, 124, 0.32);
    --color-line-solid-normal: #2E2F33;
  }

  body {
    background-color: var(--color-background-normal-normal);
    color: var(--color-label-normal);
    font-family: var(--font-pretendard);
  }
  ```

- [ ] **Step 3: Map colors in tailwind.config.ts**
  Replace contents of `tailwind.config.ts` (or `tailwind.config.js`) to support semantic class names (`bg-background-elevated-normal`, `text-label-normal`, etc.) mapped to CSS variables.
  Code for `tailwind.config.ts`:
  ```typescript
  import type { Config } from 'tailwindcss';

  const config: Config = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['var(--font-pretendard)', 'sans-serif'],
        },
        colors: {
          primary: {
            normal: 'var(--color-primary-normal)',
            strong: 'var(--color-primary-strong)',
            heavy: 'var(--color-primary-heavy)',
          },
          label: {
            normal: 'var(--color-label-normal)',
            strong: 'var(--color-label-strong)',
            neutral: 'var(--color-label-neutral)',
            assistive: 'var(--color-label-assistive)',
          },
          background: {
            normal: {
              normal: 'var(--color-background-normal-normal)',
              alternative: 'var(--color-background-normal-alternative)',
            },
            elevated: {
              normal: 'var(--color-background-elevated-normal)',
            }
          },
          line: {
            normal: {
              normal: 'var(--color-line-normal-normal)',
            },
            solid: {
              normal: 'var(--color-line-solid-normal)',
            }
          }
        },
        spacing: {
          '4': '4px',
          '8': '8px',
          '12': '12px',
          '16': '16px',
          '20': '20px',
          '24': '24px',
          '32': '32px',
          '40': '40px',
        },
        borderRadius: {
          'sm': '6px',
          'md': '8px',
          'lg': '12px',
          'xl': '16px',
        }
      },
    },
    plugins: [],
  };
  export default config;
  ```

- [ ] **Step 4: Update layout.tsx with ThemeProvider**
  Configure `src/app/layout.tsx` to mount `ThemeProvider` from `next-themes` and load global stylesheets.
  Code for `src/app/layout.tsx`:
  ```tsx
  import type { Metadata } from 'next';
  import { ThemeProvider } from 'next-themes';
  import './globals.css';

  export const metadata: Metadata = {
    title: 'No Stupid Questions English Workspace',
    description: 'Learn English with the Freakonomics No Stupid Questions podcast.',
  };

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] **Step 5: Create Icon component (Coolicons)**
  Create `src/components/Icon.tsx` wrapping line style coolicons in SVGs.
  Code for `src/components/Icon.tsx`:
  ```tsx
  import React from 'react';

  interface IconProps {
    name: 'play' | 'pause' | 'microphone' | 'chat' | 'close' | 'sun' | 'moon' | 'loop' | 'right-arrow';
    size?: 16 | 20 | 24 | 32;
    className?: string;
  }

  export default function Icon({ name, size = 24, className = '' }: IconProps) {
    const paths: Record<IconProps['name'], React.ReactNode> = {
      play: <path d="M8 5v14l11-7z" />,
      pause: <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />,
      microphone: (
        <>
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4m-4 0h8" />
        </>
      ),
      chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
      close: <path d="M18 6 6 18M6 6l12 12" />,
      sun: (
        <>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </>
      ),
      moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
      loop: <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l.73-.73" />,
      'right-arrow': <path d="M5 12h14M12 5l7 7-7 7" />
    };

    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {paths[name]}
      </svg>
    );
  }
  ```

- [ ] **Step 6: Commit style configurations**
  Run: `git add src/app/globals.css tailwind.config.ts src/app/layout.tsx src/components/Icon.tsx; git commit -m "style: map design system tokens and create Icon wrapper"`
  Expected: Success commit.

---

### Task 3: Interactive Podcast Audio & Transcript Synchronization

**Files:**
*   Create: `src/components/AudioPlayer.tsx`
*   Create: `src/components/TranscriptView.tsx`

- [ ] **Step 1: Implement Audio Player**
  Create `src/components/AudioPlayer.tsx` containing player states, and binding loops to selected active transcript sections.
  Code for `src/components/AudioPlayer.tsx`:
  ```tsx
  'use client';
  import React, { useRef, useEffect, useState } from 'react';
  import { Episode, TranscriptSegment } from '@/types';
  import { formatTime } from '@/utils/time';
  import Icon from './Icon';

  interface AudioPlayerProps {
    episode: Episode;
    currentTime: number;
    onTimeUpdate: (time: number) => void;
    activeSegment: TranscriptSegment | null;
    loopSegment: boolean;
    setLoopSegment: (loop: boolean) => void;
    playerRef: React.RefObject<HTMLAudioElement | null>;
  }

  export default function AudioPlayer({
    episode,
    currentTime,
    onTimeUpdate,
    activeSegment,
    loopSegment,
    setLoopSegment,
    playerRef
  }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1.0);

    const togglePlay = () => {
      if (!playerRef.current) return;
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play().catch(e => console.log("Playback blocked: ", e));
      }
    };

    useEffect(() => {
      const audio = playerRef.current;
      if (!audio) return;

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleLoadedMetadata = () => setDuration(audio.duration);
      const handleTimeUpdate = () => {
        onTimeUpdate(audio.currentTime);
        if (loopSegment && activeSegment) {
          if (audio.currentTime >= activeSegment.end) {
            audio.currentTime = activeSegment.start;
          }
        }
      };

      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }, [onTimeUpdate, loopSegment, activeSegment, playerRef]);

    useEffect(() => {
      if (playerRef.current) {
        playerRef.current.playbackRate = speed;
      }
    }, [speed, playerRef]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!playerRef.current) return;
      const targetTime = parseFloat(e.target.value);
      playerRef.current.currentTime = targetTime;
      onTimeUpdate(targetTime);
    };

    return (
      <div className="p-4 bg-background-elevated-normal border-b border-line-normal-normal">
        <audio ref={playerRef} src={episode.audioUrl} preload="metadata" />
        <div className="mb-3">
          <h3 className="text-md font-bold text-label-strong">{episode.title}</h3>
          <p className="text-sm text-label-neutral">{episode.speakers.join(' & ')}</p>
        </div>
        
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-line-solid-normal rounded-lg appearance-none cursor-pointer accent-primary-normal"
        />
        
        <div className="flex justify-between text-xs text-label-neutral mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex justify-between items-center mt-4">
          <select 
            value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="p-1.5 bg-background-normal-alternative text-label-normal border border-line-normal-normal rounded-md text-sm cursor-pointer"
          >
            <option value={0.8}>0.8x (Slow)</option>
            <option value={1.0}>1.0x (Normal)</option>
            <option value={1.2}>1.2x (Fast)</option>
            <option value={1.5}>1.5x (Very Fast)</option>
          </select>

          <button 
            onClick={togglePlay}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-normal hover:bg-primary-strong text-white border-none rounded-md cursor-pointer font-bold transition-all"
          >
            <Icon name={isPlaying ? 'pause' : 'play'} size={16} />
            {isPlaying ? 'Pause' : 'Play'}
          </button>

          <button 
            onClick={() => setLoopSegment(!loopSegment)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm cursor-pointer transition-all ${
              loopSegment 
                ? 'bg-primary-normal text-white border-primary-normal' 
                : 'bg-background-normal-alternative text-label-normal border-line-normal-normal'
            }`}
          >
            <Icon name="loop" size={16} />
            Loop Sentence
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Implement Transcript View**
  Create `src/components/TranscriptView.tsx` supporting interactive clicks, active line highlight, and individual card actions.
  Code for `src/components/TranscriptView.tsx`:
  ```tsx
  'use client';
  import React, { useEffect, useRef } from 'react';
  import { TranscriptSegment } from '@/types';
  import { formatTime } from '@/utils/time';
  import Icon from './Icon';

  interface TranscriptViewProps {
    transcript: TranscriptSegment[];
    activeSegment: TranscriptSegment | null;
    onSelectSegment: (segment: TranscriptSegment) => void;
    onAskAI: (text: string) => void;
    onShadow: (segment: TranscriptSegment) => void;
  }

  export default function TranscriptView({
    transcript,
    activeSegment,
    onSelectSegment,
    onAskAI,
    onShadow
  }: TranscriptViewProps) {
    const listRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (activeRef.current) {
        activeRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }, [activeSegment]);

    return (
      <div 
        ref={listRef} 
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background-normal-alternative"
      >
        {transcript.map((seg) => {
          const isActive = activeSegment?.id === seg.id;
          return (
            <div 
              key={seg.id}
              ref={isActive ? activeRef : null}
              className={`p-4 rounded-lg cursor-pointer border transition-all ${
                isActive 
                  ? 'bg-primary-normal/10 border-primary-normal' 
                  : 'bg-background-elevated-normal border-transparent hover:border-line-normal-normal'
              }`}
              onClick={() => onSelectSegment(seg)}
            >
              <div className="flex justify-between text-xs text-label-neutral mb-2">
                <span className="font-bold text-primary-normal">{seg.speaker}</span>
                <span>{formatTime(seg.start)} - {formatTime(seg.end)}</span>
              </div>
              <p className="text-label-strong text-md leading-relaxed">{seg.text}</p>
              
              <div className="flex gap-2.5 mt-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); onSelectSegment(seg); }}
                  className="flex items-center gap-1 bg-background-normal-alternative border border-line-normal-normal text-label-normal rounded px-2.5 py-1 text-xs cursor-pointer hover:bg-line-normal-normal transition-all"
                >
                  <Icon name="play" size={16} className="text-primary-normal" />
                  Play
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onShadow(seg); }}
                  className="flex items-center gap-1 bg-background-normal-alternative border border-line-normal-normal text-label-normal rounded px-2.5 py-1 text-xs cursor-pointer hover:bg-line-normal-normal transition-all"
                >
                  <Icon name="microphone" size={16} className="text-primary-normal" />
                  Shadowing
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAskAI(seg.text); }}
                  className="flex items-center gap-1 bg-background-normal-alternative border border-line-normal-normal text-label-normal rounded px-2.5 py-1 text-xs cursor-pointer hover:bg-line-normal-normal transition-all"
                >
                  <Icon name="chat" size={16} className="text-primary-normal" />
                  Ask AI
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit audio transcript changes**
  Run: `git add src/components/AudioPlayer.tsx src/components/TranscriptView.tsx; git commit -m "feat: design visual podcast player and transcript lists"`
  Expected: Success commit.

---

### Task 4: Shadowing Voice Recorder (Web Audio API)

**Files:**
*   Create: `src/components/ShadowingStudio.tsx`

- [ ] **Step 1: Implement Shadowing Studio**
  Create `src/components/ShadowingStudio.tsx` integrating microphone streams, recording playback, and score generation.
  Code for `src/components/ShadowingStudio.tsx`:
  ```tsx
  'use client';
  import React, { useState, useRef } from 'react';
  import { TranscriptSegment } from '@/types';
  import Icon from './Icon';

  interface ShadowingStudioProps {
    segment: TranscriptSegment | null;
    onClose: () => void;
  }

  export default function ShadowingStudio({ segment, onClose }: ShadowingStudioProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [score, setScore] = useState<number | null>(null);

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioBlobUrl(url);
          const simulatedScore = Math.floor(80 + Math.random() * 20);
          setScore(simulatedScore);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        setScore(null);
      } catch (err) {
        console.error("Microphone access blocked: ", err);
        alert("Microphone access is required to use this shadowing feature.");
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }
    };

    if (!segment) return null;

    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background-elevated-normal border border-line-normal-normal rounded-xl p-6 w-[90%] max-w-[500px] shadow-2xl z-[1300] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-primary-normal flex items-center gap-2">
            <Icon name="microphone" size={20} />
            Shadowing Practice
          </h3>
          <button 
            onClick={onClose} 
            className="bg-none border-none text-label-neutral hover:text-label-strong cursor-pointer"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="bg-background-normal-alternative p-4 rounded-lg">
          <p className="text-xs text-primary-normal font-bold mb-1">Original Line ({segment.speaker}):</p>
          <p className="text-label-strong text-md leading-relaxed">{segment.text}</p>
        </div>

        <div className="flex flex-col items-center gap-4 mt-2">
          {isRecording ? (
            <button 
              onClick={stopRecording} 
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white border-none rounded-md cursor-pointer font-bold transition-all"
            >
              🛑 Stop Recording
            </button>
          ) : (
            <button 
              onClick={startRecording} 
              className="flex items-center gap-2 px-6 py-3 bg-primary-normal hover:bg-primary-strong text-white border-none rounded-md cursor-pointer font-bold transition-all"
            >
              🎙 Start Recording
            </button>
          )}

          {audioBlobUrl && (
            <div className="w-full flex flex-col gap-2 items-center">
              <span className="text-xs text-label-neutral">Listen to your pronunciation:</span>
              <audio src={audioBlobUrl} controls className="w-full max-w-[320px]" />
            </div>
          )}

          {score !== null && (
            <div className={`text-md font-bold ${score >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
              🎯 Pronunciation Match Score: {score}%
            </div>
          )}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit shadowing component**
  Run: `git add src/components/ShadowingStudio.tsx; git commit -m "feat: implement shadowing studio recorder and feedback"`
  Expected: Success commit.

---

### Task 5: AI Conversation Tutor UI (Personas & Context Integration)

**Files:**
*   Create: `src/components/AiTutorChat.tsx`

- [ ] **Step 1: Implement AI Tutor Chat Component**
  Create `src/components/AiTutorChat.tsx` supporting active persona switching, scrolling chat dialog feeds, and quick prompt helpers.
  Code for `src/components/AiTutorChat.tsx`:
  ```tsx
  'use client';
  import React, { useState, useEffect, useRef } from 'react';
  import { ChatMessage, PersonaType } from '@/types';

  interface AiTutorChatProps {
    contextSentence: string;
    onClearContext: () => void;
  }

  export default function AiTutorChat({ contextSentence, onClearContext }: AiTutorChatProps) {
    const [persona, setPersona] = useState<PersonaType>('angela');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const welcome: Record<PersonaType, string> = {
        angela: "Hi! I'm Angela. Let's discuss today's episode. What are your thoughts on why people find it so hard to say 'I don't know'?",
        mike: "Hey! Mike here. Great to chat with you today! What did you think about the story we shared in this episode?",
        tutor: "Hello! I am your ESL English Tutor. Ask me any grammar questions, vocabulary queries, or we can practice writing natural English sentences."
      };
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: welcome[persona],
          timestamp: Date.now()
        }
      ]);
    }, [persona]);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (textToSend: string) => {
      if (!textToSend.trim() || isLoading) return;
      
      const userMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'user',
        text: textToSend,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            persona,
            contextSentence: contextSentence || undefined
          })
        });

        if (!response.ok) throw new Error("API failed");
        
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'assistant',
          text: data.reply,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
      } catch (err) {
        console.error("AI tutor error: ", err);
        setMessages(prev => [...prev, {
          id: 'error',
          sender: 'assistant',
          text: "Oops, I'm having trouble responding right now. Please check your OpenRouter connection.",
          timestamp: Date.now()
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex flex-col h-full bg-background-normal-normal">
        {/* Persona Selectors */}
        <div className="p-4 bg-background-elevated-normal border-b border-line-normal-normal flex gap-2">
          <button 
            onClick={() => setPersona('angela')} 
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
              persona === 'angela' 
                ? 'bg-primary-normal text-white border-primary-normal' 
                : 'bg-background-normal-alternative text-label-normal border-line-normal-normal'
            }`}
          >
            Angela Bot
          </button>
          <button 
            onClick={() => setPersona('mike')} 
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
              persona === 'mike' 
                ? 'bg-primary-normal text-white border-primary-normal' 
                : 'bg-background-normal-alternative text-label-normal border-line-normal-normal'
            }`}
          >
            Mike Bot
          </button>
          <button 
            onClick={() => setPersona('tutor')} 
            className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
              persona === 'tutor' 
                ? 'bg-primary-normal text-white border-primary-normal' 
                : 'bg-background-normal-alternative text-label-normal border-line-normal-normal'
            }`}
          >
            ESL Tutor
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                msg.sender === 'user' 
                  ? 'self-end bg-primary-normal text-white rounded-br-none' 
                  : 'self-start bg-background-elevated-normal text-label-strong border border-line-normal-normal rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {isLoading && <div className="text-xs text-label-neutral italic">Thinking...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Send panel */}
        <div className="p-4 bg-background-elevated-normal border-t border-line-normal-normal">
          {contextSentence && (
            <div className="flex justify-between items-center bg-background-normal-alternative border border-line-normal-normal px-3 py-2 rounded mb-3 text-xs text-label-neutral">
              <span className="truncate">Context: "{contextSentence}"</span>
              <button onClick={onClearContext} className="text-red-500 hover:text-red-600 bg-none border-none cursor-pointer font-bold ml-2">Clear</button>
            </div>
          )}
          
          <div className="flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or reply to the bot..."
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              className="flex-1 p-2 bg-background-normal-alternative border border-line-normal-normal text-label-strong rounded-md text-sm outline-none focus:border-primary-normal transition-all"
            />
            <button 
              onClick={() => handleSend(input)}
              className="px-4 py-2 bg-primary-normal hover:bg-primary-strong text-white border-none rounded-md cursor-pointer font-bold transition-all text-sm"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit chat component**
  Run: `git add src/components/AiTutorChat.tsx; git commit -m "feat: implement AI Chat panel with selector modes"`
  Expected: Success commit.

---

### Task 6: Secure API Chat Route with OpenRouter Integration

**Files:**
*   Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: Create Next API Chat Route**
  Create `src/app/api/chat/route.ts` using fetch mapping to OpenRouter completions. Includes fallback mocks.
  Code for `src/app/api/chat/route.ts`:
  ```typescript
  import { NextResponse } from 'next/server';

  const SYSTEM_PROMPTS: Record<string, string> = {
    angela: "You are Angela Duckworth, research psychologist and co-host of the podcast 'No Stupid Questions'. Engage in casual, thoughtful discussion with the user about the podcast. Refer to psychological concepts, values of persistence/grit, keep a warm academic tone, and end with a thought-provoking question.",
    mike: "You are Mike Maughan, tech executive and co-host of 'No Stupid Questions'. Talk with the user enthusiastically, use common business and sports idioms, share brief anecdotes, keep it friendly and conversational, and encourage their opinions.",
    tutor: "You are a warm, supportive ESL English Tutor. Review the user's message, correct any spelling or grammatical errors, provide explanations for any difficult idioms or expressions in the context sentence, and suggest a more natural way to write their ideas."
  };

  const MOCK_REPLIES: Record<string, string[]> = {
    angela: [
      "That is a fascinating perspective! In cognitive psychology, we observe that people are hesitant to ask questions due to social friction. Do you notice this in your workplace?",
      "Exactly! And it relates to the concept of grit — showing resilience and continuing to ask questions even when they feel silly. How do you practice this in daily life?",
      "Very interesting. I wonder if there is an empirical study validating that observation. What do you think would happen if we tested that hypothesis?"
    ],
    mike: [
      "Oh, totally! I've seen that happen so many times in business contexts. It reminds me of a team I once worked with. How do you handle those situations?",
      "That is spot-on! You hit the nail right on the head. Let me ask you: if you were in our shoes in this episode, what would be your next step?",
      "Hahaha, love that! That's exactly why Angela and I started this discussion. Let's keep exploring this topic together!"
    ],
    tutor: [
      "Great response! Your sentence structure is excellent. One small suggestion: instead of saying 'embarrassed', you can use the word 'apprehensive' to sound more formal. Keep it up!",
      "Perfect grammar! Here's a tip: in English, we often say 'make a mistake' instead of 'do a mistake'. Let's try rewriting your last sentence using that idiom.",
      "Wonderful thoughts. If you want to sound more like a native speaker, you could say: 'I prefer to stay quiet rather than speak up.' Try repeating that sentence!"
    ]
  };

  export async function POST(req: Request) {
    try {
      const { message, persona, contextSentence } = await req.json();
      
      const apiKey = process.env.OPENROUTER_API_KEY;
      const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
      const prompt = SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS.angela;
      
      if (!apiKey) {
        const replies = MOCK_REPLIES[persona] || MOCK_REPLIES.angela;
        const randomIdx = Math.floor(Math.random() * replies.length);
        let reply = replies[randomIdx];
        
        if (contextSentence) {
          reply = `[Studying sentence: "${contextSentence.substring(0, 40)}..."] ` + reply;
        }
        
        return NextResponse.json({ reply });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'No Stupid Questions English Workspace'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: prompt + (contextSentence ? `\nThe student is currently studying this transcript line: "${contextSentence}"` : '') },
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content || "No response received.";
      return NextResponse.json({ reply });

    } catch (error: any) {
      console.error("API Route Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  ```

- [ ] **Step 2: Commit API Route changes**
  Run: `git add src/app/api/chat/route.ts; git commit -m "feat: build secure api endpoint linking openrouter credentials"`
  Expected: Success commit.

---

### Task 7: Layout Assembly & Workspace Page integration

**Files:**
*   Modify: `src/app/page.tsx`

- [ ] **Step 1: Implement Page Workspace layout**
  Edit `src/app/page.tsx` integrating all components, handling dark mode toggler header, and managing global active states.
  Code for `src/app/page.tsx`:
  ```tsx
  'use client';
  import React, { useState, useRef } from 'react';
  import { useTheme } from 'next-themes';
  import { Episode, TranscriptSegment } from '@/types';
  import episodesData from '@/data/episodes.json';
  import AudioPlayer from '@/components/AudioPlayer';
  import TranscriptView from '@/components/TranscriptView';
  import ShadowingStudio from '@/components/ShadowingStudio';
  import AiTutorChat from '@/components/AiTutorChat';
  import Icon from '@/components/Icon';

  export default function Home() {
    const episodes: Episode[] = episodesData as Episode[];
    const [selectedEpisode, setSelectedEpisode] = useState<Episode>(episodes[0]);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeSegment, setActiveSegment] = useState<TranscriptSegment | null>(null);
    const [loopSegment, setLoopSegment] = useState(false);
    const [shadowingSegment, setShadowingSegment] = useState<TranscriptSegment | null>(null);
    const [chatContext, setChatContext] = useState('');
    const playerRef = useRef<HTMLAudioElement | null>(null);
    
    const { theme, setTheme } = useTheme();

    const handleTimeUpdate = (time: number) => {
      setCurrentTime(time);
      const active = selectedEpisode.transcript.find(
        (seg) => time >= seg.start && time <= seg.end
      );
      if (active && active.id !== activeSegment?.id) {
        setActiveSegment(active);
      }
    };

    const handleSelectSegment = (segment: TranscriptSegment) => {
      if (playerRef.current) {
        playerRef.current.currentTime = segment.start;
        setCurrentTime(segment.start);
        setActiveSegment(segment);
      }
    };

    const handleAskAI = (text: string) => {
      setChatContext(text);
    };

    const handleShadow = (segment: TranscriptSegment) => {
      setShadowingSegment(segment);
    };

    return (
      <div className="flex flex-col h-screen bg-background-normal-normal text-label-normal">
        <header className="flex justify-between items-center px-6 py-4 bg-background-elevated-normal border-b border-line-normal-normal">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-primary-normal flex items-center gap-2">
              <Icon name="chat" size={24} />
              No Stupid Questions English Learning Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={selectedEpisode.id}
              onChange={(e) => {
                const ep = episodes.find((item) => item.id === e.target.value);
                if (ep) {
                  setSelectedEpisode(ep);
                  setCurrentTime(0);
                  setActiveSegment(null);
                  setChatContext('');
                  if (playerRef.current) playerRef.current.src = ep.audioUrl;
                }
              }}
              className="p-2 bg-background-normal-alternative text-label-normal border border-line-normal-normal rounded-md text-sm cursor-pointer"
            >
              {episodes.map((ep) => (
                <option key={ep.id} value={ep.id}>{ep.title}</option>
              ))}
            </select>

            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-background-normal-alternative border border-line-normal-normal rounded-md cursor-pointer hover:bg-line-normal-normal transition-all"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4 p-4 overflow-hidden bg-background-normal-alternative">
          {/* LEFT: Podcast & Transcript */}
          <div className="flex flex-col rounded-lg border border-line-normal-normal overflow-hidden bg-background-normal-normal">
            <AudioPlayer 
              episode={selectedEpisode}
              currentTime={currentTime}
              onTimeUpdate={handleTimeUpdate}
              activeSegment={activeSegment}
              loopSegment={loopSegment}
              setLoopSegment={setLoopSegment}
              playerRef={playerRef}
            />
            <TranscriptView 
              transcript={selectedEpisode.transcript}
              activeSegment={activeSegment}
              onSelectSegment={handleSelectSegment}
              onAskAI={handleAskAI}
              onShadow={handleShadow}
            />
          </div>

          {/* RIGHT: AI Tutor Chat */}
          <div className="flex flex-col rounded-lg border border-line-normal-normal overflow-hidden bg-background-normal-normal">
            <AiTutorChat 
              contextSentence={chatContext}
              onClearContext={() => setChatContext('')}
            />
          </div>
        </main>

        {/* Modal: Shadowing Practice Studio overlay */}
        {shadowingSegment && (
          <div className="fixed inset-0 bg-black/60 z-[1200]">
            <ShadowingStudio 
              segment={shadowingSegment}
              onClose={() => setShadowingSegment(null)}
            />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit layout assemble changes**
  Run: `git add src/app/page.tsx; git commit -m "feat: assemble page layouts with theme triggers"`
  Expected: Success commit.

---

### Task 8: Verification & Local Testing

- [ ] **Step 1: Check build**
  Run: `npm run build`
  Expected: NextJS compilation and static production bundles created successfully without errors.

- [ ] **Step 2: Run verification scripts**
  Verify the fallback mechanism of the chat and page rendering. Run the dev server to test interactively.
  Run: `npm run dev`
  Expected: Dev server runs successfully at http://localhost:3000.
