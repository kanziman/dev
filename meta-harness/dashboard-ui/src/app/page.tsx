import { Card } from '@/components/Card/Card';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getOverview() {
  try {
    const res = await fetch(`${API_BASE}/api/stats/overview`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function OverviewPage() {
  const data = await getOverview();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display2">Overview</h1>
        <p className="text-body1 text-label-alternative">Agent activity at a glance</p>
      </header>

      {!data && (
        <div className="p-4 rounded-xl bg-fill-normal border border-line-normal-normal text-body2 text-label-assistive">
          API unavailable — start the server:{' '}
          <code>python meta-harness/api/server.py</code>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Total Messages</p>
          <p className="text-display3 text-label-strong">{data?.total_messages ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Active Projects</p>
          <p className="text-display3 text-label-strong">{data?.active_projects ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-label2 text-label-assistive mb-2">Last Harvest</p>
          <p className="text-title3 text-label-strong">
            {data?.last_harvest
              ? new Date(data.last_harvest).toLocaleString()
              : '—'}
          </p>
        </Card>
      </div>
    </div>
  );
}
