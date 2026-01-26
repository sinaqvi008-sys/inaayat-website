
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../../_check';
import { createClient } from '@supabase/supabase-js';
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;
  const id = Number(params.id);
  const body = await req.json();
  const { title, description, category_id, price, mrp, in_stock, tags, image_urls } = body;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);
  const { error: e1 } = await supabase.from('products').update({ title, description, category_id, price, mrp, in_stock, tags }).eq('id', id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
  if (Array.isArray(image_urls)) {
    await supabase.from('product_images').delete().eq('product_id', id);
    if (image_urls.length) {
      const rows = image_urls.map((u: string, idx: number) => ({ product_id: id, url: u, sort_order: idx }));
      const { error: e2 } = await supabase.from('product_images').insert(rows);
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
