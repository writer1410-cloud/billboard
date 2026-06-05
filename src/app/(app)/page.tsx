import { prisma } from '@/lib/prisma';
import {
  formatCurrency, formatDate,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
  QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS,
} from '@/lib/utils';
import Link from 'next/link';

function SectionWave() {
  return (
    <svg
      viewBox="0 0 500 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 10, display: 'block' }}
      preserveAspectRatio="none"
    >
      <path
        d="M0 5 C62.5 0 125 10 187.5 5 C250 0 312.5 10 375 5 C437.5 0 468.75 7.5 500 5 V10 H0 Z"
        fill="#059669"
        fillOpacity="0.06"
      />
      <path
        d="M0 5 C62.5 0 125 10 187.5 5 C250 0 312.5 10 375 5 C437.5 0 468.75 7.5 500 5"
        stroke="#059669"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
    </svg>
  );
}

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
    {
      label: 'クライアント数',
      value: `${clientCount}社`,
      color: 'text-gray-900',
      accent: '#059669',
    },
    {
      label: '未入金合計',
      value: formatCurrency(unpaidAgg._sum.total ?? 0),
      color: 'text-amber-600',
      accent: '#d97706',
    },
    {
      label: '延滞請求書',
      value: `${overdueCount}件`,
      color: 'text-red-600',
      accent: '#dc2626',
    },
    {
      label: '今月の入金',
      value: formatCurrency(paidAgg._sum.total ?? 0),
      color: 'text-emerald-600',
      accent: '#059669',
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-1 h-6 bg-emerald-600 rounded-sm" />
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 relative"
          >
            <div className="h-1 w-full" style={{ backgroundColor: stat.accent, opacity: 0.7 }} />
            <div className="p-3 sm:p-5">
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">最近の見積書</h2>
              <Link href="/quotes" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                すべて表示 →
              </Link>
            </div>
            <SectionWave />
          </div>
          <div className="divide-y divide-gray-50">
            {recentQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/quotes/${q.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-emerald-50/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{q.quoteNumber}</p>
                  <p className="text-xs text-gray-500">{q.client.name} · {q.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(q.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              </Link>
            ))}
            {recentQuotes.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">見積書がありません</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 pt-5 pb-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">最近の請求書</h2>
              <Link href="/invoices" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                すべて表示 →
              </Link>
            </div>
            <SectionWave />
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-emerald-50/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.client.name} · 期限: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </div>
              </Link>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">請求書がありません</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
