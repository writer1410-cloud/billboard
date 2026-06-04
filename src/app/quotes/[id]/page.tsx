import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  formatCurrency, formatDate,
  QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS,
} from '@/lib/utils';
import QuoteActions from './QuoteActions';

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
      invoice: true,
    },
  });

  if (!quote) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quotes" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{quote.quoteNumber}</h1>
            <span className={`text-sm px-2 py-1 rounded-full ${QUOTE_STATUS_COLORS[quote.status]}`}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{quote.client.name} · {quote.title}</p>
        </div>
        <QuoteActions quote={quote} clientEmail={quote.client.email} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div><span className="text-gray-400">クライアント</span><p className="font-medium mt-0.5">{quote.client.name}</p></div>
          <div><span className="text-gray-400">発行日</span><p className="font-medium mt-0.5">{formatDate(quote.createdAt)}</p></div>
          <div><span className="text-gray-400">有効期限</span><p className="font-medium mt-0.5">{formatDate(quote.validUntil)}</p></div>
          <div><span className="text-gray-400">送付日</span><p className="font-medium mt-0.5">{quote.sentAt ? formatDate(quote.sentAt) : '未送付'}</p></div>
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left pb-2 text-sm font-medium text-gray-600">品目・内容</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-600">数量</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-600">単価</th>
              <th className="text-right pb-2 text-sm font-medium text-gray-600">金額</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 text-sm">{item.description}</td>
                <td className="py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                <td className="py-3 text-sm text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">小計</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">消費税 ({(quote.taxRate * 100).toFixed(0)}%)</span>
              <span>{formatCurrency(quote.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
              <span>合計</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {quote.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{quote.notes}</div>
        )}
      </div>

      {quote.invoice && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <span className="text-green-700">請求書が発行されました: </span>
          <Link href={`/invoices/${quote.invoice.id}`} className="font-medium text-green-700 hover:underline">
            {quote.invoice.invoiceNumber}
          </Link>
        </div>
      )}
    </div>
  );
}
