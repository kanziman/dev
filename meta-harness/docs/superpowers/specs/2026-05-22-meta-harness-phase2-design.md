# Phase 2 설계: meta-harness FastAPI 서버 & 대시보드 MVP

**상태:** APPROVED  
**작성일:** 2026-05-22  
**범위:** Phase 2 — FastAPI 통계 API + Langfuse Cloud 연동 (비개발자 피드백 UI는 Phase 3)

---

## 1. 개요

Phase 1에서 구축한 로컬 JSONL 수집 파이프라인 위에 FastAPI 서버와 Next.js 대시보드를 추가한다. 팀 2~5명이 각자 로컬에서 실행하며, 공용 서버 배포는 Phase 5에서 다룬다.

**목표:**
- harvested/*.jsonl를 집계하는 통계 REST API 제공
- 수집된 트레이스를 Langfuse Cloud로 push
- Next.js 대시보드에서 수집 현황 시각화
- Mac/Windows 크로스플랫폼 지원

**명시적 범위 제외:**
- 비개발자 피드백 입력 UI (Phase 3)
- 팀 공용 서버 배포 (Phase 5)
- 대화 의미 분석·마이닝 (Phase 3)
- Langfuse Docker 셀프호스팅 (팀 서버 확보 후)

---

## 2. 아키텍처

### 데이터 흐름

```
~/.claude/projects/**/*.jsonl
        │
        ▼
  APScheduler (15분 주기)
  — harvester/harvest.py 호출
        │
        ▼
harvested/YYYY-MM-DD.jsonl
        │
        ├─────────────────────────────────────┐
        │  stats.py (직접 집계)               │  langfuse_push.py
        ▼                                     ▼
  GET /api/stats/*                     Langfuse Cloud
        │                                     │
        ▼                                     │  Langfuse API proxy
  Next.js 대시보드 (localhost:3000)  ←────────┘
  GET /api/traces/recent
```

### 파일 구조

```
meta-harness/
├── harvester/              (Phase 1 기존, 변경 없음)
│   ├── harvest.py
│   ├── poller.py
│   ├── masker.py
│   └── cursor.json
├── harvested/              (Phase 1 기존, 변경 없음)
│   └── YYYY-MM-DD.jsonl
├── api/                    (Phase 2 신규)
│   ├── server.py           # FastAPI 앱 + APScheduler 진입점
│   ├── stats.py            # harvested JSONL 집계 로직
│   ├── langfuse_push.py    # Langfuse SDK 연동 + push
│   ├── cursor_lf.json      # Langfuse push 전용 cursor (자동 생성)
│   ├── .env.example        # 환경변수 템플릿
│   └── requirements.txt
└── dashboard-ui/           (Phase 2 신규, Next.js)
    ├── src/app/
    │   ├── page.tsx         # Overview
    │   ├── stats/page.tsx   # 통계 차트
    │   └── traces/page.tsx  # 트레이스 목록
    └── package.json
```

---

## 3. FastAPI 서버 (api/server.py)

### APScheduler 통합

Phase 1의 Windows Task Scheduler를 대체한다. 서버 시작 시 15분 주기 잡을 등록하여 Mac/Windows 동일하게 동작한다.

```python
# 서버 시작 시 등록
scheduler.add_job(run_harvest, "interval", minutes=15)
scheduler.add_job(run_langfuse_push, "interval", minutes=15)
```

Phase 1 Task Scheduler 설정은 그대로 유지해도 무방하나, Phase 2 서버 실행 시에는 불필요하다.

### REST API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| `GET` | `/api/stats/overview` | 총 메시지 수, 활성 프로젝트 수, 마지막 수집 시각 |
| `GET` | `/api/stats/daily` | 날짜별 수집 항목 수 (7일, 30일) |
| `GET` | `/api/stats/top-projects` | 프로젝트(디렉토리)별 메시지 수 상위 목록 |
| `GET` | `/api/traces/recent` | Langfuse API를 통한 최근 세션 목록 |
| `POST` | `/api/ingest` | 수동 트리거 — 새 harvested 항목을 즉시 Langfuse push |

---

## 4. Langfuse 연동 (api/langfuse_push.py)

### 설치 방식

- **Phase 2:** Langfuse Cloud (langfuse.com) — API 키 발급 후 환경변수로 주입
- **마이그레이션 경로:** 팀 서버 확보 시 Docker 셀프호스팅으로 전환. FastAPI의 `LANGFUSE_HOST` 환경변수만 바꾸면 됨 (코드 변경 없음)

```bash
# .env (Mac/Windows 공통)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # 셀프호스팅 시 변경
```

### harvested JSONL → Langfuse 트레이스 매핑

`promptId` 기준으로 대화 세션 하나를 Trace 하나로 묶는다. `cursor_lf.json`이 파일별 마지막 push 줄 번호를 추적한다 (harvester의 `cursor.json`과 동일한 구조, 별도 파일).

```python
# 세션(promptId) → Trace
trace = langfuse.trace(
    name="claude-session",
    id=entry["promptId"],
    metadata={"project": project_name, "date": date}
)
# 메시지(user/assistant) → Span
trace.span(
    name=entry["type"],
    input=entry["message"]["content"][:500],  # 500자 트림
)
```

---

## 5. 경로 마스킹 크로스플랫폼 보완

Phase 1 masker.py에 Mac/Linux 경로 패턴을 추가한다.

| 추가 패턴 | 대체값 |
|-----------|--------|
| `/Users/[^/\s]+/` (Mac 홈) | `[MASKED:PATH]` |
| `/home/[^/\s]+/` (Linux 홈) | `[MASKED:PATH]` |

기존 `C:\Users\...` 패턴은 유지.

---

## 6. Next.js 대시보드 (dashboard-ui/)

### 페이지 구성

| 경로 | 내용 |
|------|------|
| `/` | Overview: 총 메시지 수, 활성 프로젝트 수, 마지막 수집 시각 |
| `/stats` | 날짜별 수집량 바차트, 프로젝트별 활동량 목록 |
| `/traces` | 최근 세션 목록, 클릭 시 Langfuse Cloud 상세 페이지 링크 |

### 기술 스택

- Next.js App Router
- Tailwind CSS
- Recharts (차트)
- `fetch`로 FastAPI `localhost:8000` 호출

---

## 7. 실행 방법 (크로스플랫폼)

```bash
# 터미널 1 — FastAPI 서버 (Mac/Windows 동일)
cd meta-harness/api
pip install -r requirements.txt
cp .env.example .env        # Langfuse 키 입력
python server.py            # localhost:8000, APScheduler 내장

# 터미널 2 — Next.js 대시보드 (Mac/Windows 동일)
cd meta-harness/dashboard-ui
pnpm install
pnpm dev                    # localhost:3000
```

---

## 8. 검증 계획

1. **통계 API 단위 테스트:** fixtures JSONL로 `/api/stats/overview`, `/api/stats/daily` 응답값 검증
2. **Langfuse push 통합 테스트:** dry-run 모드로 Langfuse SDK 호출 여부 확인 (실제 Cloud 전송 없이)
3. **APScheduler 동작 확인:** 서버 시작 후 15분 대기 없이 수동 `/api/ingest` 호출로 push 확인
4. **크로스플랫폼 smoke test:** Mac과 Windows 각각에서 `python server.py` + `pnpm dev` 정상 기동 확인
5. **엔드투엔드:** 실제 harvested JSONL → FastAPI 집계 → Next.js 대시보드 수치 표시 육안 확인
