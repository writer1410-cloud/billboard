'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '📊' },
  { href: '/clients', label: 'クライアント', icon: '👥' },
  { href: '/quotes', label: '見積書', icon: '📝' },
  { href: '/invoices', label: '請求書', icon: '💰' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-200">
        <h1 className="font-bold text-lg text-gray-900">FreeBill</h1>
        <p className="text-xs text-gray-500">請求管理システム</p>
      </div>
      <div className="flex-1 p-3">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
