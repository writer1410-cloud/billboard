'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function GridIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" />
      <rect x="8" y="0.5" width="5.5" height="5.5" rx="1" />
      <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" />
      <rect x="8" y="8" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function UserIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="3.5" y="0.5" width="7" height="6" rx="3.5" />
      <path d="M0.5 13.5 C0.5 9.5 3 8 7 8 C11 8 13.5 9.5 13.5 13.5 Z" />
    </svg>
  );
}

function DocIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="1.5" y="0.5" width="11" height="13" rx="1.5" />
      <rect x="4" y="4" width="6" height="1" fill="white" rx="0.3" />
      <rect x="4" y="6.5" width="4.5" height="1" fill="white" rx="0.3" />
      <rect x="4" y="9" width="5.5" height="1" fill="white" rx="0.3" />
    </svg>
  );
}

function InvIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="1.5" y="0.5" width="11" height="13" rx="1.5" />
      <rect x="4" y="3.5" width="6" height="1" fill="white" rx="0.3" />
      <rect x="4" y="6" width="4" height="1" fill="white" rx="0.3" />
      <rect x="5.5" y="8.5" width="3" height="3.5" fill="white" rx="0.2" />
      <rect x="4.5" y="9.5" width="5" height="0.8" fill="white" rx="0.2" />
      <rect x="4.5" y="11" width="5" height="0.8" fill="white" rx="0.2" />
    </svg>
  );
}

const navItems = [
  { href: '/', label: 'ホーム', Icon: GridIcon },
  { href: '/clients', label: '顧客', Icon: UserIcon },
  { href: '/quotes', label: '見積', Icon: DocIcon },
  { href: '/invoices', label: '請求', Icon: InvIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop: narrow icon sidebar */}
      <nav className="hidden md:flex w-14 bg-white border-r border-gray-200 flex-col items-center py-3 gap-1 shrink-0">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2.5 w-12 rounded-lg text-center transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.Icon />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white z-50"
        style={{ borderTop: '2px solid #d1fae5' }}
      >
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-2 pb-5 text-xs transition-colors ${
                  active ? 'text-emerald-600' : 'text-gray-400'
                }`}
              >
                <div className={`p-1.5 rounded-sm ${active ? 'bg-emerald-50' : ''}`}>
                  <item.Icon />
                </div>
                <span className={active ? 'font-semibold' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
