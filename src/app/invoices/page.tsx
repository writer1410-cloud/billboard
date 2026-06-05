import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '@/lib/utils';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const invoices = await prisma.invoice.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });

  const statuses = ['', 'UNPAID', 'PAID', 'OVERDUE', 'CANCELLED'];
  const statusLabels: Record<string, string> = { '': 'すべて', UNPAID: '未入金', PAID: '入金済み', OVERDUE: '延滞', CANCELLED: 'キャンセル' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">請求書</h1>
        <Link href="/invoices/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + 新規請求書
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map((s) => (
          <Link key={s} href={s ? `/invoices?status=${s}` : '/invoices'}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              (status ?? '') === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {statusLabels[s]}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">請求番号</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">クライアント</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">件名</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">金額</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">期限</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/invoices/${inv.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700 text-sm">{inv.invoiceNumber}</Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{inv.client.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{inv.title}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(inv.total)}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">請求書がありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
