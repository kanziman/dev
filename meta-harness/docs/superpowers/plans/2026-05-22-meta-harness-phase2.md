# meta-harness Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a FastAPI statistics server with Langfuse Cloud integration and a Next.js dashboard (copied from `dashboard/`) that shows Claude agent activity metrics.

**Architecture:** FastAPI hub model — reads `harvested/*.jsonl`, exposes REST stats endpoints, pushes traces to Langfuse Cloud via APScheduler every 15 minutes. APScheduler replaces Windows Task Scheduler for cross-platform (Mac/Windows) compatibility. Next.js dashboard-ui calls FastAPI for data.

**Tech Stack:** Python 3.11+, FastAPI, APScheduler, Langfuse Python SDK, python-dotenv, pytest; Next.js 16 App Router, Tailwind CSS, Recharts.

---

## File Map

**Modify:**
- `meta-harness/harvester/masker.py` — add `/home/` Linux path pattern
- `meta-harness/harvester/poller.py` — add `_meta.project` field to each entry
- `meta-harness/tests/test_masker.py` — add Linux path test
- `meta-harness/tests/test_poller.py` — add `_meta` field test

**Create:**
- `meta-harness/api/requirements.txt`
- `meta-harness/api/.env.example`
- `meta-harness/api/stats.py`
- `meta-harness/api/langfuse_push.py`
- `meta-harness/api/server.py`
- `meta-harness/tests/api/__init__.py`
- `meta-harness/tests/api/test_stats.py`
- `meta-harness/tests/api/test_langfuse_push.py`
- `meta-harness/tests/api/test_server.py`
- `meta-harness/dashboard-ui/` (copied from `dashboard/`, then modified)
- `meta-harness/dashboard-ui/src/app/stats/page.tsx`
- `meta-harness/dashboard-ui/src/app/traces/page.tsx`
- `meta-harness/dashboard-ui/.env.local`

**Replace:**
- `meta-harness/dashboard-ui/src/app/page.tsx` — Overview page
- `meta-harness/dashboard-ui/src/app/layout.tsx` — add nav links
- `meta-harness/dashboard-ui/src/components/Layout/TopNavigation.tsx` — update branding
- `meta-harness/dashboard-ui/package.json` — name + recharts + port 3001

---

## Task 1: Add Linux `/home/` path masking

**Files:**
- Modify: `meta-harness/harvester/masker.py`
- Modify: `meta-harness/tests/test_masker.py`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `meta-harness/tests/test_masker.py`:

```python
def test_masks_linux_home_path():
    result = mask_text('/home/johndoe/projects/secret.py')
    assert '[MASKED:PATH]' in result
    assert 'johndoe' not in result
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd meta-harness
pytest tests/test_masker.py::test_masks_linux_home_path -v
```

Expected: FAIL — `johndoe` is not masked yet.

- [ ] **Step 3: Add `/home/` pattern to masker.py**

Replace the full `_PATTERNS` list in `meta-harness/harvester/masker.py`:

```python
_PATTERNS = [
    (re.compile(r'sk-ant-[A-Za-z0-9\-_]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'sk-[A-Za-z0-9]{20,}'), '[MASKED:API_KEY]'),
    (re.compile(r'Bearer [A-Za-z0-9\-._~+/]+=*'), '[MASKED:BEARER_TOKEN]'),
    (re.compile(r'[Cc]:\\[Uu]sers\\[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'/[Uu]sers/[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'/home/[^\s"\'<>|*?\r\n]+'), '[MASKED:PATH]'),
    (re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'), '[MASKED:EMAIL]'),
    (re.compile(r'(?i)password\s*[:=]\s*\S{1,500}'), '[MASKED:PASSWORD]'),
]
```

- [ ] **Step 4: Run all masker tests**

```bash
cd meta-harness
pytest tests/test_masker.py -v
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add meta-harness/harvester/masker.py meta-harness/tests/test_masker.py
git commit -m "feat: add Linux /home/ path masking for cross-platform support"
```

---

## Task 2: Add `_meta.project` to poller entries

**Files:**
- Modify: `meta-harness/harvester/poller.py`
- Modify: `meta-harness/tests/test_poller.py`

- [ ] **Step 1: Write the failing test**

Add to the bottom of `meta-harness/tests/test_poller.py`:

