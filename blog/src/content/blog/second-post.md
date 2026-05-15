---
title: "Next.js App Router와 React Server Components 이해하기"
description: "React Server Components(RSC)의 핵심 개념과 Next.js App Router에서의 활용 방법에 대한 심층 분석 가이드입니다."
pubDate: "2026-05-16"
type: "file-text"
tags: ["Next.js", "React", "Frontend"]
sourceUrl: "https://nextjs.org/docs/app"
---

# Auto Summary

이 글은 Next.js 13부터 도입된 App Router와 React Server Components의 기본 동작 원리를 다루며, 클라이언트 컴포넌트와의 차이점 및 상태 관리 패턴을 요약합니다.

## React Server Components 란?

React Server Components (RSC)는 서버에서만 실행되고 클라이언트로 JavaScript 번들을 전송하지 않는 새로운 패러다임입니다. 이를 통해 초기 로딩 속도를 크게 개선하고 보안을 강화할 수 있습니다.

### 주요 장점
- **초기 번들 크기 감소**: 클라이언트로 전송되는 JS 파일 크기가 대폭 줄어듭니다.
- **데이터베이스 직접 접근**: 서버 환경이므로 DB나 파일 시스템에 직접 접근할 수 있습니다.
- **보안 강화**: API 키와 같은 민감한 정보가 클라이언트에 노출되지 않습니다.

### Client Component와의 차이점
`"use client"` 지시어를 사용하여 정의하는 클라이언트 컴포넌트와 달리, 서버 컴포넌트는 상태(State)나 생명주기(Lifecycle) 훅을 사용할 수 없습니다. 따라서 인터랙션이 필요한 부분에만 클라이언트 컴포넌트를 최소한으로 사용하는 패턴이 권장됩니다.
