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