```python
def test_entries_include_meta_project(fake_projects, tmp_path):
    proj_dir = fake_projects / 'myproject'
    proj_dir.mkdir()
    write_jsonl(proj_dir / 'session.jsonl', [
        {'type': 'user', 'message': {'role': 'user', 'content': 'hi'}},
    ])
    cursor = tmp_path / 'cursor.json'
    entries = poll_new_entries(cursor)
    assert len(entries) == 1
    assert '_meta' in entries[0]
    assert entries[0]['_meta']['project'] == 'myproject'
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd meta-harness
pytest tests/test_poller.py::test_entries_include_meta_project -v
```

Expected: FAIL — `_meta` key not in entry.

- [ ] **Step 3: Update `poll_new_entries` in poller.py**

Replace the full `poll_new_entries` function in `meta-harness/harvester/poller.py`:

```python
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
        project = jsonl_file.parent.name

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
            if isinstance(entry, dict) and entry.get('type') in _COLLECT_TYPES:
                entries.append({**entry, '_meta': {'project': project}})

        new_cursor[file_key] = len(lines)

    _save_cursor(cursor_path, new_cursor)
    return entries
```

- [ ] **Step 4: Run all poller tests**

```bash
cd meta-harness
pytest tests/test_poller.py -v
```

Expected: all PASS (existing tests still pass — `_meta` is additive)

- [ ] **Step 5: Commit**

```bash
git add meta-harness/harvester/poller.py meta-harness/tests/test_poller.py
git commit -m "feat: add _meta.project field to poller entries for project-level stats"
```

---

## Task 3: Create `api/` scaffolding

**Files:**
- Create: `meta-harness/api/requirements.txt`
- Create: `meta-harness/api/.env.example`
- Create: `meta-harness/tests/api/__init__.py`

- [ ] **Step 1: Create requirements.txt**

Create `meta-harness/api/requirements.txt`:

```
fastapi>=0.115.0
uvicorn>=0.32.0
apscheduler>=3.10.4
langfuse>=2.20.0
python-dotenv>=1.0.0
httpx>=0.27.0
pytest>=8.3.5
```

- [ ] **Step 2: Create .env.example**

Create `meta-harness/api/.env.example`:

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key-here
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key-here
LANGFUSE_HOST=https://cloud.langfuse.com
```

- [ ] **Step 3: Install dependencies**

```bash
cd meta-harness/api
pip install -r requirements.txt
```

Expected: all packages installed without errors.

- [ ] **Step 4: Create tests/api/ directory**

```bash
# Mac/Linux
mkdir -p meta-harness/tests/api && touch meta-harness/tests/api/__init__.py

# Windows PowerShell
New-Item -ItemType Directory -Force meta-harness\tests\api
New-Item -ItemType File -Force meta-harness\tests\api\__init__.py
```

- [ ] **Step 5: Add api/.env to .gitignore**

Append to the root `.gitignore`:

```
meta-harness/api/.env
```

- [ ] **Step 6: Commit**

```bash
git add meta-harness/api/requirements.txt meta-harness/api/.env.example meta-harness/tests/api/__init__.py .gitignore
git commit -m "chore: scaffold api/ directory with requirements, env template, and test dir"
```

---

## Task 4: Implement `stats.py`

**Files:**
- Create: `meta-harness/api/stats.py`
- Create: `meta-harness/tests/api/test_stats.py`

- [ ] **Step 1: Write failing tests**

Create `meta-harness/tests/api/test_stats.py`:

```python
import json
import sys
from datetime import date, timedelta
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'api'))
import stats


def write_jsonl(path: Path, entries: list) -> None:
    path.write_text('\n'.join(json.dumps(e) for e in entries) + '\n', encoding='utf-8')


@pytest.fixture
def harvested(tmp_path):
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    write_jsonl(tmp_path / f'{today}.jsonl', [
        {'type': 'user', '_meta': {'project': 'proj-a'}, 'message': {'role': 'user', 'content': 'hello'}, 'promptId': 'p1'},
        {'type': 'assistant', '_meta': {'project': 'proj-a'}, 'message': {'role': 'assistant', 'content': 'hi'}, 'promptId': 'p1'},
        {'type': 'user', '_meta': {'project': 'proj-b'}, 'message': {'role': 'user', 'content': 'hey'}, 'promptId': 'p2'},
    ])
    write_jsonl(tmp_path / f'{yesterday}.jsonl', [
        {'type': 'user', '_meta': {'project': 'proj-a'}, 'message': {'role': 'user', 'content': 'old'}, 'promptId': 'p0'},
    ])
    return tmp_path


