'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/Card/Card';
import { Badge } from '@/components/Badge/Badge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

type DailyEntry = { date: string; count: number };
type Project = { name: string; count: number };

export default function StatsPage() {
  const [daily, setDaily] = useState<DailyEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/stats/daily?days=30`).then((r) => r.json()),
      fetch(`${API_BASE}/api/stats/top-projects?limit=10`).then((r) => r.json()),
    ])
      .then(([dailyData, projectsData]) => {
        setDaily(dailyData.days ?? []);
        setProjects(projectsData.projects ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-display2">Stats</h1>
        <p className="text-body2 text-label-assistive">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-display2">Stats</h1>
        <div className="p-4 rounded-xl bg-fill-normal border border-line-normal-normal text-body2 text-label-assistive">
          API unavailable — start the server:{' '}
          <code>python meta-harness/api/server.py</code>
        </div>
      </div>
    );
  }

  const chartData = daily.slice(-14).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-display2">Stats</h1>
        <p className="text-body1 text-label-alternative">
          Message volume and project activity (last 30 days)
        </p>
      </header>

      <Card>
        <p className="text-heading1 text-label-strong mb-4">
          Daily Messages (last 14 days)
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line-normal-normal, #e5e7eb)"
            />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="var(--color-primary-normal, #0066ff)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="text-heading1 text-label-strong mb-4">Top Projects</p>
        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <p className="text-body2 text-label-assistive">No data yet</p>
          ) : (
            projects.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-label2 text-label-assistive w-5">{i + 1}</span>
                  <span className="text-body2 text-label-normal font-medium">{p.name}</span>
                </div>
                <Badge variant="subtle" color="primary" size="small">
                  {p.count} msgs
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
