import { prisma } from '@/lib/prisma';
import {
  formatCurrency, formatDate,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
  QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS,
} from '@/lib/utils';
import Link from 'next/link';

function GridIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" width={22} height={22}>
      <rect x="1" y="1" width="7" height="7" rx="1.5" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" width={22} height={22}>
      <rect x="4.5" y="1" width="9" height="8" rx="4.5" />
      <path d="M0.5 17 C0.5 12 4 10 9 10 C14 10 17.5 12 17.5 17 Z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" width={22} height={22}>
      <rect x="2" y="1" width="14" height="16" rx="2" />
      <rect x="5" y="5" width="8" height="1.5" fill="white" rx="0.5" />
      <rect x="5" y="8.5" width="6" height="1.5" fill="white" rx="0.5" />
      <rect x="5" y="12" width="7" height="1.5" fill="white" rx="0.5" />
    </svg>
  );
}

function InvIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" width={22} height={22}>
      <rect x="2" y="1" width="14" height="16" rx="2" />
      <rect x="5" y="4.5" width="8" height="1.5" fill="white" rx="0.5" />
      <rect x="5" y="7.5" width="5" height="1.5" fill="white" rx="0.5" />
      <rect x="7.5" y="10.5" width="3" height="4" fill="white" rx="0.3" />
      <rect x="5.5" y="12" width="7" height="1" fill="white" rx="0.3" />
      <rect x="5.5" y="13.5" width="7" height="1" fill="white" rx="0.3" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" width={22} height={22}>
      <rect x="1" y="2" width="16" height="3" rx="1" />
      <rect x="1" y="7.5" width="16" height="3" rx="1" />
      <rect x="1" y="13" width="16" height="3" rx="1" />
    </svg>
  );
}

export default async function Dashboard() {
  const now = new Date();
  const dateStr = new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  }).format(now);

  const [clientCount, recentQuotes, recentInvoices, unpaidAgg, overdueCount, paidAgg] =
    await Promise.all([
      prisma.client.count(),
      prisma.quote.findMany({
        take: 5, orderBy: { createdAt: 'desc' }, include: { client: true },
      }),
      prisma.invoice.findMany({
        take: 5, orderBy: { createdAt: 'desc' }, include: { client: true },
      }),
      prisma.invoice.aggregate({
        where: { status: { in: ['UNPAID', 'OVERDUE'] } }, _sum: { total: true },
      }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
      prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
        _sum: { total: true },
      }),
    ]);

  const stats = [
    { label: 'クライアント数', value: `${clientCount}社` },
    { label: '未入金合計', value: formatCurrency(unpaidAgg._sum.total ?? 0) },
    { label: '延滞請求書', value: `${overdueCount}件` },
    { label: '今月の入金', value: formatCurrency(paidAgg._sum.total ?? 0) },
  ];

  const quickActions = [
    { href: '/quotes/new', label: '新規見積書', Icon: DocIcon },
    { href: '/invoices/new', label: '新規請求書', Icon: InvIcon },
    { href: '/clients/new', label: '新規クライアント', Icon: UserIcon },
    { href: '/invoices', label: '請求書一覧', Icon: ListIcon },
  ];

  return (
    <div>
      {/* ─── Hero section ─── */}
      <div className="-mx-4 md:-mx-8 -mt-6 bg-emerald-600 text-white mb-6">
        <div className="px-5 md:px-8 pt-6 pb-6">

          {/* Title + date */}
          <div className="mb-5">
            <h1 className="text-xl font-bold">ダッシュボード</h1>
            <p className="text-emerald-200 text-sm mt-0.5">{dateStr}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-sm px-4 py-3">
                <p className="text-lg font-bold leading-tight">{stat.value}</p>
                <p className="text-xs text-emerald-200 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="bg-emerald-700 hover:bg-emerald-800 rounded-sm px-3 py-3 flex flex-col items-center gap-2 transition-colors text-center"
              >
                <action.Icon />
                <span className="text-xs font-medium leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent items ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent quotes */}
        <div className="bg-white rounded-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-sm text-gray-900">最近の見積書</h2>
            <Link href="/quotes" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              すべて表示 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/quotes/${q.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-medium text-sm text-gray-900 truncate">{q.quoteNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{q.client.name} · {q.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(q.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              </Link>
            ))}
            {recentQuotes.length === 0 && (
              <p className="text-sm text-gray-400 px-4 py-6">見積書がありません</p>
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="bg-white rounded-sm border border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-sm text-gray-900">最近の請求書</h2>
            <Link href="/invoices" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
              すべて表示 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-medium text-sm text-gray-900 truncate">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{inv.client.name} · 期限: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </div>
              </Link>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-sm text-gray-400 px-4 py-6">請求書がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
