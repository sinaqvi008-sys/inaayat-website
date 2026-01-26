
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../_check';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { title, description, category_id, price, mrp, in_stock, tags, image_urls } = body;
  if (!title || !category_id || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // 👉 choose first image as the product's primary image_url
  const primary = Array.isArray(image_urls) && image_urls.length ? image_urls[0] : null;

  // 1) Insert product WITH image_url
  const { data: prod, error: e1 } = await supabase
    .from('products')
    .insert({ title, description, category_id, price, mrp, in_stock, tags, image_url: primary })
    .select('id')
    .single();
  if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

  // 2) Insert all product_images (if any)
  if (Array.isArray(image_urls) && image_urls.length) {
    const rows = image_urls.map((u: string, idx: number) => ({ product_id: prod.id, url: u, sort_order: idx }));
    const { error: e2 } = await supabase.from('product_images').insert(rows);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
  }

  return NextResponse.json({ id: prod.id });
}
