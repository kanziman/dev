# Claude Code 개발 하네스(Harness) 구조 제안서

본 문서는 Anthropic의 **Claude Code 베스트 프랙티스(Best Practices)**를 바탕으로, 에이전트(Agentic LLM)가 프로젝트를 가장 효율적으로 분석, 구현, 검증할 수 있도록 돕는 **개발 하네스(Development Harness) 구조**를 정의합니다.

에이전트 환경에서 가장 중요한 제약 조건은 **컨텍스트 윈도우(Context Window) 관리**이며, 가장 효과적인 윤활유는 **자율적인 검증 수단(Verification)**입니다. 이를 극대화하기 위해 다음과 같은 구조를 제안합니다.

---

## 📂 제안하는 하네스 디렉토리 구조

프로젝트 루트에 에이전트 전용 설정 및 자율 실행 공간을 구축합니다.

```text
best-harness/
├── CLAUDE.md                   # 에이전트 기동 시 로드되는 기본 규칙 및 커맨드 정의
├── .claude/                    # Claude Code 전용 설정 폴더
│   ├── settings.json           # 자동 승인, 샌드박스, 훅(Hooks) 바인딩 설정
│   ├── skills/                 # 도메인 지식 및 공통 워크플로우 (온디맨드 로드)
│   │   ├── api-conventions/
│   │   │   └── SKILL.md
│   │   └── db-migration/
│   │       └── SKILL.md
│   └── agents/                 # 특정 태스크 처리를 위한 맞춤형 서브에이전트 정의
│       ├── security-reviewer.md
│       └── linter-agent.md
├── references/                        # 프로젝트 관련 레퍼런스 문서 보관 폴더
│   └── harness-structure.md    # [본 문서]
├── tests/                      # 에이전트가 자체 검증할 때 실행할 테스트 슈트
│   ├── helpers/
│   └── ...
└── package.json (또는 build.sh) # 표준화된 진입점 스크립트 정의
```

---

## 1. 📝 CLAUDE.md (기본 프로젝트 컨텍스트)

`CLAUDE.md`는 대화 세션이 시작될 때 Claude가 항상 읽는 최우선 파일입니다. 코드를 읽어서 알 수 있는 정보는 제외하고, **빌드/테스트 명령어, 코드 스타일 가이드라인, 워크플로우 규칙** 등 에이전트가 즉시 참고해야 할 핵심 정보만 간결하게 포함합니다.

### 💡 권장 작성 예시

```markdown
# 프로젝트 규칙 (best-harness)

## 🛠️ 핵심 명령어 (Core Commands)

- 빌드: `npm run build`
- 린트: `npm run lint`
- 포맷터: `npm run format`
- 전체 테스트: `npm test`
- 단일 테스트 실행: `npm test -- <path_to_test_file>` (컨텍스트 절약을 위해 단일 실행 권장)

## 🎨 코드 스타일 (Code Style)

- 모듈 시스템: CommonJS 대신 ES modules (`import`/`export`) 사용
- 타입 지원: TypeScript 모듈 구조 및 엄격한 타입 정의 적용
- 의존성 주입: 클래스 생성자 기반의 의존성 주입 구조 유지

## 🔄 워크플로우 규칙 (Workflow)

- 코드 수정 후 반드시 `npm run lint` 및 관련 테스트를 실행하여 성공 여부를 검증할 것.
- 새로운 기능 구현 시 작업 시작 전에 세부 설계 계획(Plan)을 제시하고 승인을 받은 뒤 코드를 작성할 것.
```

> 📌 **Tip**: `CLAUDE.md`가 너무 길어지면 에이전트가 규칙을 무시할 수 있으므로, 항상 핵심 정보만 압축해서 작성해야 합니다. 특정 시점에만 필요한 지식은 아래의 **Skills**로 이관합니다.

---

## 2. ⚡ .claude/skills/ (온디맨드 도메인 지식)

에이전트가 특정 작업을 수행할 때만 동적으로 불러오도록 하는 **기능별 가이드북**입니다. 불필요하게 컨텍스트를 낭비하지 않으면서 전문성을 부여합니다.

- **API Conventions Skill (`.claude/skills/api-conventions/SKILL.md`)**
  - **역할**: 새로운 API 엔드포인트를 만들 때 에이전트가 참고할 규칙 (예: URL kebab-case 사용, 모든 리스트 조회 API 페이징 처리 등).
