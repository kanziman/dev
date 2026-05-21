# meta-harness Phase 1 — Local Log Harvester Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude Code 로컬 대화 로그를 주기적으로 수집·PII 마스킹하여 날짜별 로컬 JSONL 파일로 저장하는 Python 파이프라인을 구축한다.

**Architecture:** 세 모듈 파이프라인 — `poller.py`가 cursor 파일 기반으로 `~/.claude/projects/**/*.jsonl`에서 신규 항목만 증분 수집, `masker.py`가 정규식으로 PII 제거, `harvest.py`가 두 모듈을 연결하는 CLI 진입점. Windows Task Scheduler로 15분마다 자동 실행.

**Tech Stack:** Python 3.10+, 표준 라이브러리만 사용 (pathlib, re, json, argparse). 개발 의존성: pytest.

---

### Task 1: 프로젝트 구조 셋업

**Files:**
- Create: `harvester/__init__.py`
- Create: `harvester/requirements-dev.txt`
- Create: `tests/__init__.py`
- Create: `meta-harness/.gitignore`

- [ ] **Step 1: 디렉터리 및 파일 생성**

`meta-harness/` 에서 실행:
```bash
mkdir -p harvester harvested tests
touch harvester/__init__.py tests/__init__.py
```

- [ ] **Step 2: `harvester/requirements-dev.txt` 작성**

```
pytest==8.3.5
```

- [ ] **Step 3: `.gitignore` 작성**

`meta-harness/.gitignore`:
```
harvested/
harvester/cursor.json
__pycache__/
.pytest_cache/
*.pyc
```

- [ ] **Step 4: pytest 설치**

```bash
pip install -r harvester/requirements-dev.txt
```

Expected: `Successfully installed pytest-8.3.5` (이미 설치된 경우 "already satisfied")

- [ ] **Step 5: 커밋**

```bash
git add harvester/__init__.py tests/__init__.py harvester/requirements-dev.txt .gitignore
git commit -m "chore: scaffold meta-harness Phase 1 project structure"
```

---

### Task 2: PII Masker

**Files:**
- Create: `tests/test_masker.py`
- Create: `harvester/masker.py`

- [ ] **Step 1: `tests/test_masker.py` 작성 (실패 테스트 먼저)**

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / 'harvester'))

from masker import mask_text, mask_entry


def test_masks_anthropic_api_key():
    result = mask_text('key is sk-ant-api03-abcdefghijklmnopqrst')
    assert '[MASKED:API_KEY]' in result
    assert 'sk-ant' not in result


def test_masks_openai_style_api_key():
    result = mask_text('key sk-aBcDeFgHiJkLmNoPqRsT1234')
    assert '[MASKED:API_KEY]' in result
    assert 'sk-' not in result


def test_masks_windows_path():
    result = mask_text(r'file at C:\Users\acrof\DEV\secret.py')
    assert '[MASKED:PATH]' in result
    assert 'acrof' not in result


def test_masks_email():
    result = mask_text('contact user@example.com for info')
    assert '[MASKED:EMAIL]' in result
    assert 'user@example.com' not in result


