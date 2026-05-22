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
