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
  const statusLabels: Record<string, string> = {
    '': 'すべて',
    UNPAID: '未入金',
    PAID: '入金済み',
    OVERDUE: '延滞',
    CANCELLED: 'キャンセル',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-emerald-600 rounded-none shrink-0" />
          <h1 className="text-xl font-bold text-gray-900">請求書</h1>
        </div>
        <Link
          href="/invoices/new"
          className="bg-emerald-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          + 新規請求書
        </Link>
      </div>

      {/* Tab-style status filter */}
      <div className="flex border-b border-gray-200 mb-6 gap-0 overflow-x-auto">
        {statuses.map((s) => {
          const active = (status ?? '') === s;
          return (
            <Link
              key={s}
              href={s ? `/invoices?status=${s}` : '/invoices'}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-emerald-600 text-emerald-700 font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {statusLabels[s]}
            </Link>
          );
        })}
      </div>

      {invoices.length === 0 ? (
        <p className="text-gray-400 py-16 text-center">請求書がありません</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-emerald-500">
              <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">請求番号</th>
              <th className="hidden sm:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">クライアント</th>
              <th className="hidden md:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">件名</th>
              <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">金額</th>
              <th className="hidden sm:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide pl-4">期限</th>
              <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide pl-4">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-emerald-50/30 transition-colors">
                <td className="py-3 pr-4">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="font-medium text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    {inv.invoiceNumber}
                  </Link>
                  <p className="text-xs text-gray-400 sm:hidden mt-0.5">{inv.client.name}</p>
                </td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-600">{inv.client.name}</td>
                <td className="hidden md:table-cell py-3 pr-4 text-sm text-gray-700 max-w-[160px] truncate">{inv.title}</td>
                <td className="py-3 pr-4 text-sm font-semibold text-gray-900 text-right">{formatCurrency(inv.total)}</td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-500 pl-4">{formatDate(inv.dueDate)}</td>
                <td className="py-3 pl-4">
                  <span className={`text-xs px-1.5 py-0.5 rounded-sm ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
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
