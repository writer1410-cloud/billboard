import { prisma } from '@/lib/prisma';
import {
  formatCurrency, formatDate,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
  QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS,
} from '@/lib/utils';
import Link from 'next/link';

export default async function Dashboard() {
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
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { total: true },
      }),
    ]);

  const stats = [
    { label: 'クライアント数', value: `${clientCount}社`, color: 'text-gray-900' },
    { label: '未入金合計', value: formatCurrency(unpaidAgg._sum.total ?? 0), color: 'text-amber-600' },
    { label: '延滞請求書', value: `${overdueCount}件`, color: 'text-red-600' },
    { label: '今月の入金', value: formatCurrency(paidAgg._sum.total ?? 0), color: 'text-emerald-600' },
  ];

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-1 h-6 bg-emerald-600 rounded-none shrink-0" />
        <h1 className="text-xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 pb-8 mb-8 border-b border-gray-100">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Recent quotes */}
        <div className="pb-8 lg:pb-0 lg:pr-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-600 rounded-none" />
              最近の見積書
            </h2>
            <Link href="/quotes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              すべて表示 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/quotes/${q.id}`}
                className="flex items-center justify-between py-3 hover:bg-emerald-50/40 -mx-2 px-2 transition-colors"
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
              <p className="text-sm text-gray-400 py-6">見積書がありません</p>
            )}
          </div>
        </div>

        {/* Recent invoices */}
        <div className="pt-8 lg:pt-0 lg:pl-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <div className="w-1 h-4 bg-emerald-600 rounded-none" />
              最近の請求書
            </h2>
            <Link href="/invoices" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              すべて表示 →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between py-3 hover:bg-emerald-50/40 -mx-2 px-2 transition-colors"
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
              <p className="text-sm text-gray-400 py-6">請求書がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
