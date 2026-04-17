'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/properties', label: 'Properties', icon: '🏢' },
  { href: '/cashflow', label: 'Cashflow', icon: '💰' },
  { href: '/account', label: 'Account', icon: '👤' }
];

export default function MobileTabNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom z-40">
      <div className="grid grid-cols-4">
        {tabs.map(t => {
          const active = pathname.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href}
              className={`flex flex-col items-center py-2 text-xs ${active ? 'text-slate-900' : 'text-slate-400'}`}>
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