def test_overview_total_messages(harvested):
    result = stats.get_overview(harvested)
    assert result['total_messages'] == 4


def test_overview_active_projects(harvested):
    result = stats.get_overview(harvested)
    assert result['active_projects'] == 2


def test_overview_last_harvest_is_set(harvested):
    result = stats.get_overview(harvested)
    assert result['last_harvest'] is not None


def test_overview_empty_dir(tmp_path):
    result = stats.get_overview(tmp_path)
    assert result['total_messages'] == 0
    assert result['active_projects'] == 0
    assert result['last_harvest'] is None


def test_daily_returns_correct_day_count(harvested):
    result = stats.get_daily(harvested, days=7)
    assert len(result['days']) == 7


def test_daily_includes_today_count(harvested):
    result = stats.get_daily(harvested, days=7)
    today = date.today().isoformat()
    today_entry = next(d for d in result['days'] if d['date'] == today)
    assert today_entry['count'] == 3


def test_daily_fills_zeros_for_missing_dates(harvested):
    result = stats.get_daily(harvested, days=7)
    for d in result['days']:
        assert d['count'] >= 0


def test_top_projects_sorted_by_count(harvested):
    result = stats.get_top_projects(harvested)
    projects = result['projects']
    assert projects[0]['name'] == 'proj-a'
    assert projects[0]['count'] == 3
    assert projects[1]['name'] == 'proj-b'
    assert projects[1]['count'] == 1


def test_top_projects_respects_limit(harvested):
    result = stats.get_top_projects(harvested, limit=1)
    assert len(result['projects']) == 1
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd meta-harness
pytest tests/api/test_stats.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'stats'`

- [ ] **Step 3: Implement stats.py**

Create `meta-harness/api/stats.py`:

```python
import json
import os
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Generator, Optional, Tuple


def _iter_entries(harvested_dir: Path) -> Generator[Tuple[dict, str], None, None]:
    for f in sorted(harvested_dir.glob('*.jsonl')):
        try:
            text = f.read_text(encoding='utf-8')
        except OSError:
            continue
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(entry, dict):
                yield entry, f.stem


def get_overview(harvested_dir: Path) -> dict:
    total = 0
    projects: set[str] = set()

    for entry, _ in _iter_entries(harvested_dir):
        total += 1
        project = entry.get('_meta', {}).get('project', 'unknown')
        projects.add(project)

    last_harvest: Optional[str] = None
    files = sorted(harvested_dir.glob('*.jsonl'))
    if files:
        mtime = os.path.getmtime(files[-1])
        last_harvest = datetime.fromtimestamp(mtime).isoformat()

    return {
        'total_messages': total,
        'active_projects': len(projects),
        'last_harvest': last_harvest,
    }


def get_daily(harvested_dir: Path, days: int = 30) -> dict:
    counts: dict[str, int] = {}
    for f in harvested_dir.glob('*.jsonl'):
        try:
            lines = f.read_text(encoding='utf-8').splitlines()
        except OSError:
            continue
        counts[f.stem] = sum(1 for ln in lines if ln.strip())

    today = date.today()
    result = []
    for i in range(days - 1, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        result.append({'date': d, 'count': counts.get(d, 0)})
    return {'days': result}


def get_top_projects(harvested_dir: Path, limit: int = 10) -> dict:
    project_counts: dict[str, int] = {}
    for entry, _ in _iter_entries(harvested_dir):
        project = entry.get('_meta', {}).get('project', 'unknown')
        project_counts[project] = project_counts.get(project, 0) + 1

    sorted_projects = sorted(project_counts.items(), key=lambda x: x[1], reverse=True)
    return {
        'projects': [{'name': k, 'count': v} for k, v in sorted_projects[:limit]]
    }
```

- [ ] **Step 4: Run all stats tests**

```bash
cd meta-harness
pytest tests/api/test_stats.py -v
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add meta-harness/api/stats.py meta-harness/tests/api/test_stats.py
git commit -m "feat: implement stats.py with overview, daily, and top-projects aggregation"
```

---

## Task 5: Implement `langfuse_push.py`

**Files:**
- Create: `meta-harness/api/langfuse_push.py`
- Create: `meta-harness/tests/api/test_langfuse_push.py`

- [ ] **Step 1: Write failing tests**

Create `meta-harness/tests/api/test_langfuse_push.py`:

```python
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'api'))
import langfuse_push


