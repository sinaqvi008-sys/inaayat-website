
'use client';
import { useEffect, useMemo, useState } from 'react';
import { getPin } from '@/lib/adminAuth';
import { formatINR } from '@/lib/utils';

type Row = { ym: string; count: number; amount: number };
type Resp = { months: Row[]; totalVisits: number; totalAmount: number; todayScheduled: number };

export default function Dashboard() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const pin = getPin() || '';
      const res = await fetch('/api/admin/metrics/monthly', { headers: { 'x-admin-pin': pin } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load metrics');
      setData(json);
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const maxAmt = useMemo(() => {
    if (!data) return 0;
    return Math.max(1, ...data.months.map(m => m.amount || 0));
  }, [data]);

  // Basic bar chart dimensions
  const H = 180, PAD = 24;
  const barW = 12, gap = 8;
  const width = data ? (data.months.length * (barW + gap)) + PAD * 2 : 600;

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <button className="btn btn-outline" onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      {!data ? <p className="mt-6 text-gray-500">Loading metrics...</p> : (
        <>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="text-sm text-gray-500">Total Orders (30 months)</div>
              <div className="text-2xl font-semibold mt-1">{data.totalVisits}</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Requested Value (30 months)</div>
              <div className="text-2xl font-semibold mt-1">{formatINR(Math.round(data.totalAmount))}</div>
              <div className="text-xs text-gray-500 mt-1">Proxy for demand (not actual collected cash)</div>
            </div>
            <div className="card p-4">
              <div className="text-sm text-gray-500">Today’s Scheduled</div>
              <div className="text-2xl font-semibold mt-1">{data.todayScheduled}</div>
            </div>
          </div>

          <div className="mt-6 card p-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">30‑Month Requested Value</div>
              <div className="text-xs text-gray-500">Bar height = value per month</div>
            </div>
            <div className="mt-4 w-full overflow-x-auto">
              <svg width={width} height={H}>
                {/* Axis line */}
                <line x1={PAD} y1={H - PAD} x2={width - PAD} y2={H - PAD} stroke="#e5e7eb" />
                {data.months.map((m, i) => {
                  const x = PAD + i * (barW + gap);
                  const h = Math.round(((m.amount || 0) / maxAmt) * (H - PAD * 2));
                  const y = H - PAD - h;
                  return (
                    <g key={m.ym}>
                      <rect x={x} y={y} width={barW} height={h} fill="#FF3E6C" />
                      {/* Month label every 3 months */}
                      {i % 3 === 0 && (
                        <text x={x + barW / 2} y={H - PAD + 12} textAnchor="middle" fontSize="10" fill="#6b7280">
                          {m.ym.slice(2)}{/* show YY-MM */}
                        </text>
                      )}
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
