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
