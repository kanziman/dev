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
