import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency, formatDate, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/utils';

export default async function QuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">見積書</h1>
        <Link href="/quotes/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          + 新規見積書
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">見積番号</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">クライアント</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">件名</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">金額</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">有効期限</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/quotes/${q.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700 text-sm">{q.quoteNumber}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{q.client.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{q.title}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(q.total)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(q.validUntil)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {quotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">見積書がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
