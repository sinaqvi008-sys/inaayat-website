'use client';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { formatINR } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const { show } = useToast();

  const handleAdd = () => {
    const res = add(p);
    if (!res.ok) {
      show(res.reason || 'Could not add item', 'error');
    } else {
      show('Added to cart', 'success');
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
      {p.image_url && (
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image src={p.image_url} alt={p.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1" title={p.title}>
          {p.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {p.description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[#7A1F2B] font-semibold">{formatINR(p.price)}</span>
          {p.mrp && p.mrp > p.price && (
            <span className="text-xs line-through text-gray-400">{formatINR(p.mrp)}</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={p.in_stock === false}
          className="mt-3 w-full rounded-md bg-[#7A1F2B] text-white py-2 text-sm font-medium disabled:opacity-50 hover:bg-[#5e1821] transition"
        >
          {p.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
