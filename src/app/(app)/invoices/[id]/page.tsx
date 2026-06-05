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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/invoices" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <span className={`text-sm px-2 py-1 rounded-sm ${INVOICE_STATUS_COLORS[invoice.status]}`}>
              {INVOICE_STATUS_LABELS[invoice.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{invoice.client.name} · {invoice.title}</p>
        </div>
        <InvoiceActions invoice={invoice} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
          <div><span className="text-gray-400">クライアント</span><p className="font-medium mt-0.5">{invoice.client.name}</p></div>
          <div><span className="text-gray-400">発行日</span><p className="font-medium mt-0.5">{formatDate(invoice.issueDate)}</p></div>
          <div><span className="text-gray-400">支払期限</span><p className={`font-medium mt-0.5 ${invoice.status === 'OVERDUE' ? 'text-red-600' : ''}`}>{formatDate(invoice.dueDate)}</p></div>
          <div><span className="text-gray-400">入金日</span><p className="font-medium mt-0.5 text-emerald-600">{invoice.paidAt ? formatDate(invoice.paidAt) : '-'}</p></div>
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
            {invoice.items.map((item) => (
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
            <div className="flex justify-between"><span className="text-gray-500">小計</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-gray-500">消費税 ({(invoice.taxRate * 100).toFixed(0)}%)</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
              <span>請求金額</span><span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{invoice.notes}</div>
        )}
      </div>

      {invoice.reminders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">リマインド履歴</h2>
          <div className="space-y-2">
            {invoice.reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-sm">
                <span className="text-red-500">⚠️</span>
                <span className="text-gray-600">{formatDate(r.sentAt)}に{r.type === 'OVERDUE' ? '延滞リマインド' : 'リマインド'}を送付</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {invoice.quote && (
        <div className="mt-4 text-sm text-gray-500">
          見積書: <Link href={`/quotes/${invoice.quote.id}`} className="text-emerald-600 hover:underline">{invoice.quote.quoteNumber}</Link>
        </div>
      )}
    </div>
  );
}
