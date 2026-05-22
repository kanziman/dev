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
