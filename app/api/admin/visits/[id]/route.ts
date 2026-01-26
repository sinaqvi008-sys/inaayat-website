
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../../_check';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  const id = params.id;

  // 1) visit
  const { data: visit, error: e1 } = await supabase.from('visits').select('*').eq('id', id).single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // 2) visit_items
  const { data: items, error: e2 } = await supabase.from('visit_items').select('*').eq('visit_id', id);
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

  // 3) product details for those items
  const productIds = Array.from(new Set((items || []).map(i => i.product_id)));
  let productsMap: Record<number, any> = {};
  if (productIds.length) {
    const { data: prods, error: e3 } = await supabase.from('products').select('*').in('id', productIds);
    if (e3) return NextResponse.json({ error: e3.message }, { status: 500 });
    productsMap = Object.fromEntries((prods || []).map(p => [p.id, p]));
  }

  const detailedItems = (items || []).map(i => ({
    ...i,
    product: productsMap[i.product_id] || null
  }));

  return NextResponse.json({ visit, items: detailedItems });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const id = params.id;
  const body = await req.json(); // { status?: string, note?: string }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  const patch: any = {};
  if (typeof body.status === 'string') patch.status = body.status;
  if (typeof body.note === 'string') patch.note = body.note;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  const { error } = await supabase.from('visits').update(patch).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