def write_jsonl(path: Path, entries: list) -> None:
    path.write_text('\n'.join(json.dumps(e) for e in entries) + '\n', encoding='utf-8')


@pytest.fixture
def harvested(tmp_path):
    write_jsonl(tmp_path / '2026-05-22.jsonl', [
        {'type': 'user', '_meta': {'project': 'proj-a'}, 'message': {'role': 'user', 'content': 'hello'}, 'promptId': 'p1'},
        {'type': 'assistant', '_meta': {'project': 'proj-a'}, 'message': {'role': 'assistant', 'content': 'hi'}, 'promptId': 'p1'},
        {'type': 'user', '_meta': {'project': 'proj-b'}, 'message': {'role': 'user', 'content': 'hey'}, 'promptId': 'p2'},
    ])
    return tmp_path


def test_push_returns_entry_count(harvested, tmp_path):
    mock_client = MagicMock()
    cursor_path = tmp_path / 'cursor_lf.json'
    count = langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    assert count == 3


def test_push_calls_trace_per_prompt_id(harvested, tmp_path):
    mock_client = MagicMock()
    cursor_path = tmp_path / 'cursor_lf.json'
    langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    assert mock_client.trace.call_count == 2


def test_push_calls_flush(harvested, tmp_path):
    mock_client = MagicMock()
    cursor_path = tmp_path / 'cursor_lf.json'
    langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    mock_client.flush.assert_called_once()


def test_push_saves_cursor(harvested, tmp_path):
    mock_client = MagicMock()
    cursor_path = tmp_path / 'cursor_lf.json'
    langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    assert cursor_path.exists()
    cursor = json.loads(cursor_path.read_text())
    assert len(cursor) == 1


def test_push_skips_already_pushed_entries(harvested, tmp_path):
    mock_client = MagicMock()
    cursor_path = tmp_path / 'cursor_lf.json'
    langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    mock_client.reset_mock()
    count = langfuse_push.push_new_entries(harvested, cursor_path, client=mock_client)
    assert count == 0
    mock_client.trace.assert_not_called()


def test_dry_run_does_not_push_or_save_cursor(harvested, tmp_path):
    cursor_path = tmp_path / 'cursor_lf.json'
    count = langfuse_push.push_new_entries(harvested, cursor_path, dry_run=True)
    assert count == 3
    assert not cursor_path.exists()


def test_get_recent_traces_returns_list():
    mock_client = MagicMock()
    mock_trace = MagicMock()
    mock_trace.id = 'trace-1'
    mock_trace.name = 'claude-session'
    mock_trace.timestamp.isoformat.return_value = '2026-05-22T10:00:00'
    mock_trace.metadata = {'project': 'proj-a'}
    mock_client.fetch_traces.return_value.data = [mock_trace]

    with patch('langfuse_push._make_client', return_value=mock_client):
        result = langfuse_push.get_recent_traces(limit=5)

    assert result['traces'][0]['id'] == 'trace-1'
    assert result['traces'][0]['project'] == 'proj-a'
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd meta-harness
pytest tests/api/test_langfuse_push.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'langfuse_push'`

- [ ] **Step 3: Implement langfuse_push.py**

Create `meta-harness/api/langfuse_push.py`:

```python
import json
import os
from pathlib import Path


def _load_cursor(cursor_path: Path) -> dict:
    if cursor_path.exists():
        try:
            return json.loads(cursor_path.read_text(encoding='utf-8'))
        except (json.JSONDecodeError, OSError):
            return {}
    return {}


def _save_cursor(cursor_path: Path, cursor: dict) -> None:
    cursor_path.write_text(json.dumps(cursor, indent=2), encoding='utf-8')


def _make_client():
    from langfuse import Langfuse
    return Langfuse(
        public_key=os.environ['LANGFUSE_PUBLIC_KEY'],
        secret_key=os.environ['LANGFUSE_SECRET_KEY'],
        host=os.environ.get('LANGFUSE_HOST', 'https://cloud.langfuse.com'),
    )


