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
