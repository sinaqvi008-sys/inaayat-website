
'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPin } from '@/lib/adminAuth';
import { formatINR } from '@/lib/utils';

type Day = { ymd: string; count: number; amount: number };
type Resp = { days: Day[]; totalVisits: number; totalAmount: number; todayScheduled: number };

export default function Dashboard() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const pin = getPin() || '';
      const res = await fetch('/api/admin/metrics/daily', { headers: { 'x-admin-pin': pin } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load metrics');
      setData(json);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Chart scale
  const maxAmt = useMemo(() => {
    if (!data) return 0;
    return Math.max(1, ...data.days.map(d => d.amount || 0));
  }, [data]);

  // Basic bar chart params
  const H = 180, PAD = 24;
  const barW = 10, gap = 6;
  const width = data ? (data.days.length * (barW + gap)) + PAD * 2 : 600;

  // Short label: show dd (and MM every 7th bar)
  function label(ymd: string, i: number) {
    const mm = ymd.slice(5, 7);
    const dd = ymd.slice(8, 10);
    return i % 7 === 0 ? `${mm}-${dd}` : dd;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard (30 days)</h1>
        <button className="btn btn-outline" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {!data ? (
        <p className="mt-6 text-gray-500">Loading metrics...</p>
      ) : (
        <>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Orders (30 days)</div>
              <div className="text-2xl font-semibold mt-1">{data.totalVisits}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Requested Value (30 days)</div>
              <div className="text-2xl font-semibold mt-1">{formatINR(Math.round(data.totalAmount))}</div>
              <div className="text-xs text-gray-500 mt-1">Proxy for demand (kept-items/cash to be added later)</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Today’s Scheduled</div>
              <div className="text-2xl font-semibold mt-1">{data.todayScheduled}</div>
            </div>
          </div>

          <div className="mt-6 card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Requested Value — Last 30 Days</div>
              <div className="text-xs text-gray-500">Bar height = daily value</div>
            </div>
            <div className="mt-4 w-full overflow-x-auto">
              <svg width={width} height={H}>
                {/* Axis */}
                <line x1={PAD} y1={H - PAD} x2={width - PAD} y2={H - PAD} stroke="#e5e7eb" />
                {data.days.map((d, i) => {
                  const x = PAD + i * (barW + gap);
                  const h = Math.round(((d.amount || 0) / maxAmt) * (H - PAD * 2));
                  const y = H - PAD - h;
                  return (
                    <g key={d.ymd}>
                      <rect x={x} y={y} width={barW} height={h} fill="#FF3E6C" />
                      {/* Label: day number (and month every 7 bars) */}
                      <text x={x + barW / 2} y={H - PAD + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                        {label(d.ymd, i)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
