# 프로젝트 규칙 (fervent-einstein)

이 파일은 Claude Code가 시작할 때 로드되는 기본 규칙 및 커맨드 설정 파일입니다. 프로젝트 환경에 맞춰 아래 내용을 지속적으로 업데이트하십시오.

## 🛠️ 핵심 명령어 (Core Commands)

- 빌드: `npm run build`
- 린트: `npm run lint`
- 포맷터: `npm run format`
- 전체 테스트: `npm test`
- 단일 테스트 실행: `npm test -- <path_to_test_file>`

## 🎨 코드 스타일 (Code Style)

- 모듈 시스템: CommonJS 대신 ES modules (`import`/`export`) 사용
- 타입 지원: TypeScript 모듈 구조 및 엄격한 타입 정의 적용
- 의존성 주입: 클래스 생성자 기반의 의존성 주입 구조 유지

## 🔄 워크플로우 규칙 (Workflow)

- 코드 수정 후 반드시 `npm run lint` 및 관련 테스트를 실행하여 성공 여부를 검증할 것.
- `.claude/` 하위에 새 파일을 생성하면 반드시 [INDEX.md](INDEX.md)의 해당 섹션에 상대경로 링크와 한 줄 설명을 추가할 것.

## 📖 가이드북 (Guides)

에이전트가 아래 작업을 수행할 때만 해당 가이드를 개별적으로 열어 문맥으로 참고하십시오. (처음부터 로딩하지 말 것)

- 테스트 코드 작성 및 검증 수행 시: [testing.md](.claude/guides/testing.md) 참고
- Git 커밋 및 PR 초안 작성 시: [pr-conventions.md](.claude/guides/pr-conventions.md) 참고

## 하네스: 소프트웨어 개발 품질 관리

**목표:** 코드 리뷰, 보안 점검, 성능 분석, 린트 검사를 전문가 에이전트 팀이 자동으로 수행

**트리거:** "코드 리뷰", "점검", "보안 확인", "성능 분석", "린트" 등의 요청 시 `code-review` 스킬을 사용하라. DB 마이그레이션 작성/검토 요청 시 `db-migration` 스킬을 참고하라. 단순 질문은 직접 응답 가능.

## 하네스: NSQ 영어 학습 앱 개발 지원

**목표:** Next.js + TailwindCSS Montage DS + MediaRecorder API + OpenRouter AI 통합 구현을 전문가 에이전트 팀이 검증

**트리거:** "NSQ 앱", "영어 학습 앱", "컴포넌트 구현 확인", "기능 QA", "스펙 검증", "Montage DS 확인", "다크모드 확인" 등의 요청 시 `nsq-build` 스킬을 사용하라. 단순 질문은 직접 응답 가능.

**변경 이력:**
| 날짜 | 변경 내용 | 대상 | 사유 |
|------|----------|------|------|
| 2026-05-26 | 초기 구성 (code-review 하네스) | 전체 | - |
| 2026-05-27 | NSQ 앱 특화 에이전트 4개 추가 | agents/nextjs-reviewer, media-api-validator, ai-integration-reviewer, feature-flow-qa | 프로젝트 스택 특화 검증 필요 |
| 2026-05-27 | nsq-build 오케스트레이터 스킬 추가 | skills/nsq-build | NSQ 앱 개발 지원 하네스 구성 |
