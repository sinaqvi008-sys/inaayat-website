
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { getPin } from '@/lib/adminAuth';

type Visit = {
  id: string;
  customer_name: string;
  phone: string;
  flat: string | null;
  address_line: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  status: string;
  created_at: string;
};

export default function AdminVisits() {
  const [rows, setRows] = useState<Visit[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const pin = getPin() || '';
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('status', status);
      if (from) params.set('from', from);
      if (to) params.set('to', to);

      const res = await fetch(`/api/admin/visits?${params.toString()}`, {
        headers: { 'x-admin-pin': pin }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setRows(json);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* first load */ }, []);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders (Visits)</h1>
      </div>

      <div className="mt-4 grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="Search name/phone/flat"
               value={q} onChange={e=>setQ(e.target.value)} />
        <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">new</option>
          <option value="scheduled">scheduled</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <input className="input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Apply'}</button>
      </div>

      <div className="mt-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Created</th>
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Phone</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Preferred</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(v => (
              <tr key={v.id} className="border-b">
                <td className="py-2 pr-4">{v.created_at ? format(new Date(v.created_at), 'dd-MMM HH:mm') : ''}</td>
                <td className="py-2 pr-4">{v.customer_name}</td>
                <td className="py-2 pr-4">{v.phone}</td>
                <td className="py-2 pr-4">{v.status}</td>
                <td className="py-2 pr-4">{v.preferred_date} {v.preferred_time_slot ? `(${v.preferred_time_slot})` : ''}</td>
                <td className="py-2 pr-4">
                  <Link className="text-brand" href={`/admin/visits/${v.id}`}>Open</Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td className="py-4 text-gray-500" colSpan={6}>No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
