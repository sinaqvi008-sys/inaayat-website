// app/api/admin/mark-sale/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../_check';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const productId = Number(body.productId);
  if (!productId) {
    return NextResponse.json({ ok: false, error: 'productId required' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);

  try {
    // Call the atomic RPC in the DB (mark_sale)
    const { data, error } = await supabase.rpc('mark_sale', { p_id: productId });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // RPC returns 0 rows if quantity was 0 or product not found
    if (!data || (Array.isArray(data) && data.length === 0)) {
      // Distinguish between not found and out of stock
      const { data: exists, error: e2 } = await supabase
        .from('products')
        .select('id, quantity, in_stock')
        .eq('id', productId)
        .limit(1)
        .maybeSingle();

      if (e2) {
        return NextResponse.json({ ok: false, error: e2.message }, { status: 500 });
      }

      if (!exists) {
        return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
      }

      // Product exists but RPC returned no rows => quantity was 0
      return NextResponse.json({ ok: false, error: 'Product out of stock' }, { status: 409 });
    }

    const updated = Array.isArray(data) ? data[0] : data;

    // Revalidate relevant public pages so the site reflects the new stock immediately.
    // Adjust these paths if your routes differ.
    try {
      revalidatePath(`/products/${productId}`);
      revalidatePath(`/browse`);
    } catch (revalErr) {
      console.warn('revalidatePath failed', revalErr);
    }

    return NextResponse.json({ ok: true, product: updated }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