def push_new_entries(
    harvested_dir: Path,
    cursor_path: Path,
    client=None,
    dry_run: bool = False,
) -> int:
    if client is None and not dry_run:
        client = _make_client()

    cursor = _load_cursor(cursor_path)
    new_cursor = dict(cursor)
    total_pushed = 0

    for f in sorted(harvested_dir.glob('*.jsonl')):
        file_key = str(f)
        start_line = cursor.get(file_key, 0)

        try:
            lines = f.read_text(encoding='utf-8').splitlines()
        except OSError:
            continue

        new_entries = []
        for line in lines[start_line:]:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(entry, dict):
                new_entries.append(entry)

        if not new_entries:
            new_cursor[file_key] = len(lines)
            continue

        if not dry_run:
            traces: dict[str, list[dict]] = {}
            for entry in new_entries:
                prompt_id = entry.get('promptId', 'unknown')
                traces.setdefault(prompt_id, []).append(entry)

            for prompt_id, spans in traces.items():
                first = spans[0]
                project = first.get('_meta', {}).get('project', 'unknown')
                trace = client.trace(
                    id=prompt_id,
                    name='claude-session',
                    metadata={'project': project, 'date': f.stem},
                )
                for span_entry in spans:
                    content = span_entry.get('message', {}).get('content', '')
                    if not isinstance(content, str):
                        content = str(content)
                    trace.span(
                        name=span_entry.get('type', 'unknown'),
                        input=content[:500],
                    )

        total_pushed += len(new_entries)
        new_cursor[file_key] = len(lines)

    if not dry_run:
        if client is not None:
            client.flush()
        _save_cursor(cursor_path, new_cursor)

    return total_pushed


def get_recent_traces(limit: int = 20) -> dict:
    client = _make_client()
    response = client.fetch_traces(limit=limit)
    traces = []
    for t in (response.data or []):
        traces.append({
            'id': t.id,
            'name': t.name,
            'timestamp': t.timestamp.isoformat() if t.timestamp else None,
            'project': t.metadata.get('project') if t.metadata else None,
        })
    return {'traces': traces}
```

- [ ] **Step 4: Run all langfuse_push tests**

```bash
cd meta-harness
pytest tests/api/test_langfuse_push.py -v
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add meta-harness/api/langfuse_push.py meta-harness/tests/api/test_langfuse_push.py
git commit -m "feat: implement langfuse_push.py with cursor-based incremental push and dry-run support"
```

---

## Task 6: Implement `server.py`

**Files:**
- Create: `meta-harness/api/server.py`
- Create: `meta-harness/tests/api/test_server.py`

- [ ] **Step 1: Write failing tests**

Create `meta-harness/tests/api/test_server.py`:

```python
import json
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'api'))

# Patch BackgroundScheduler before server import to prevent real background jobs
with patch('apscheduler.schedulers.background.BackgroundScheduler', MagicMock):
    from fastapi.testclient import TestClient
    import server
    from server import app

client = TestClient(app)


def write_jsonl(path: Path, entries: list) -> None:
    path.write_text('\n'.join(json.dumps(e) for e in entries) + '\n', encoding='utf-8')


def test_stats_overview(tmp_path, monkeypatch):
    monkeypatch.setattr(server, 'HARVESTED_DIR', tmp_path)
    write_jsonl(tmp_path / '2026-05-22.jsonl', [
        {'type': 'user', '_meta': {'project': 'proj-a'}, 'message': {'role': 'user', 'content': 'hi'}, 'promptId': 'p1'},
    ])
    response = client.get('/api/stats/overview')
    assert response.status_code == 200
    data = response.json()
    assert data['total_messages'] == 1
    assert data['active_projects'] == 1


def test_stats_daily(tmp_path, monkeypatch):
    monkeypatch.setattr(server, 'HARVESTED_DIR', tmp_path)
    response = client.get('/api/stats/daily?days=7')
    assert response.status_code == 200
    assert len(response.json()['days']) == 7


def test_stats_top_projects(tmp_path, monkeypatch):
    monkeypatch.setattr(server, 'HARVESTED_DIR', tmp_path)
    write_jsonl(tmp_path / '2026-05-22.jsonl', [
        {'type': 'user', '_meta': {'project': 'proj-a'}, 'message': {'role': 'user', 'content': 'hi'}, 'promptId': 'p1'},
    ])
    response = client.get('/api/stats/top-projects')
    assert response.status_code == 200
    assert 'projects' in response.json()


