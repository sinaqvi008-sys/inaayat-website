import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

type Product = {
  id: number;
  title: string;
  price: number;
  mrp?: number;
  image_url?: string;
  quantity: number;
  in_stock: boolean;
  [k: string]: any;
};

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

function readProducts(): Product[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch (e) {
    return [];
  }
}

function writeProducts(products: Product[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), 'utf-8');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId } = body;
    if (typeof productId === 'undefined') {
      return NextResponse.json({ ok: false, error: 'productId required' }, { status: 400 });
    }

    const products = readProducts();
    const idx = products.findIndex(p => p.id === Number(productId));
    if (idx === -1) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    const prod = products[idx];

    // If already out of stock, return current state
    if (!prod.in_stock) {
      return NextResponse.json({ ok: false, error: 'Product already out of stock', product: prod }, { status: 409 });
    }

    // Decrement quantity by 1
    prod.quantity = Math.max(0, (prod.quantity ?? 0) - 1);

    // If quantity is zero, mark out of stock
    if (prod.quantity <= 0) {
      prod.in_stock = false;
    }

    products[idx] = prod;
    writeProducts(products);

    return NextResponse.json({ ok: true, product: prod });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
