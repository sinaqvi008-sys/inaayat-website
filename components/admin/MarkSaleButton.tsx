'use client';

import { useState } from 'react';
import { getPin } from '@/lib/adminAuth';

type ProductRow = {
  id: number;
  title: string;
  quantity: number;
  in_stock: boolean;
};

export default function MarkSaleButton({
  product,
  onUpdated,
}: {
  product: ProductRow;
  onUpdated?: (p: ProductRow) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleMarkSale() {
    if (!confirm(`Mark one unit sold for "${product.title}"?`)) return;
    setLoading(true);

    try {
      // Read admin PIN from the same helper you use elsewhere
      const pin = getPin();

      const res = await fetch('/api/admin/mark-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // include admin pin so ensureAdmin(req) on the server can validate
          ...(pin ? { 'x-admin-pin': pin } : {}),
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const json = await res.json();

      if (res.ok && json.ok) {
        onUpdated?.(json.product);
      } else {
        if (res.status === 401) {
          alert('Unauthorized — admin PIN missing or invalid.');
        } else if (res.status === 409) {
          alert('Product is already out of stock.');
        } else if (res.status === 404) {
          alert('Product not found.');
        } else {
          alert(json.error || 'Could not mark sale.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error while marking sale.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleMarkSale}
      disabled={!product.in_stock || product.quantity <= 0 || loading}
      className={`px-3 py-1 rounded text-sm ${
        product.in_stock ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
      }`}
      title={product.in_stock ? 'Mark one unit as sold' : 'Out of stock'}
    >
      {loading ? 'Saving...' : 'Mark Sale'}
    </button>
  );
}