def test_ingest_endpoint():
    with patch('server.run_all', return_value=5):
        response = client.post('/api/ingest')
    assert response.status_code == 200
    assert response.json()['ingested'] == 5
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd meta-harness
pytest tests/api/test_server.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'server'`

- [ ] **Step 3: Implement server.py**

Create `meta-harness/api/server.py`:

```python
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler

_API_DIR = Path(__file__).parent
_ROOT_DIR = _API_DIR.parent
sys.path.insert(0, str(_ROOT_DIR / 'harvester'))

import stats as stats_module
import langfuse_push as lf_module
from harvest import harvest

HARVESTED_DIR = _ROOT_DIR / 'harvested'
_CURSOR_HARVEST = _ROOT_DIR / 'harvester' / 'cursor.json'
_CURSOR_LF = _API_DIR / 'cursor_lf.json'

scheduler = BackgroundScheduler()


def run_all() -> int:
    harvest(cursor_path=_CURSOR_HARVEST, harvested_dir=HARVESTED_DIR)
    return lf_module.push_new_entries(HARVESTED_DIR, _CURSOR_LF)


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(run_all, 'interval', minutes=15, id='harvest_push')
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title='meta-harness API', lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://localhost:3001'],
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/stats/overview')
def stats_overview():
    return stats_module.get_overview(HARVESTED_DIR)


@app.get('/api/stats/daily')
def stats_daily(days: int = 30):
    return stats_module.get_daily(HARVESTED_DIR, days)


@app.get('/api/stats/top-projects')
def stats_top_projects(limit: int = 10):
    return stats_module.get_top_projects(HARVESTED_DIR, limit)


@app.get('/api/traces/recent')
def traces_recent(limit: int = 20):
    return lf_module.get_recent_traces(limit)


@app.post('/api/ingest')
def ingest():
    count = run_all()
    return {'ingested': count}


if __name__ == '__main__':
    import uvicorn
    from dotenv import load_dotenv
    load_dotenv(_API_DIR / '.env')
    uvicorn.run(app, host='0.0.0.0', port=8000, reload=False)
```

- [ ] **Step 4: Run all API tests**

```bash
cd meta-harness
pytest tests/api/ -v
```

Expected: all PASS

- [ ] **Step 5: Run full test suite**

```bash
cd meta-harness
pytest tests/ -v
```

Expected: all PASS

- [ ] **Step 6: Smoke-test the server manually**

```bash
# Copy .env.example to .env and fill in Langfuse keys
cp meta-harness/api/.env.example meta-harness/api/.env

# Start server
cd meta-harness/api
python server.py
```

Open http://localhost:8000/api/stats/overview in browser.
Expected: JSON response `{"total_messages": ..., "active_projects": ..., "last_harvest": ...}`

Stop the server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add meta-harness/api/server.py meta-harness/tests/api/test_server.py
git commit -m "feat: implement FastAPI server with APScheduler, CORS, and stats/traces/ingest endpoints"
```

---

## Task 7: Setup `dashboard-ui/` from existing `dashboard/`

**Files:**
- Create: `meta-harness/dashboard-ui/` (copy of `dashboard/`)
- Modify: `meta-harness/dashboard-ui/package.json`
- Modify: `meta-harness/dashboard-ui/src/components/Layout/TopNavigation.tsx`
- Modify: `meta-harness/dashboard-ui/src/app/layout.tsx`

