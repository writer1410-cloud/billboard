import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '@/lib/utils';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { createdAt: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!client) notFound();

  const totalInvoiced = client.invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = client.invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + i.total, 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600">←</Link>
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-cyan-600 rounded-none shrink-0" />
          <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
        </div>
      </div>

      {/* Client info + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 mb-8 border-b border-gray-100">
        <div className="space-y-2 text-sm sm:col-span-1">
          <p className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-3">連絡先情報</p>
          <p>
            <span className="text-gray-400">メール: </span>
            <a href={`mailto:${client.email}`} className="text-cyan-600">{client.email}</a>
          </p>
          {client.phone && <p><span className="text-gray-400">電話: </span>{client.phone}</p>}
          {client.address && <p><span className="text-gray-400">住所: </span>{client.address}</p>}
          <p><span className="text-gray-400">登録日: </span>{formatDate(client.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">合計請求額</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">入金済み合計</p>
          <p className="text-2xl font-bold text-cyan-600">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
        {/* Quotes */}
        <div className="pb-8 lg:pb-0 lg:pr-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">見積書 ({client.quotes.length}件)</h2>
            <Link href={`/quotes/new?clientId=${client.id}`} className="text-sm text-cyan-600 hover:text-cyan-700">+ 新規</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {client.quotes.map((q) => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between py-3 hover:bg-cyan-50/30 -mx-2 px-2 transition-colors">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium text-gray-900">{q.quoteNumber}</p>
                  <p className="text-xs text-gray-500 truncate">{q.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatCurrency(q.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              </Link>
            ))}
            {client.quotes.length === 0 && <p className="text-sm text-gray-400 py-6">見積書なし</p>}
          </div>
        </div>

        {/* Invoices */}
        <div className="pt-8 lg:pt-0 lg:pl-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">請求書 ({client.invoices.length}件)</h2>
            <Link href={`/invoices/new?clientId=${client.id}`} className="text-sm text-cyan-600 hover:text-cyan-700">+ 新規</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {client.invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between py-3 hover:bg-cyan-50/30 -mx-2 px-2 transition-colors">
                <div className="min-w-0 pr-3">
                  <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">期限: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{formatCurrency(inv.total)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </div>
              </Link>
            ))}
            {client.invoices.length === 0 && <p className="text-sm text-gray-400 py-6">請求書なし</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
