
import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '../_check';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  const unauthorized = ensureAdmin(req);
  if (unauthorized) return unauthorized;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, service);
  const form = await req.formData();
  const files = form.getAll('files');
  if (!files.length) return NextResponse.json({ error: 'No files' }, { status: 400 });
  const out: string[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth()+1).padStart(2,'0');
  for (const f of files) {
    if (!(f instanceof File)) continue;
    const bytes = await f.arrayBuffer();
    const pathname = `products/${year}/${month}/${Date.now()}_${Math.random().toString(36).slice(2)}_${f.name}`;
    const { error } = await supabase.storage.from('products').upload(pathname, Buffer.from(bytes), { contentType: f.type || 'application/octet-stream', upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data: pub } = supabase.storage.from('products').getPublicUrl(pathname);
    out.push(pub.publicUrl);
  }
  return NextResponse.json({ urls: out });
}
