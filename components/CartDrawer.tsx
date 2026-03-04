'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';

export default function CartDrawer() {
  const { items, remove } = useCart();
  const [open, setOpen] = useState(false);

  if (!open) {
    // Show only a button to open the cart
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 px-4 py-2 rounded bg-[#7A1F2B] text-white shadow"
      >
        Open Cart ({items.length})
      </button>
    );
  }

  return (
    <section
      id="cart"
      className="fixed inset-0 z-50 flex items-end justify-center md:items-center"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <div className="relative bg-white rounded-t-lg md:rounded-lg w-full md:max-w-md max-h-[90vh] overflow-auto shadow-lg p-4 z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Your Selection ({items.length}/5)</h3>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ✕ Close
          </button>
        </div>

        <div className="mt-3 space-y-3 max-h-64 overflow-auto">
          {items.map(i => (
            <div key={i.id} className="flex items-center gap-3">
              {i.image_url && (
                <div className="relative h-14 w-10 overflow-hidden rounded">
                  <Image src={i.image_url} alt={i.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium line-clamp-1">{i.title}</div>
                <div className="text-xs text-gray-500">{formatINR(i.price)}</div>
              </div>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-800"
                onClick={() => remove(i.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-gray-500">
              No items yet. Add products to schedule a visit.
            </p>
          )}
        </div>

        <div className="mt-3">
          <Link
            href="/schedule"
            className={`btn btn-primary w-full ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            Schedule Visit
          </Link>
        </div>
      </div>
    </section>
  );
}