def test_masks_bearer_token():
    result = mask_text('Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    assert '[MASKED:BEARER_TOKEN]' in result
    assert 'eyJ' not in result


def test_masks_password_field():
    result = mask_text('password: mysecret123')
    assert '[MASKED:PASSWORD]' in result
    assert 'mysecret123' not in result


def test_safe_text_unchanged():
    text = 'hello world, this is a normal message about Python'
    assert mask_text(text) == text


def test_mask_entry_applies_to_string_content():
    entry = {
        'type': 'user',
        'message': {'role': 'user', 'content': 'my key is sk-ant-api03-abcdefghijklmnopqrst'},
    }
    result = mask_entry(entry)
    assert '[MASKED:API_KEY]' in result['message']['content']
    assert result['type'] == 'user'
    assert result['message']['role'] == 'user'


def test_mask_entry_applies_to_list_content_text_blocks():
    entry = {
        'type': 'assistant',
        'message': {
            'role': 'assistant',
            'content': [
                {'type': 'text', 'text': 'use key sk-ant-api03-abcdefghijklmnopqrst here'},
                {'type': 'tool_use', 'id': 'tool1', 'name': 'Bash', 'input': {'command': 'ls'}},
            ],
        },
    }
    result = mask_entry(entry)
    blocks = result['message']['content']
    assert '[MASKED:API_KEY]' in blocks[0]['text']
    assert blocks[1] == {'type': 'tool_use', 'id': 'tool1', 'name': 'Bash', 'input': {'command': 'ls'}}


def test_mask_entry_skips_entries_without_message():
    entry = {'type': 'file-history-snapshot', 'data': 'something'}
    result = mask_entry(entry)
    assert result == entry
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd meta-harness && pytest tests/test_masker.py -v
```

Expected: `ModuleNotFoundError: No module named 'masker'`

- [ ] **Step 3: `harvester/masker.py` 구현**

```python
import re
from typing import Any

_PATTERNS = [
    (re.compile(r'sk-ant-[A-Za-z0-9\-_]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'sk-[A-Za-z0-9]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'Bearer [A-Za-z0-9\-._~+/]+=*'), '[MASKED:BEARER_TOKEN]'),
    (re.compile(r'[Cc]:\\[Uu]sers\\[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'/[Uu]sers/[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'), '[MASKED:EMAIL]'),
    (re.compile(r'(?i)password\s*[:=]\s*\S+'), '[MASKED:PASSWORD]'),
]


def mask_text(text: str) -> str:
    for pattern, replacement in _PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def _mask_content(content: Any) -> Any:
    if isinstance(content, str):
        return mask_text(content)
    if isinstance(content, list):
        result = []
        for block in content:
            if isinstance(block, dict) and block.get('type') == 'text' and 'text' in block:
                block = {**block, 'text': mask_text(block['text'])}
            result.append(block)
        return result
    return content


def mask_entry(entry: dict) -> dict:
    if 'message' not in entry:
        return entry
    msg = entry['message']
    if 'content' not in msg:
        return entry
    return {**entry, 'message': {**msg, 'content': _mask_content(msg['content'])}}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd meta-harness && pytest tests/test_masker.py -v
```

Expected: 10개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add harvester/masker.py tests/test_masker.py
git commit -m "feat: add PII masker with regex patterns"
```

---

### Task 3: JSONL Poller (cursor 기반 증분 수집)

**Files:**
- Create: `tests/test_poller.py`
- Create: `harvester/poller.py`

- [ ] **Step 1: `tests/test_poller.py` 작성 (실패 테스트 먼저)**

```python
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / 'harvester'))

import poller as poller_module
from poller import poll_new_entries


def write_jsonl(path: Path, entries: list) -> None:
    path.write_text(
        '\n'.join(json.dumps(e) for e in entries) + '\n', encoding='utf-8'
    )


@pytest.fixture
def fake_projects(tmp_path, monkeypatch):
    monkeypatch.setattr(poller_module, 'CLAUDE_PROJECTS_DIR', tmp_path)
    return tmp_path


def test_returns_only_user_and_assistant_entries(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'file-history-snapshot', 'data': 'meta'},
        {'type': 'user', 'message': {'role': 'user', 'content': 'hello'}},
        {'type': 'assistant', 'message': {'role': 'assistant', 'content': 'hi'}},
    ])
    cursor = tmp_path / 'cursor.json'
    entries = poll_new_entries(cursor)
    assert len(entries) == 2
    assert entries[0]['type'] == 'user'
    assert entries[1]['type'] == 'assistant'


def test_cursor_advances_on_second_poll(fake_projects, tmp_path):
    log = fake_projects / 'session.jsonl'
    write_jsonl(log, [
        {'type': 'user', 'message': {'role': 'user', 'content': 'first'}},
    ])
    cursor = tmp_path / 'cursor.json'

    first = poll_new_entries(cursor)
    assert len(first) == 1

    with log.open('a', encoding='utf-8') as f:
        f.write(json.dumps({'type': 'user', 'message': {'role': 'user', 'content': 'second'}}) + '\n')

    second = poll_new_entries(cursor)
    assert len(second) == 1
    assert second[0]['message']['content'] == 'second'


def test_no_entries_when_caught_up(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'hello'}},
    ])
    cursor = tmp_path / 'cursor.json'
    poll_new_entries(cursor)
    second = poll_new_entries(cursor)
    assert second == []


def test_skips_malformed_lines(fake_projects, tmp_path):
    log = fake_projects / 'session.jsonl'
    log.write_text(
        'not json\n'
        + json.dumps({'type': 'user', 'message': {'role': 'user', 'content': 'ok'}}) + '\n',
        encoding='utf-8',
    )
    cursor = tmp_path / 'cursor.json'
    entries = poll_new_entries(cursor)
    assert len(entries) == 1
    assert entries[0]['message']['content'] == 'ok'


def test_handles_multiple_jsonl_files(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'a.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'from a'}},
    ])
    write_jsonl(fake_projects / 'b.jsonl', [
        {'type': 'assistant', 'message': {'role': 'assistant', 'content': 'from b'}},
    ])
    cursor = tmp_path / 'cursor.json'
    entries = poll_new_entries(cursor)
    assert len(entries) == 2


def test_corrupted_cursor_triggers_full_rescan(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'hello'}},
    ])
    cursor = tmp_path / 'cursor.json'
    cursor.write_text('not valid json', encoding='utf-8')

    entries = poll_new_entries(cursor)
    assert len(entries) == 1
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd meta-harness && pytest tests/test_poller.py -v
```

Expected: `ModuleNotFoundError: No module named 'poller'`

- [ ] **Step 3: `harvester/poller.py` 구현**

```python
import json
from pathlib import Path

CLAUDE_PROJECTS_DIR = Path.home() / '.claude' / 'projects'
_COLLECT_TYPES = {'user', 'assistant'}


def _load_cursor(cursor_path: Path) -> dict:
    if cursor_path.exists():
        try:
            return json.loads(cursor_path.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_cursor(cursor_path: Path, cursor: dict) -> None:
    cursor_path.write_text(json.dumps(cursor, indent=2), encoding='utf-8')


def poll_new_entries(cursor_path: Path) -> list[dict]:
    cursor = _load_cursor(cursor_path)
    new_cursor: dict[str, int] = {}
    entries: list[dict] = []

    jsonl_files = (
        sorted(CLAUDE_PROJECTS_DIR.rglob('*.jsonl'))
        if CLAUDE_PROJECTS_DIR.exists()
        else []
    )

    for jsonl_file in jsonl_files:
        file_key = str(jsonl_file)
        start_line = cursor.get(file_key, 0)

        try:
            lines = jsonl_file.read_text(encoding='utf-8', errors='replace').splitlines()
        except OSError:
            new_cursor[file_key] = cursor.get(file_key, 0)
            continue

        for line in lines[start_line:]:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if entry.get('type') in _COLLECT_TYPES:
                entries.append(entry)

        new_cursor[file_key] = len(lines)

    _save_cursor(cursor_path, new_cursor)
    return entries
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
cd meta-harness && pytest tests/test_poller.py -v
```

Expected: 6개 테스트 모두 PASS

- [ ] **Step 5: 커밋**

```bash
git add harvester/poller.py tests/test_poller.py
git commit -m "feat: add JSONL poller with cursor-based incremental reads"
```

---

### Task 4: harvest.py — CLI 진입점

**Files:**
- Create: `tests/test_harvest.py`
- Create: `harvester/harvest.py`

- [ ] **Step 1: `tests/test_harvest.py` 작성 (실패 테스트 먼저)**

```python
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent / 'harvester'))

import poller as poller_module
from harvest import harvest


@pytest.fixture
def fake_projects(tmp_path, monkeypatch):
    monkeypatch.setattr(poller_module, 'CLAUDE_PROJECTS_DIR', tmp_path)
    return tmp_path


def write_jsonl(path: Path, entries: list) -> None:
    path.write_text(
        '\n'.join(json.dumps(e) for e in entries) + '\n', encoding='utf-8'
    )


def test_dry_run_prints_without_saving(fake_projects, tmp_path, capsys):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'hello world'}},
    ])
    cursor = tmp_path / 'cursor.json'
    harvested_dir = tmp_path / 'out'

    count = harvest(cursor_path=cursor, harvested_dir=harvested_dir, dry_run=True)

    assert count == 1
    assert not harvested_dir.exists()
    out = capsys.readouterr().out
    assert 'hello world' in out
    assert 'dry-run' in out


def test_saves_entries_to_daily_jsonl(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'hello'}},
        {'type': 'assistant', 'message': {'role': 'assistant', 'content': 'hi'}},
    ])
    cursor = tmp_path / 'cursor.json'
    harvested_dir = tmp_path / 'out'

    count = harvest(cursor_path=cursor, harvested_dir=harvested_dir, dry_run=False)

    assert count == 2
    output_files = list(harvested_dir.glob('*.jsonl'))
    assert len(output_files) == 1
    lines = output_files[0].read_text(encoding='utf-8').strip().splitlines()
    assert len(lines) == 2


def test_masks_pii_before_saving(fake_projects, tmp_path):
    write_jsonl(fake_projects / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'key sk-ant-api03-abcdefghijklmnopqrst'}},
    ])
    cursor = tmp_path / 'cursor.json'
    harvested_dir = tmp_path / 'out'

    harvest(cursor_path=cursor, harvested_dir=harvested_dir, dry_run=False)

    output_file = next(harvested_dir.glob('*.jsonl'))
    saved = json.loads(output_file.read_text(encoding='utf-8').strip())
    assert '[MASKED:API_KEY]' in saved['message']['content']
    assert 'sk-ant' not in saved['message']['content']


def test_returns_zero_when_no_new_entries(fake_projects, tmp_path, capsys):
    cursor = tmp_path / 'cursor.json'
    harvested_dir = tmp_path / 'out'
    count = harvest(cursor_path=cursor, harvested_dir=harvested_dir, dry_run=False)
    assert count == 0
    assert 'No new entries' in capsys.readouterr().out
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd meta-harness && pytest tests/test_harvest.py -v
```

Expected: `ModuleNotFoundError: No module named 'harvest'`

- [ ] **Step 3: `harvester/harvest.py` 구현**

```python
#!/usr/bin/env python3
import argparse
import json
import sys
from datetime import date
from pathlib import Path

_HERE = Path(__file__).parent
sys.path.insert(0, str(_HERE))

from masker import mask_entry
from poller import poll_new_entries

_DEFAULT_CURSOR = _HERE / 'cursor.json'
_DEFAULT_HARVESTED = _HERE.parent / 'harvested'


def harvest(
    cursor_path: Path = _DEFAULT_CURSOR,
    harvested_dir: Path = _DEFAULT_HARVESTED,
    dry_run: bool = False,
) -> int:
    entries = poll_new_entries(cursor_path)
    masked = [mask_entry(e) for e in entries]

    if not masked:
        print('No new entries.')
        return 0

    if dry_run:
        for entry in masked:
            print(json.dumps(entry, ensure_ascii=False))
        print(f'\n[dry-run] Would save {len(masked)} entries.')
        return len(masked)

    harvested_dir.mkdir(parents=True, exist_ok=True)
    output_path = harvested_dir / f'{date.today().isoformat()}.jsonl'
    with output_path.open('a', encoding='utf-8') as f:
        for entry in masked:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')

    print(f'Harvested {len(masked)} entries → {output_path}')
    return len(masked)


def main() -> None:
    parser = argparse.ArgumentParser(description='Harvest Claude Code logs')
    parser.add_argument('--dry-run', action='store_true', help='Print without saving')
    args = parser.parse_args()
    harvest(dry_run=args.dry_run)


if __name__ == '__main__':
    main()
```

- [ ] **Step 4: 전체 테스트 통과 확인**

```bash
cd meta-harness && pytest tests/ -v
```

Expected: 전체 테스트 PASS (10 masker + 6 poller + 4 harvest = 20개)

- [ ] **Step 5: 실제 로그 대상 smoke test**

```bash
cd meta-harness && python harvester/harvest.py --dry-run
```

Expected: `~/.claude/projects/` 의 신규 항목들이 콘솔에 출력되고 PII가 마스킹됨. `harvested/` 폴더 미생성.

- [ ] **Step 6: 커밋**

```bash
git add harvester/harvest.py tests/test_harvest.py
git commit -m "feat: add harvest.py CLI wiring poller and masker"
```

---

### Task 5: Windows Task Scheduler 설정

**Files:**
- Create: `harvester/schedule-setup.md`

- [ ] **Step 1: `harvester/schedule-setup.md` 작성**

```markdown
# Windows Task Scheduler 설정

## 사전 조건

Python 경로 확인:
```powershell
(Get-Command python).Source
```
예: `C:\Python312\python.exe`

## 작업 등록 (PowerShell)

경로를 실제 환경에 맞게 수정 후 실행:

```powershell
$pythonExe  = (Get-Command python).Source
$scriptPath = "C:\Users\acrof\DEV\meta-harness\harvester\harvest.py"
$workDir    = "C:\Users\acrof\DEV\meta-harness"

$action  = New-ScheduledTaskAction -Execute $pythonExe -Argument $scriptPath -WorkingDirectory $workDir
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 15) -Once -At (Get-Date)

Register-ScheduledTask `
  -TaskName "meta-harness-harvester" `
  -Action $action `
  -Trigger $trigger `
  -Description "Claude Code log harvester — runs every 15 minutes"
```

## 확인

```powershell
Get-ScheduledTask -TaskName "meta-harness-harvester" | Select-Object TaskName, State
```

## 수동 실행 테스트

```powershell
Start-ScheduledTask -TaskName "meta-harness-harvester"
Start-Sleep -Seconds 3
Get-ChildItem C:\Users\acrof\DEV\meta-harness\harvested\
```

오늘 날짜 `.jsonl` 파일이 보이면 정상.

## 제거

```powershell
Unregister-ScheduledTask -TaskName "meta-harness-harvester" -Confirm:$false
```
```

- [ ] **Step 2: Task Scheduler 등록**

PowerShell에서 `schedule-setup.md`의 "작업 등록" 명령 실행.

Expected:
```
TaskName                          : meta-harness-harvester
State                             : Ready
```

- [ ] **Step 3: 수동 실행으로 end-to-end 검증**

```powershell
Start-ScheduledTask -TaskName "meta-harness-harvester"
Start-Sleep -Seconds 3
Get-ChildItem C:\Users\acrof\DEV\meta-harness\harvested\
```

Expected: `YYYY-MM-DD.jsonl` 파일이 생성됨.

- [ ] **Step 4: 커밋**

```bash
git add harvester/schedule-setup.md
git commit -m "docs: add Windows Task Scheduler setup guide"
```
