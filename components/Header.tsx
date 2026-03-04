'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function Header({ onSearch }: { onSearch?: (q: string) => void }) {
  const { items } = useCart();
  const [q, setQ] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="container flex items-center justify-between py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={120} height={36} />
        </Link>

        {/* Search (desktop only) */}
        <div className="hidden md:block w-full max-w-md mx-6">
          <input
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7A1F2B]"
            placeholder="Search suits, jewelry, bags"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
        </div>

        {/* Cart button */}
        <button
          type="button"
          onClick={() => {
            const cartEl = document.getElementById('cart');
            if (cartEl) cartEl.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
        >
          Cart
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7A1F2B] text-white text-xs px-1">
            {items.length}
          </span>
        </button>
      </div>
    </header>
  );
}
