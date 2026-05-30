# Design Spec: "No Stupid Questions" English Learning Program

This document details the architectural design and implementation specifications for the English learning web application based on the podcast *No Stupid Questions*, updated to adhere to the **Montage Design System** (based on Wanted Montage).

---

## 1. Project Overview & Goal
The goal of this project is to build a Next.js web application that helps users learn English by practicing shadowing, listening, and discussing topics with simulated AI personas (Angela, Mike, ESL Tutor) based on the *No Stupid Questions* podcast.

---

## 2. Design System & UI Specifications (Montage DS)
The interface will follow the official **Montage Design System** rules to maintain consistency, accessibility, and clean dark/light theme support.

### 2.1. Foundation
*   **Typography**: Font Family: `'Pretendard', sans-serif`. Typography variants include `title1`, `title3`, `heading1`, `body1`, `label1`, `caption1`.
*   **Colors**: Uses semantic tokens mapped to atomic color states:
    *   `primary-normal`: `#0066FF` (Light) / `#3385FF` (Dark)
    *   `label-normal`: `coolNeutral-10` (Light) / `coolNeutral-99` (Dark)
    *   `label-strong`: `#000000` (Light) / `#FFFFFF` (Dark)
    *   `background-normal-normal`: `#FFFFFF` (Light) / `coolNeutral-15` (Dark)
    *   `background-elevated-normal`: `#FFFFFF` (Light) / `coolNeutral-17` (Dark)
    *   `line-normal-normal`: `coolNeutral-50 @ 22%` (Light) / `coolNeutral-50 @ 32%` (Dark)
*   **Spacing**: 8pt spacing grid (e.g., `spacing-4` = 4px, `spacing-8` = 8px, `spacing-16` = 16px).
*   **Border Radius**: Cards/Panels: `12px ~ 16px`. Buttons/Inputs: `8px`.
*   **Icons**: SVG Icons based on line style `coolicons` (`stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`, utilizing `currentColor`).

### 2.2. Theme Control
*   Uses `next-themes` to support smooth toggle between Light/Dark mode via the `.dark` class.

---

## 3. Target Features

### 3.1. Integrated Study Workspace (UI Layout)
*   **Dual-Column Dashboard Layout**: Responsive grid mapping `1.2fr 1fr` on desktop (`breakpoint-md` / 992px) and collapsing to `1fr` on tablet/mobile.
*   **Audio Controller Panel**: Container (`background-elevated-normal`) with controls (Play/Pause, speed adjustment, segment loop toggle).
*   **Interactive Transcript**:
    *   Sentences highlighted based on audio time, styled with `background: rgba(primary-normal, 0.1)` and `border: 1px solid primary-normal` for the active sentence.
    *   Action chips: Play, Shadowing, Ask AI.

### 3.2. Shadowing Studio (Voice Practice)
*   **Microphone Recorder**: Browser `MediaRecorder API` wrapper component.
*   **Self-Evaluation**: Playback recorded voice side-by-side with original audio segment. Displays pronunciation score (80~100%).

### 3.3. AI Conversation Tutor
*   **Simulated Personas**: Angela Duckworth (Empirical psychologist), Mike Maughan (Friendly sports/tech executive), ESL Tutor (Grammar checker).
*   **Chat History Panel**: Responsive bubbles (`assistant` bubble: `background-elevated-normal`, `user` bubble: `primary-normal` background).

---

## 4. Technical Architecture
*   **Framework**: Next.js App Router (React, TypeScript).
*   **Styling**: TailwindCSS configured with Montage DS variables.
*   **APIs**: OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) for model requests, falling back to local simulated response templates if the API key is not present.

---

## 5. Verification Plan
*   Verify Next.js build runs without CSS or TS errors.
*   Verify that clicking transcript lines updates the audio player's currentTime.
*   Validate Dark/Light theme toggle using the next-themes provider.
