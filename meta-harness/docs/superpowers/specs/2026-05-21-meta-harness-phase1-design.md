# Phase 1 설계: meta-harness 로컬 파이프라인

**상태:** APPROVED  
**작성일:** 2026-05-21  
**범위:** Phase 1 — 로컬 로그 수집 + PII 마스킹 (Langfuse 제외)

---

## 1. 개요

Claude Code 로컬 대화 로그를 주기적으로 수집·마스킹하여 로컬 JSONL 파일로 저장하는 파이프라인. 단일 개발자(솔로) 환경을 대상으로 하며, Langfuse 연동은 Phase 2에서 추가한다.

**목표:**
- `~/.claude/projects/**/*.jsonl` 에서 신규 항목만 증분 수집
- API 키·경로·이메일 등 PII 마스킹
- `meta-harness/harvested/YYYY-MM-DD.jsonl` 로 저장
- Windows Task Scheduler로 15분마다 자동 실행

**명시적 범위 제외:**
- Langfuse 전송 (Phase 2)
- 팀 다중 사용자 지원 (Phase 5)
- 대화 의미 분석·마이닝 (Phase 3)

---

## 2. 아키텍처

### 데이터 흐름

```
~/.claude/projects/**/*.jsonl
        │
        ▼
   poller.py  ─── cursor.json (마지막 처리 위치)
        │
        ▼
   masker.py  (정규식 PII 마스킹)
        │
        ▼
harvested/YYYY-MM-DD.jsonl
        │
        ▼
Windows Task Scheduler (15분 주기)
```

### 파일 구조

```
meta-harness/
├── harvester/
│   ├── harvest.py        # 메인 실행 진입점
│   ├── poller.py         # JSONL 읽기 + cursor 관리
│   ├── masker.py         # PII 마스킹 로직
│   └── cursor.json       # 마지막 처리 위치 상태 (자동 생성)
├── harvested/
│   └── YYYY-MM-DD.jsonl  # 마스킹된 출력 (날짜별)
└── docs/
    └── superpowers/specs/
        └── 2026-05-21-meta-harness-phase1-design.md
```

---

## 3. 컴포넌트 상세

### poller.py

- `~/.claude/projects/` 하위 모든 `*.jsonl` 파일을 재귀 탐색
- `cursor.json` 에 파일별 마지막 처리 줄 번호(line offset)를 저장
- 실행 시 cursor 이후 신규 라인만 읽어 반환
- Claude Code JSONL 스키마: 각 줄은 독립 JSON 객체

  주요 필드:
  ```json
  {
    "type": "user" | "assistant" | "file-history-snapshot" | ...,
    "message": { "role": "user", "content": "..." },
    "parentUuid": "...",
    "promptId": "..."
  }
  ```
- `type: "file-history-snapshot"` 등 메타 이벤트는 수집에서 제외

### masker.py

정규식 기반 마스킹. 대상:

| 패턴 | 대체값 |
|------|--------|
| `sk-ant-[A-Za-z0-9\-_]{20,}` | `[MASKED:API_KEY]` |
| `sk-[A-Za-z0-9]{20,}` | `[MASKED:API_KEY]` |
| `Bearer [A-Za-z0-9\-._~+/]+=*` | `[MASKED:BEARER_TOKEN]` |
| Windows 절대 경로 `C:\Users\...` | `[MASKED:PATH]` |
| 이메일 주소 | `[MASKED:EMAIL]` |
| `password\s*[:=]\s*\S+` (대소문자 무관) | `[MASKED:PASSWORD]` |

마스킹은 `message.content` 문자열에만 적용. 구조 필드(`type`, `promptId` 등)는 유지.

### harvest.py

```
harvest.py 실행
  → poller.py: 신규 라인 수집
  → masker.py: 각 항목 마스킹
  → harvested/YYYY-MM-DD.jsonl 에 append
  → cursor.json 업데이트
  → 수집 건수 콘솔 출력
```

CLI 옵션:
- `--dry-run`: 저장하지 않고 콘솔 출력만
- `--since <ISO date>`: 특정 날짜 이후 항목만 (cursor 무시)

### cursor.json 형식

```json
{
  "C:\\Users\\acrof\\.claude\\projects\\C--Users-acrof-DEV\\abc.jsonl": 142,
  "C:\\Users\\acrof\\.claude\\projects\\...\\def.jsonl": 37
}
```

값은 해당 파일에서 마지막으로 처리한 줄 번호(0-indexed).

---

## 4. 스케줄링

Windows Task Scheduler:
- **트리거:** 15분마다 반복
- **실행:** `python C:\Users\acrof\DEV\meta-harness\harvester\harvest.py`
- **로그:** Task Scheduler 기본 이벤트 로그 활용

설정은 `harvester/schedule-setup.md` 에 단계별 안내 작성 예정.

---

## 5. 오류 처리

- JSONL 파싱 실패: 해당 줄 건너뛰고 `harvested/errors.log` 에 기록
- 파일 접근 권한 오류: 콘솔 경고 출력 후 계속 진행
- cursor.json 손상: 전체 재수집(full rescan) 후 재생성

---

## 6. 검증 계획

1. **마스킹 단위 테스트:** 알려진 API 키·경로·이메일이 포함된 픽스처 문자열 → 100% 마스킹 확인
2. **증분 수집 테스트:** 픽스처 JSONL에 라인 추가 → cursor 이동 후 신규 항목만 수집되는지 확인
3. **엔드투엔드:** 실제 `~/.claude/projects/` 대상으로 `--dry-run` 실행 → 출력 육안 검토
