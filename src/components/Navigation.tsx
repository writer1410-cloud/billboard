'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


function GridIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1" />
      <rect x="8" y="0.5" width="5.5" height="5.5" rx="1" />
      <rect x="0.5" y="8" width="5.5" height="5.5" rx="1" />
      <rect x="8" y="8" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function UserIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="3.5" y="0.5" width="7" height="6" rx="3.5" />
      <path d="M0.5 13.5 C0.5 9.5 3 8 7 8 C11 8 13.5 9.5 13.5 13.5 Z" />
    </svg>
  );
}

function DocIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" width={size} height={size}>
      <rect x="1.5" y="0.5" width="11" height="13" rx="1.5" />
      <rect x="4" y="4" width="6" height="1" fill="white" rx="0.3" />
      <rect x="4" y="6.5" width="4.5" height="1" fill="white" rx="0.3" />
      <rect x="4" y="9" width="5.5" height="1" fill="white" rx="0.3" />
    </svg>
  );
}

function InvIcon({ size = 15 }: { size?: number }) {
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
  { href: '/', label: 'ダッシュボード', Icon: GridIcon },
  { href: '/clients', label: 'クライアント', Icon: UserIcon },
  { href: '/quotes', label: '見積書', Icon: DocIcon },
  { href: '/invoices', label: '請求書', Icon: InvIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="px-5 pt-6 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-emerald-600 rounded-sm grid grid-cols-2 gap-px p-1 shrink-0">
              <div className="bg-white" />
              <div className="bg-white/50" />
              <div className="bg-white/50" />
              <div className="bg-white" />
            </div>
            <h1 className="font-bold text-lg text-gray-900 tracking-tight">FreeBill</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 ml-[2.375rem]">請求管理システム</p>
        </div>
        <div className="mx-5 border-b border-gray-100" />
        <div className="flex-1 p-3 pt-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 text-sm transition-colors rounded-r-lg ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 font-medium border-l-[3px] border-emerald-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 border-l-[3px] border-transparent'
                }`}
              >
                <item.Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom navigation */}
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
