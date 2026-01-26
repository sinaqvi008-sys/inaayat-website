
'use client';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabaseClient';
import { TIME_SLOTS } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import Link from 'next/link';

export default function SchedulePage() {
  const { items, clear } = useCart();
  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    flat: '',
    address_line: '',
    landmark: '',
    google_maps_link: '',
    preferred_date: '',
    preferred_time_slot: TIME_SLOTS[0],
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      // Ideally redirect back, but keeping it simple for MVP
    }
  }, [items.length]);

  // Create our own ID and avoid reading the row back (fits our privacy policy)
  async function submit() {
    if (!form.customer_name || !form.phone || !form.flat || !form.address_line || !form.preferred_date) {
      alert('Please fill all required fields.');
      return;
    }
    if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s|-/g, ''))) {
      alert('Please enter a valid phone number.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item to cart.');
      return;
    }

    setSubmitting(true);
    try {
      const visitId = crypto.randomUUID();

      // 1) Insert visit
      const { error: e1 } = await supabase.from('visits').insert({
        id: visitId,
        customer_name: form.customer_name,
        phone: form.phone,
        address_line: form.address_line,
        flat: form.flat,
        landmark: form.landmark,
        google_maps_link: form.google_maps_link,
        preferred_date: form.preferred_date,
        preferred_time_slot: form.preferred_time_slot,
        note: form.note
      });
      if (e1) throw e1;

      // 2) Insert selected items
      const rows = items.map(i => ({ visit_id: visitId, product_id: i.id, quantity: 1 }));
      const { error: e2 } = await supabase.from('visit_items').insert(rows);
      if (e2) throw e2;

      clear();
      setSuccessId(visitId);
    } catch (e: any) {
      console.error(e);
      alert('Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (successId) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-gray-600">Your visit request has been received. We will confirm shortly.</p>
        <p className="mt-2 text-sm text-gray-500">Reference: {successId}</p>
        <Link className="btn btn-primary mt-6" href="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-xl font-semibold">Schedule a Visit</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm">Name *</label>
            <input className="input" value={form.customer_name} onChange={e=>setForm({...form, customer_name:e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Phone *</label>
            <input className="input" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="10-digit or with country code" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Flat/House No. *</label>
              <input className="input" value={form.flat} onChange={e=>setForm({...form, flat:e.target.value})} />
            </div>
            <div>
              <label className="text-sm">Preferred Date *</label>
              <input type="date" className="input" value={form.preferred_date} onChange={e=>setForm({...form, preferred_date:e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm">Address/Colony *</label>
            <input className="input" value={form.address_line} onChange={e=>setForm({...form, address_line:e.target.value})} placeholder="e.g., ABC Enclave, Block B" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Time Slot</label>
              <select className="input" value={form.preferred_time_slot} onChange={e=>setForm({...form, preferred_time_slot:e.target.value})}>
                {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Landmark</label>
              <input className="input" value={form.landmark} onChange={e=>setForm({...form, landmark:e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm">Google Maps Link</label>
            <input className="input" value={form.google_maps_link} onChange={e=>setForm({...form, google_maps_link:e.target.value})} placeholder="Paste location link" />
          </div>
          <div>
            <label className="text-sm">Notes</label>
            <textarea className="input" value={form.note} onChange={e=>setForm({...form, note:e.target.value})} rows={3} />
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
        </div>
        <div>
          <h2 className="font-medium">Selected Items ({items.length})</h2>
          <div className="mt-3 space-y-3">
            {items.map(i => (
              <div key={i.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex-1 pr-3">
                  <div className="text-sm font-medium">{i.title}</div>
                  <div className="text-xs text-gray-500">{formatINR(i.price)}</div>
                </div>
              </div>
            ))}
            {items.length===0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
