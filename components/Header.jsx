import Link from 'next/link';
export default function Header({ onOpenCart }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/"><a className="text-xl font-semibold text-[#111827]">Tayat</a></Link>
        <div className="flex items-center gap-4">
          <input placeholder="Search products" className="hidden md:block border rounded px-3 py-2" />
          <button type="button" onClick={onOpenCart} className="px-3 py-2 rounded bg-[#7A1F2B] text-white">Cart</button>
        </div>
      </div>
    </header>
  );
}
