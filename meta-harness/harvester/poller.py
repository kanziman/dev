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
