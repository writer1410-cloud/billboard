import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  formatCurrency, formatDate,
  INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS,
} from '@/lib/utils';
import InvoiceActions from './InvoiceActions';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      items: { orderBy: { sortOrder: 'asc' } },
      quote: true,
      reminders: { orderBy: { sentAt: 'desc' } },
    },
  });

  if (!invoice) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3 mb-8">
        <Link href="/invoices" className="text-gray-400 hover:text-gray-600 mt-1">←</Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <span className={`text-xs px-2 py-1 rounded-sm ${INVOICE_STATUS_COLORS[invoice.status]}`}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{invoice.client.name} · {invoice.title}</p>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm pb-6 mb-6 border-b border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">クライアント</p>
          <p className="font-medium text-gray-900">{invoice.client.name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">発行日</p>
          <p className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">支払期限</p>
          <p className={`font-medium ${invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-900'}`}>
            {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">入金日</p>
          <p className={`font-medium ${invoice.paidAt ? 'text-cyan-600' : 'text-gray-400'}`}>
            {invoice.paidAt ? formatDate(invoice.paidAt) : '—'}
          </p>
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
          {invoice.items.map((item) => (
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
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>消費税 ({(invoice.taxRate * 100).toFixed(0)}%)</span>
            <span>{formatCurrency(invoice.tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 text-gray-900">
            <span>請求金額</span>
            <span>{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <p className="text-sm text-gray-600 mb-6">{invoice.notes}</p>
      )}

      {invoice.reminders.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">リマインド履歴</p>
          <div className="space-y-2">
            {invoice.reminders.map((r) => (
              <p key={r.id} className="text-sm text-gray-600">
                {formatDate(r.sentAt)} — {r.type === 'OVERDUE' ? '延滞リマインド' : 'リマインド'}送付
              </p>
            ))}
          </div>
        </div>
      )}

      {invoice.quote && (
        <p className="text-sm text-gray-500">
          見積書:{' '}
          <Link href={`/quotes/${invoice.quote.id}`} className="text-cyan-600 hover:underline">
            {invoice.quote.quoteNumber}
          </Link>
        </p>
      )}
    </div>
  );
}