- **Database Migration Skill (`.claude/skills/db-migration/SKILL.md`)**
  - **역할**: 마이그레이션 파일 작성 시 따라야 할 네이밍 룰 및 롤백 전략 가이드.

### 💡 Skill 파일 예시 (`.claude/skills/api-conventions/SKILL.md`)

```markdown
---
name: api-conventions
description: API 설계 및 구현에 관한 도메인 규칙
---

# REST API 개발 컨벤션

- 모든 URI는 복수형 명사를 사용하며 kebab-case를 준수합니다. (예: `/v1/user-profiles`)
- 에러 응답은 반드시 `{ "error": { "code": string, "message": string } }` 형식을 갖춰야 합니다.
- 데이터 생성 요청(POST)의 응답은 `201 Created`와 함께 생성된 리소스 오브젝트를 반환합니다.
```

---

## 3. 🤖 .claude/agents/ (맞춤형 서브에이전트)

복잡하고 많은 파일을 탐색해야 하거나 특수 목적의 정적 분석이 필요할 때, 메인 세션의 컨텍스트를 깨끗하게 유지한 채 분리 실행(Sandbox/Branch)하여 결과를 가져오는 **전담 서브에이전트**들입니다.

- **보안 리뷰어 (`security-reviewer.md`)**
  - **역할**: 구현된 코드의 Injection, 인증/인가 우회, 비밀키 유출 여부를 정적 검사.
- **성능/리팩토링 분석가 (`perf-analyst.md`)**
  - **역할**: 시간 복잡도가 높거나 메모리 누수가 의심되는 패턴을 코드베이스 전체에서 Grep하여 리포트.

### 💡 Agent 파일 예시 (`.claude/agents/security-reviewer.md`)

```markdown
---
name: security-reviewer
description: 작성된 코드의 보안 취약점을 검사하는 에이전트
tools: Read, Grep, Glob, Bash
model: opus
---

당신은 시니어 보안 엔지니어입니다. 주어진 변경 사항에 대해 다음 항목을 집중 리뷰해 주세요.

1. SQL Injection, XSS, OS Command Injection 취약점 존재 여부
2. 하드코딩된 API Key 또는 비밀번호 존재 여부
3. 데이터 노출 취약점 및 부적절한 권한 검증 흐름

보안 취약점이 발견된 경우, 수정이 필요한 파일명, 라인 수 및 구체적인 패치 가이드를 markdown 표 형식으로 제안해 주세요.
```

---

## 4. 🪝 자동화 훅 (Automation Hooks)

에이전트가 파일을 생성하거나 수정(Write/Edit)한 직후 사용자의 명시적 개입 없이 자동으로 실행되는 백그라운드 태스크를 바인딩합니다. `.claude/settings.json` 파일에 구성합니다.

### 💡 settings.json 예시

```json
{
  "hooks": {
    "post-edit": "npm run lint -- --fix",
    "post-write": "prettier --write"
  },
  "permissions": {
    "allowedCommands": ["npm run lint", "npm test"]
  }
}
```

- **효과**: 에이전트가 코드를 변경하자마자 자동으로 스타일 포맷팅 및 문법 검사를 수행하므로, 코드가 꼬여서 발생하는 컴파일 에러나 피드백 지연을 원천 차단합니다.

---

## 5. 🧪 자율 검증 인프라 (Self-Verification Harness)

Claude Code가 스스로 테스트를 작성하고 결과를 보며 디버깅할 수 있도록 돕는 **가장 중요한 장치**입니다.

1.  **결과 예측 기반 테스트 케이스 작성 유도**:
    - 프롬프트 가이드라인에 "수정 전 테스트 코드를 먼저 실행하고, 성공 기준 케이스(Happy Path)와 실패 케이스(Edge Case)를 포함하는 테스트를 보강하라"고 명시합니다.
2.  **Mocking 및 로컬 실행 환경 준비**:
    - 외부 네트워크를 탈 수 없는 환경이거나 Rate Limit이 걸릴 수 있는 API의 경우, 에이전트가 로컬에서 마음껏 호출해 볼 수 있는 Mock 서버나 Stub 인터페이스를 테스트 폴더 내에 배치합니다.
3.  **Visual Regression (UI 변경의 경우)**:
    - Chrome Extension 등을 통해 테스트 화면을 캡처하고 원본과 비교해 스스로 차이점을 분석하고 고치도록 테스트 가이드를 셋업합니다.
