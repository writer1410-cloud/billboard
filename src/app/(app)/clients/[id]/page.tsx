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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-2 text-sm">
          <h2 className="font-semibold text-gray-700 mb-1">連絡先情報</h2>
          <p><span className="text-gray-400">メール:</span>{' '}
            <a href={`mailto:${client.email}`} className="text-emerald-600">{client.email}</a>
          </p>
          {client.phone && <p><span className="text-gray-400">電話:</span> {client.phone}</p>}
          {client.address && <p><span className="text-gray-400">住所:</span> {client.address}</p>}
          <p><span className="text-gray-400">登録日:</span> {formatDate(client.createdAt)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">合計請求額</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">入金済み合計</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">見積書 ({client.quotes.length}件)</h2>
            <Link href={`/quotes/new?clientId=${client.id}`} className="text-sm text-emerald-600 hover:text-emerald-700">+ 新規</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {client.quotes.map((q) => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{q.quoteNumber}</p>
                  <p className="text-xs text-gray-500">{q.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(q.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${QUOTE_STATUS_COLORS[q.status]}`}>
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              </Link>
            ))}
            {client.quotes.length === 0 && <p className="text-sm text-gray-400 text-center py-6">見積書なし</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">請求書 ({client.invoices.length}件)</h2>
            <Link href={`/invoices/new?clientId=${client.id}`} className="text-sm text-emerald-600 hover:text-emerald-700">+ 新規</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {client.invoices.map((inv) => (
              <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">期限: {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(inv.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-sm ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </div>
              </Link>
            ))}
            {client.invoices.length === 0 && <p className="text-sm text-gray-400 text-center py-6">請求書なし</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
