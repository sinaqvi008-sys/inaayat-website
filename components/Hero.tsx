'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function Hero() {
  const artRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const elRef = artRef; // stable ref object

    // Disable pointer parallax on touch devices
    if (typeof window !== 'undefined' && 'ontouchstart' in window) return;

    let raf = 0;

    function onMove(e: MouseEvent) {
      // capture current node at event time
      const node = elRef.current;
      if (!node) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // re-check inside RAF in case it was unmounted
        const n = elRef.current;
        if (!n) return;

        const rect = n.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / rect.width;
        const dy = (e.clientY - cy) / rect.height;
        n.style.transform = `translate3d(${dx * 10}px, ${dy * 8}px, 0) rotate(${dx * 1.5}deg)`;
      });
    }

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="bg-gradient-to-r from-brand/5 to-brand/10">
      <div className="container mx-auto py-10 md:py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-wide text-brand bg-brand/10 px-3 py-1 rounded-full">
              Try at Home
            </span>

            <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight text-gray-900">
              Try at Home. Pay Only for What You Keep.
            </h1>

            <p className="mt-3 text-gray-600">
              Browse curated <strong className="text-gray-900">Ladies Suits</strong>, jewelry &amp; bags. Select up to 5 items and schedule a doorstep try-on.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#ladies-suits"
                className="inline-flex items-center gap-2 btn btn-primary px-5 py-3 rounded-md text-sm font-medium shadow"
                aria-label="Browse Suits"
              >
                Browse Suits
              </a>

              <a
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand border border-brand/20 px-4 py-3 rounded-md hover:bg-brand/5"
                aria-label="How it works"
              >
                How it works
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand" />
                Free doorstep try-on
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand" />
                Easy returns
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand" />
                Pay only for what you keep
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div
              ref={artRef}
              className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-lg bg-white/60 backdrop-blur-sm border border-white/30"
              style={{ transition: 'transform 180ms ease-out' }}
            >
              <div className="relative h-72 sm:h-80">
                <Image
                  src="/images/hero-suits.jpg"
                  alt="Curated suits and accessories from Tayat Studio"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="absolute left-4 bottom-4 bg-white/85 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium text-gray-800 shadow">
                <span className="text-xs text-gray-500 block">Featured</span>
                <span className="block">Handcrafted Suit Set</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none">
        <svg className="w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
          <path d="M0,40 C360,120 1080,0 1440,60 L1440,80 L0,80 Z" fill="white" opacity="0.95" />
        </svg>
      </div>
    </section>
  );
}
