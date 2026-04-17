'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/properties', label: 'Properties' },
  { href: '/cashflow', label: 'Cashflow' },
  { href: '/account', label: 'Account' }
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:block w-60 shrink-0 border-r border-slate-200 bg-white min-h-screen p-4">
      <div className="font-bold text-lg mb-6">Portfolio Advisor</div>
      <nav className="space-y-1">
        {items.map(i => {
          const active = pathname.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href}
              className={`block px-3 py-2 rounded-lg ${active ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
