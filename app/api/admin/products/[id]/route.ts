import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../../_check';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const id = Number(params.id);
  const body = await req.json();

  // ✅ NOW also reading quantity from body
  const {
    title,
    description,
    category_id,
    price,
    mrp,
    in_stock,
    tags,
    image_urls,
    quantity, // 👈 NEW
  } = body;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  // 👉 determine the primary image (first in the list) if provided
  const primary =
    Array.isArray(image_urls) && image_urls.length ? image_urls[0] : null;

  // ✅ Make sure quantity is always a number (fallback to 0 if missing)
  const safeQuantity =
    typeof quantity === 'number' && !Number.isNaN(quantity)
      ? quantity
      : 0;

  // 1) Update product (include primary image & quantity)
  const { error: e1 } = await supabase
    .from('products')
    .update({
      title,
      description,
      category_id,
      price,
      mrp,
      in_stock,
      tags,
      image_url: primary,
      quantity: safeQuantity, // 👈 NEW: update quantity
    })
    .eq('id', id);

  if (e1) {
    return NextResponse.json({ error: e1.message }, { status: 500 });
  }

  // 2) Replace product_images if we got a list
  if (Array.isArray(image_urls)) {
    await supabase.from('product_images').delete().eq('product_id', id);

    if (image_urls.length) {
      const rows = image_urls.map((u: string, idx: number) => ({
        product_id: id,
        url: u,
        sort_order: idx,
      }));
      const { error: e2 } = await supabase
        .from('product_images')
        .insert(rows);

      if (e2) {
        return NextResponse.json({ error: e2.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
