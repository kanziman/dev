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
