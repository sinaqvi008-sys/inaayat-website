
'use client';
import { useEffect, useState } from 'react';
import { formatINR } from '@/lib/utils';
import { getPin } from '@/lib/adminAuth';
import Link from 'next/link';

type Visit = {
  id: string;
  customer_name: string;
  phone: string;
  flat: string | null;
  address_line: string | null;
  landmark: string | null;
  google_maps_link: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  status: string;
  note: string | null;
  created_at: string;
};

type VisitItem = { id: number; product_id: number; quantity: number; product: any | null };

export default function VisitDetail({ params }: { params: { id: string } }) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [items, setItems] = useState<VisitItem[]>([]);
  const [status, setStatus] = useState('new');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const pin = getPin() || '';
      const res = await fetch(`/api/admin/visits/${params.id}`, { headers: { 'x-admin-pin': pin } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setVisit(json.visit);
      setItems(json.items || []);
      setStatus(json.visit?.status || 'new');
      setNote(json.visit?.note || '');
    } catch (e: any) {
      alert(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setBusy(true);
    try {
      const pin = getPin() || '';
      const res = await fetch(`/api/admin/visits/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-pin': pin },
        body: JSON.stringify({ status, note })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not save');
      alert('Saved');
    } catch (e:any) {
      alert(e.message);
    } finally { setBusy(false); }
  }

  if (!visit) return <div className="container py-6">Loading...</div>;

  return (
    <div className="container py-6">
      <Link href="/admin/visits" className="text-brand">&larr; Back</Link>
      <h1 className="text-xl font-semibold mt-2">Order #{visit.id.slice(0,8)}</h1>
      <p className="text-sm text-gray-500">Created: {new Date(visit.created_at).toLocaleString()}</p>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-2">
          <h2 className="font-medium">Customer</h2>
          <p><strong>{visit.customer_name}</strong></p>
          <p>📞 {visit.phone} <button className="text-brand text-sm ml-2" onClick={()=>navigator.clipboard.writeText(visit.phone)}>Copy</button></p>
          <p>🏠 {visit.flat || ''} {visit.address_line || ''}</p>
          {visit.landmark ? <p>📍 {visit.landmark}</p> : null}
          {visit.google_maps_link ? <p><a className="text-brand" href={visit.google_maps_link} target="_blank">Open in Maps</a></p> : null}
        </div>

        <div className="space-y-2">
          <h2 className="font-medium">Schedule</h2>
          <p>Date: {visit.preferred_date || '-'}</p>
          <p>Time: {visit.preferred_time_slot || '-'}</p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="text-sm">Status</label>
              <select className="input" value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="new">new</option>
                <option value="scheduled">scheduled</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Internal Note</label>
              <input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g., 6–7 PM, call before" />
            </div>
          </div>
          <button className="btn btn-primary mt-3" onClick={save} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-medium">Selected Items ({items.length})</h2>
        <div className="mt-2 space-y-2">
          {items.map(it => (
            <div key={it.id} className="flex items-center justify-between border-b pb-2">
              <div className="flex-1 pr-3">
                <div className="text-sm font-medium">{it.product?.title || `Product #${it.product_id}`}</div>
                {it.product ? <div className="text-xs text-gray-500">{formatINR(it.product.price || 0)}</div> : null}
              </div>
              <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
            </div>
          ))}
          {!items.length && <p className="text-sm text-gray-500">No items recorded.</p>}
        </div>
      </div>
    </div>
  );
}
