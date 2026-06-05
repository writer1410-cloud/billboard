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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-cyan-600 rounded-none shrink-0" />
          <h1 className="text-xl font-bold text-gray-900">見積書</h1>
        </div>
        <Link
          href="/quotes/new"
          className="bg-cyan-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          + 新規見積書
        </Link>
      </div>

      {quotes.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">見積書がありません</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-cyan-500">
              <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">見積番号</th>
              <th className="hidden sm:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">クライアント</th>
              <th className="hidden md:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">件名</th>
              <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">金額</th>
              <th className="hidden sm:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide pl-4">有効期限</th>
              <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide pl-4">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {quotes.map((q) => (
              <tr key={q.id} className="hover:bg-cyan-50/30 transition-colors">
                <td className="py-3 pr-4">
                  <Link
                    href={`/quotes/${q.id}`}
                    className="font-medium text-cyan-600 hover:text-cyan-700 text-sm"
                  >
                    {q.quoteNumber}
                  </Link>
                  <p className="text-xs text-gray-400 sm:hidden mt-0.5">{q.client.name}</p>
                </td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-600">{q.client.name}</td>
                <td className="hidden md:table-cell py-3 pr-4 text-sm text-gray-700 max-w-[160px] truncate">{q.title}</td>
                <td className="py-3 pr-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(q.total)}</td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500 pl-4">{formatDate(q.validUntil)}</td>
                <td className="py-3 pl-4">
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
