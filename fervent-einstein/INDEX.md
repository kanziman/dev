# 프로젝트 인덱스 (Project Index)

에이전트가 프로젝트 문맥을 신속히 이해할 수 있도록 구조와 관련 링크를 매핑해 둔 문서 인덱스입니다.

## ⚙️ 설정 및 개발 규칙
- [CLAUDE.md](CLAUDE.md): 에이전트 기동 시 로드되는 핵심 빌드/테스트 규칙 및 서브 가이드 링크 정보.
- [.claude/settings.json](.claude/settings.json): 린트 및 포맷터 자동화 훅, 허용 명령어 설정.
- [package.json](package.json): 프로젝트 빌드/린트/포맷/테스트를 위한 표준 스크립트 정의.


## 📖 개발 설계 및 레퍼런스 가이드
- [references/harness-structure.md](references/harness-structure.md): Claude Code 베스트 프랙티스 기반의 하네스 구조 설계안.

## 🛠️ 기능 확장 모듈

### 스킬 (온디맨드 로드)
- [.claude/skills/code-review/SKILL.md](.claude/skills/code-review/SKILL.md): 코드 리뷰 오케스트레이터. 요청 유형에 따라 전문가 에이전트를 선택적으로 호출한다.
- [.claude/skills/api-conventions/SKILL.md](.claude/skills/api-conventions/SKILL.md): REST API 설계 표준 (URI 컨벤션, 에러 응답 형식, 페이징 등).
- [.claude/skills/db-migration/SKILL.md](.claude/skills/db-migration/SKILL.md): DB 마이그레이션 네이밍 규칙, 제로 다운타임 패턴, 롤백 전략.
- [.claude/skills/nsq-build/SKILL.md](.claude/skills/nsq-build/SKILL.md): NSQ 앱 개발 지원 오케스트레이터. 구현 검증·기능 QA·AI 통합 검증·미디어 API 검증을 전문가 에이전트 팀이 처리한다.

### 에이전트 (전문가 서브에이전트)
- [.claude/agents/security-reviewer.md](.claude/agents/security-reviewer.md): SQL Injection, XSS, 하드코딩 키 등 보안 취약점 정적 분석.
- [.claude/agents/linter-agent.md](.claude/agents/linter-agent.md): 코드 스타일, TypeScript 타입, 모듈 구조, 데드 코드 분석.
- [.claude/agents/perf-analyst.md](.claude/agents/perf-analyst.md): 알고리즘 복잡도, 메모리 누수, N+1 쿼리 등 성능 병목 탐지.
- [.claude/agents/nextjs-reviewer.md](.claude/agents/nextjs-reviewer.md): Next.js App Router, 'use client' 경계, React Hooks, TailwindCSS Montage DS 토큰, next-themes 다크모드 패턴 검토.
- [.claude/agents/media-api-validator.md](.claude/agents/media-api-validator.md): HTMLAudioElement, MediaRecorder API, Blob URL 메모리 관리, 오디오-트랜스크립트 동기화 검증.
- [.claude/agents/ai-integration-reviewer.md](.claude/agents/ai-integration-reviewer.md): OpenRouter API 통합, Mock 폴백 엔진, 환경변수 보안, 프롬프트 인젝션 검증.
- [.claude/agents/feature-flow-qa.md](.claude/agents/feature-flow-qa.md): NSQ 앱 핵심 플로우(오디오 동기화, 쉐도잉, AI 채팅, 다크모드) 스펙 대비 경계면 QA.
