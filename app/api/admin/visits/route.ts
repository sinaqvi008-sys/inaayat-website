
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../_check';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // Optional filters
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const status = searchParams.get('status') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  let query = supabase.from('visits').select('*').order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (from) query = query.gte('created_at', from);
  if (to)   query = query.lte('created_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // simple search on client-ish fields
  const filtered = q
    ? (data || []).filter(v =>
        (v.customer_name || '').toLowerCase().includes(q) ||
        (v.phone || '').toLowerCase().includes(q) ||
        (v.flat || '').toLowerCase().includes(q))
    : (data || []);

  return NextResponse.json(filtered);
}
