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
