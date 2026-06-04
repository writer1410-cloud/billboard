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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'クライアント数', value: `${clientCount}社`, color: 'text-gray-900' },
          { label: '未入金合計', value: formatCurrency(unpaidAgg._sum.total ?? 0), color: 'text-yellow-600' },
          { label: '延滞請求書', value: `${overdueCount}件`, color: 'text-red-600' },
          { label: '今月の入金', value: formatCurrency(paidAgg._sum.total ?? 0), color: 'text-green-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">最近の見積書</h2>
            <Link href="/quotes" className="text-sm text-blue-600 hover:text-blue-700">すべて表示</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentQuotes.map((q) => (
              <Link key={q.id} href={`/quotes/${q.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-gray-900">{q.quoteNumber}</p>
                  <p className="text-xs text-gray-500">{q.client.name} · {q.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(q.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${QUOTE_STATUS_COLORS[q.status]}`}>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">最近の請求書</h2>
            <Link href="/invoices" className="text-sm text-blue-600 hover:text-blue-700">すべて表示</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentInvoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-sm text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{inv.client.name} · 期限: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(inv.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}>
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
