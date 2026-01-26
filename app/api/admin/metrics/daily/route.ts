
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../../_check';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type DayRow = { ymd: string; count: number; amount: number };

// YYYY-MM-DD (UTC) from a Date
function ymdUTC(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // Compute the 30-day window (including today)
  const today = new Date();
  const start = new Date(today);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - 29); // 29 back + today = 30 days
  const startISO = start.toISOString();

  // 1) Pull visits in range
  const { data: visits, error: e1 } = await supabase
    .from('visits')
    .select('id, created_at, status, preferred_date')
    .gte('created_at', startISO)
    .order('created_at', { ascending: true });

  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  const visitIds = (visits || []).map(v => v.id);
  const dayOfVisit: Record<string, string> = {};
  (visits || []).forEach(v => {
    const d = new Date(v.created_at);
    dayOfVisit[v.id] = ymdUTC(d);
  });

  // today's scheduled count
  const todayYMD = ymdUTC(new Date());
  const todayScheduled = (visits || []).filter(
    v => v.status === 'scheduled' && v.preferred_date === todayYMD
  ).length;

  // 2) Pull visit_items for those visits
  let items: { visit_id: string; product_id: number; quantity: number }[] = [];
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
    (prods || []).forEach(p => (priceMap[p.id] = Number(p.price || 0)));
  }

  // 4) Prepare 30 daily buckets
  const days: DayRow[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push({ ymd: ymdUTC(d), count: 0, amount: 0 });
  }

  // Count orders per day
  (visits || []).forEach(v => {
    const key = dayOfVisit[v.id];
    const slot = days.find(d => d.ymd === key);
    if (slot) slot.count += 1;
  });

  // Sum requested value per day (sum of price * qty of selected items)
  items.forEach(i => {
    const key = dayOfVisit[i.visit_id];
    const slot = days.find(d => d.ymd === key);
    if (!slot) return;
    const price = priceMap[i.product_id] || 0;
    slot.amount += price * (i.quantity || 1);
  });

  const totalVisits = (visits || []).length;
  const totalAmount = days.reduce((s, d) => s + d.amount, 0);

  return NextResponse.json({ days, totalVisits, totalAmount, todayScheduled });
}
