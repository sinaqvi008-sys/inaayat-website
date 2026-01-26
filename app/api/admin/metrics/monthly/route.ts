
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../../_check';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function ymKey(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // 30 months window
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 29, 1); // 29 back + current = 30
  const startISO = start.toISOString();

  // 1) Pull visits in range
  const { data: visits, error: e1 } = await supabase
    .from('visits')
    .select('id, created_at, status, preferred_date')
    .gte('created_at', startISO)
    .order('created_at', { ascending: true });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const visitIds = (visits || []).map(v => v.id);
  const ymOfVisit: Record<string, string> = {};
  (visits || []).forEach(v => { ymOfVisit[v.id] = ymKey(v.created_at); });

  // today scheduled count
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayISO = `${y}-${m}-${d}`;
  const todayScheduled = (visits || []).filter(v => v.status === 'scheduled' && v.preferred_date === todayISO).length;

  // 2) Pull visit_items for those visits
  let items: any[] = [];
  if (visitIds.length) {
    const { data: vi, error: e2 } = await supabase
      .from('visit_items')
      .select('visit_id, product_id, quantity')
      .in('visit_id', visitIds);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    items = vi || [];
  }

  // 3) Pull product prices for those items
  const productIds = Array.from(new Set(items.map(i => i.product_id)));
  let priceMap: Record<number, number> = {};
  if (productIds.length) {
    const { data: prods, error: e3 } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);
    if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });
    (prods || []).forEach(p => { priceMap[p.id] = Number(p.price || 0); });
  }

  // 4) Aggregate monthly
  const months: { ym: string; count: number; amount: number }[] = [];
  // initialize 30 months
  for (let i = 0; i < 30; i++) {
    const dt = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    months.push({ ym, count: 0, amount: 0 });
  }

  // counts per month
  (visits || []).forEach(v => {
    const ym = ymKey(v.created_at);
    const slot = months.find(m => m.ym === ym);
    if (slot) slot.count += 1;
  });

  // requested value per month (sum of product prices * qty, per visit month)
  items.forEach(i => {
    const ym = ymOfVisit[i.visit_id];
    const slot = months.find(m => m.ym === ym);
    if (!slot) return;
    const price = priceMap[i.product_id] || 0;
    slot.amount += price * (i.quantity || 1);
  });

  const totalVisits = (visits || []).length;
  const totalAmount = months.reduce((s, m) => s + m.amount, 0);

  return NextResponse.json({ months, totalVisits, totalAmount, todayScheduled });
}
