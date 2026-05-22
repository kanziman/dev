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
            date.fromisoformat(f.stem)  # skip non-date filenames
        except ValueError:
            continue
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
