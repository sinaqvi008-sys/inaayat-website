
import { NextRequest, NextResponse } from 'next/server';
export function ensureAdmin(req: NextRequest) {
  const pin = req.headers.get('x-admin-pin');
  const expected = process.env.ADMIN_PIN;
  if (!expected || !pin || pin !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
