
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearPin } from '@/lib/adminAuth';
import { useMemo } from 'react';

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = useMemo(() => pathname.startsWith(href), [pathname, href]);
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md ${
        active ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  function logout() {
    clearPin();
    window.location.href = '/admin';
  }

  return (
    <div className="min-h-screen flex bg-white">
      <aside className="w-64 border-r bg-white">
        <div className="px-4 py-4 border-b">
          <div className="text-lg font-semibold">Inaayat Admin</div>
          <div className="text-xs text-gray-500">Manage your store</div>
        </div>
        <nav className="p-3 space-y-1">
          <NavItem href="/admin/dashboard" label="Dashboard" />
          <NavItem href="/admin/products" label="Products" />
          <NavItem href="/admin/visits" label="Orders" />
          <button onClick={logout} className="mt-4 w-full btn btn-outline">
            Logout
          </button>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