- [ ] **Step 1: Copy dashboard/ to meta-harness/dashboard-ui/**

```bash
# Mac/Linux
cp -r dashboard meta-harness/dashboard-ui
rm -rf meta-harness/dashboard-ui/node_modules meta-harness/dashboard-ui/.next

# Windows PowerShell
Copy-Item -Recurse dashboard meta-harness\dashboard-ui
Remove-Item -Recurse -Force meta-harness\dashboard-ui\node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force meta-harness\dashboard-ui\.next -ErrorAction SilentlyContinue
```

- [ ] **Step 2: Replace package.json**

Replace the full content of `meta-harness/dashboard-ui/package.json`:

```json
{
  "name": "meta-harness-dashboard",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "eslint"
  },
  "dependencies": {
    "next": "16.2.6",
    "next-themes": "^0.4.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.5.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "postcss": "^8.5.14",
    "tailwindcss": "^3.4.0",
    "typescript": "^5"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
cd meta-harness/dashboard-ui
pnpm install
```

Expected: packages installed including recharts.

- [ ] **Step 4: Update TopNavigation branding**

In `meta-harness/dashboard-ui/src/components/Layout/TopNavigation.tsx`, change the title:

```tsx
// Change:
<span className="text-title3">Zettlink</span>
// To:
<span className="text-title3">meta-harness</span>
```

- [ ] **Step 5: Replace layout.tsx with nav links**

Replace the full content of `meta-harness/dashboard-ui/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { TopNavigation } from "@/components/Layout/TopNavigation";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "meta-harness",
  description: "AI Agent Activity Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TopNavigation />
          <nav className="border-b border-line-normal-normal bg-background-normal-alternative">
            <div className="w-full max-w-[1200px] mx-auto px-6 flex gap-6 h-10 items-center">
              <Link
                href="/"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/stats"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Stats
              </Link>
              <Link
                href="/traces"
                className="text-body2 text-label-neutral hover:text-label-strong transition-colors"
              >
                Traces
              </Link>
            </div>
          </nav>
          <main className="max-w-[1200px] mx-auto py-8 px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify dev server starts**

```bash
cd meta-harness/dashboard-ui
pnpm dev
```

Open http://localhost:3001. Expected: page loads with "meta-harness" header and Overview/Stats/Traces nav links. Stop the server (Ctrl+C).

- [ ] **Step 7: Commit**

```bash
git add meta-harness/dashboard-ui
git commit -m "feat: scaffold dashboard-ui from existing dashboard with recharts, meta-harness branding, and nav links"
```

---

## Task 8: Overview page (`/`)

**Files:**
- Modify: `meta-harness/dashboard-ui/src/app/page.tsx`
- Create: `meta-harness/dashboard-ui/.env.local`

- [ ] **Step 1: Create .env.local**

Create `meta-harness/dashboard-ui/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 2: Replace page.tsx with Overview**

Replace the full content of `meta-harness/dashboard-ui/src/app/page.tsx`:

```tsx
import { Card } from '@/components/Card/Card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getOverview() {
  try {
    const res = await fetch(`${API_BASE}/api/stats/overview`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function OverviewPage() {
  const data = await getOverview();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display2">Overview</h1>
        <p className="text-body1 text-label-alternative">Agent activity at a glance</p>
      </header>

      {!data && (
        <div className="p-4 rounded-xl bg-fill-normal border border-line-normal-normal text-body2 text-label-assistive">
          API unavailable — start the server:{' '}
          <code>python meta-harness/api/server.py</code>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Total Messages</p>
          <p className="text-display3 text-label-strong">{data?.total_messages ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Active Projects</p>
          <p className="text-display3 text-label-strong">{data?.active_projects ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Last Harvest</p>
          <p className="text-title3 text-label-strong">
            {data?.last_harvest
              ? new Date(data.last_harvest).toLocaleString()
              : '—'}
          </p>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify page renders**

```bash
cd meta-harness/dashboard-ui
pnpm dev
```

Open http://localhost:3001. Expected: 3 stat cards — values show `—` if API not running, or real numbers if it is. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add meta-harness/dashboard-ui/src/app/page.tsx meta-harness/dashboard-ui/.env.local
git commit -m "feat: add Overview page with total messages, active projects, last harvest"
```

---

## Task 9: Stats page (`/stats`)

**Files:**
- Create: `meta-harness/dashboard-ui/src/app/stats/page.tsx`

- [ ] **Step 1: Create stats page**

Create `meta-harness/dashboard-ui/src/app/stats/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/Card/Card';
import { Badge } from '@/components/Badge/Badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type DailyEntry = { date: string; count: number };
type Project = { name: string; count: number };

export default function StatsPage() {
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/stats/daily?days=30`).then((r) => r.json()),
      fetch(`${API_BASE}/api/stats/top-projects?limit=10`).then((r) => r.json()),
    ])
      .then(([dailyData, projectsData]) => {
        setDaily(dailyData.days ?? []);
        setProjects(projectsData.projects ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-display2">Stats</h1>
        <p className="text-body2 text-label-assistive">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-display2">Stats</h1>
        <div className="p-4 rounded-xl bg-fill-normal border border-line-normal-normal text-body2 text-label-assistive">
          API unavailable — start the server:{' '}
          <code>python meta-harness/api/server.py</code>
        </div>
      </div>
    );
  }

  const chartData = daily.slice(-14).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display2">Stats</h1>
        <p className="text-body1 text-label-alternative">
          Message volume and project activity (last 30 days)
        </p>
      </header>

      <Card>
        <p className="text-heading1 text-label-strong mb-4">
          Daily Messages (last 14 days)
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line-normal-normal, #e5e7eb)"
            />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="var(--color-primary-normal, #0066ff)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-heading1 text-label-strong mb-4">Top Projects</p>
        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <p className="text-body2 text-label-assistive">No data yet</p>
          ) : (
            projects.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-label2 text-label-assistive w-5">{i + 1}</span>
                  <span className="text-body2 text-label-normal font-medium">{p.name}</span>
                </div>
                <Badge variant="subtle" color="primary" size="small">
                  {p.count} msgs
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify page renders**

```bash
cd meta-harness/dashboard-ui
pnpm dev
```

Open http://localhost:3001/stats. Expected: bar chart and top projects list (loading state → error message if API not running). Stop the server.

- [ ] **Step 3: Commit**

```bash
git add meta-harness/dashboard-ui/src/app/stats/page.tsx
git commit -m "feat: add Stats page with 14-day bar chart and top projects list"
```

---

## Task 10: Traces page (`/traces`)

**Files:**
- Create: `meta-harness/dashboard-ui/src/app/traces/page.tsx`

- [ ] **Step 1: Create traces page**

Create `meta-harness/dashboard-ui/src/app/traces/page.tsx`:

```tsx
import { Card } from '@/components/Card/Card';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const LANGFUSE_HOST =
  process.env.NEXT_PUBLIC_LANGFUSE_HOST ?? 'https://cloud.langfuse.com';

async function getTraces() {
  try {
    const res = await fetch(`${API_BASE}/api/traces/recent?limit=20`, {
      cache: 'no-store',
    });
    if (!res.ok) return { traces: [] };
    return res.json();
  } catch {
    return { traces: [] };
  }
}

type Trace = {
  id: string;
  name: string;
  timestamp: string | null;
  project: string | null;
};

export default async function TracesPage() {
  const { traces }: { traces: Trace[] } = await getTraces();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display2">Traces</h1>
        <p className="text-body1 text-label-alternative">
          Recent Claude agent sessions from Langfuse
        </p>
      </header>

      {traces.length === 0 ? (
        <div className="p-4 rounded-xl bg-fill-normal border border-line-normal-normal text-body2 text-label-assistive">
          No traces yet — trigger a harvest via{' '}
          <code>POST /api/ingest</code> or wait for the next scheduled run.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {traces.map((trace) => (
            <Card key={trace.id}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="subtle" color="primary" size="small">
                      {trace.project ?? 'unknown'}
                    </Badge>
                    <span className="text-caption1 text-label-assistive">
                      {trace.timestamp
                        ? new Date(trace.timestamp).toLocaleString()
                        : '—'}
                    </span>
                  </div>
                  <p className="text-body2 text-label-normal font-mono truncate max-w-[400px]">
                    {trace.id}
                  </p>
                </div>
                <a
                  href={`${LANGFUSE_HOST}/trace/${trace.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outlined" color="primary" size="small">
                    Open in Langfuse
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add LANGFUSE_HOST to .env.local**

Append to `meta-harness/dashboard-ui/.env.local`:

```bash
NEXT_PUBLIC_LANGFUSE_HOST=https://cloud.langfuse.com
```

- [ ] **Step 3: Verify page renders**

```bash
cd meta-harness/dashboard-ui
pnpm dev
```

Open http://localhost:3001/traces. Expected: empty state message (no traces yet) or list of sessions with "Open in Langfuse" links. Stop the server.

- [ ] **Step 4: End-to-end smoke test (optional but recommended)**

In one terminal:
```bash
cd meta-harness/api && python server.py
```

In another terminal:
```bash
cd meta-harness/dashboard-ui && pnpm dev
```

Trigger a harvest:
```bash
curl -X POST http://localhost:8000/api/ingest
```

Open http://localhost:3001 and verify Overview shows real numbers. Check /stats and /traces.

- [ ] **Step 5: Commit**

```bash
git add meta-harness/dashboard-ui/src/app/traces/page.tsx meta-harness/dashboard-ui/.env.local
git commit -m "feat: add Traces page with Langfuse session list and direct trace links"
```
