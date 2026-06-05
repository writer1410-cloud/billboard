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
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-8">
        <Link href="/quotes" className="text-gray-400 hover:text-gray-600 mt-1">←</Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{quote.quoteNumber}</h1>
            <span className={`text-xs px-2 py-1 rounded-sm ${QUOTE_STATUS_COLORS[quote.status]}`}>
              {QUOTE_STATUS_LABELS[quote.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{quote.client.name} · {quote.title}</p>
        </div>
        <QuoteActions quote={quote} clientEmail={quote.client.email} />
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pb-6 mb-6 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">クライアント</p>
          <p className="font-medium text-gray-900">{quote.client.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">発行日</p>
          <p className="font-medium text-gray-900">{formatDate(quote.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">有効期限</p>
          <p className="font-medium text-gray-900">{formatDate(quote.validUntil)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">送付日</p>
          <p className="font-medium text-gray-900">{quote.sentAt ? formatDate(quote.sentAt) : '未送付'}</p>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-cyan-500">
            <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">品目・内容</th>
            <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">数量</th>
            <th className="hidden sm:table-cell text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">単価</th>
            <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">金額</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {quote.items.map((item) => (
            <tr key={item.id}>
              <td className="py-3 pr-4 text-sm text-gray-900">{item.description}</td>
              <td className="py-3 pr-4 text-sm text-right text-gray-600">{item.quantity}</td>
              <td className="hidden sm:table-cell py-3 pr-4 text-sm text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
              <td className="py-3 text-sm text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end pb-6 mb-6 border-b border-gray-100">
        <div className="w-52 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>小計</span>
            <span>{formatCurrency(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>消費税 ({(quote.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatCurrency(quote.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 text-gray-900">
            <span>合計</span>
            <span>{formatCurrency(quote.total)}</span>
          </div>
        </div>
      </div>

      {quote.notes && (
        <p className="text-sm text-gray-600 mb-6">{quote.notes}</p>
      )}

      {quote.invoice && (
        <div className="border-l-4 border-cyan-500 pl-4 py-1 text-sm">
          <span className="text-gray-500">請求書: </span>
          <Link href={`/invoices/${quote.invoice.id}`} className="font-medium text-cyan-600 hover:underline">
            {quote.invoice.invoiceNumber}
          </Link>
        </div>
      )}
    </div>
  );
}
