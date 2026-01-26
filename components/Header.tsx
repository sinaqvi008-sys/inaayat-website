
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export default function Header({ onSearch }: { onSearch?: (q: string) => void }) {
  const { items } = useCart();
  const [q, setQ] = useState('');

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="container flex items-center gap-3 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={120} height={36} />
        </Link>

        <div className="flex-1" />

        <div className="hidden md:block w-full max-w-md">
          <input
            className="input"
            placeholder="Search suits, jewelry, bags"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onSearch?.(e.target.value);
            }}
          />
        </div>

        <Link href="#cart" className={cn('relative btn btn-outline ml-3')}>
          Cart
          <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand text-white text-xs px-1">
            {items.length}
          </span>
        </Link>
      </div>
    </header>
  );
}
