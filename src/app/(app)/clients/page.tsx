import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { quotes: true, invoices: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-cyan-600 rounded-none shrink-0" />
          <h1 className="text-xl font-bold text-gray-900">クライアント</h1>
        </div>
        <Link
          href="/clients/new"
          className="bg-cyan-600 text-white px-4 py-2 rounded-sm text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          + 新規クライアント
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 mb-3">クライアントがいません</p>
          <Link href="/clients/new" className="text-cyan-600 text-sm hover:underline">
            最初のクライアントを追加
          </Link>
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-cyan-500">
              <th className="text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">名前</th>
              <th className="hidden sm:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">メール</th>
              <th className="hidden md:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">電話</th>
              <th className="text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">見積</th>
              <th className="hidden sm:table-cell text-right pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">請求</th>
              <th className="hidden md:table-cell text-left pb-2 text-xs font-medium text-gray-500 uppercase tracking-wide pl-4">登録日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-cyan-50/30 transition-colors">
                <td className="py-3 pr-4">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-gray-900 hover:text-cyan-600 text-sm"
                  >
                    {client.name}
                  </Link>
                  <p className="text-xs text-gray-400 sm:hidden mt-0.5">{client.email}</p>
                </td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-gray-600">{client.email}</td>
                <td className="hidden md:table-cell py-3 pr-4 text-sm text-gray-600">{client.phone ?? '—'}</td>
                <td className="py-3 pr-4 text-sm text-right text-gray-600">
                  {client._count.quotes}
                  <span className="hidden sm:inline">件</span>
                </td>
                <td className="hidden sm:table-cell py-3 pr-4 text-sm text-right text-gray-600">{client._count.invoices}件</td>
                <td className="hidden md:table-cell py-3 text-sm text-gray-500 pl-4">{formatDate(client.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
