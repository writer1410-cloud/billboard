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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">クライアント</h1>
        <Link href="/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + 新規クライアント
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">名前</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">メール</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">電話</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">見積</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">請求</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">登録日</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/clients/${client.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600 text-sm">
                    {client.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.phone ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{client._count.quotes}件</td>
                <td className="px-4 py-3 text-sm text-right text-gray-600">{client._count.invoices}件</td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(client.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {clients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">クライアントがいません</p>
            <Link href="/clients/new" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              最初のクライアントを追加
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
