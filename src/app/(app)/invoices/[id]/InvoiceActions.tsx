'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Invoice {
  id: string;
  status: string;
  invoiceNumber: string;
}

export default function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (type: string) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/${type}`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'エラー');
      router.refresh();
      const msgs: Record<string, string> = {
        send: '請求書をメール送付しました',
        pay: '入金済みに更新しました',
        remind: 'リマインドメールを送付しました',
      };
      alert(msgs[type] ?? '更新しました');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/invoices/${invoice.id}/print`} target="_blank"
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        🖨 印刷・PDF
      </Link>
      {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
        <>
          {!invoice.status.includes('SENT') && (
            <button onClick={() => action('send')} disabled={loading === 'send'}
              className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors">
              {loading === 'send' ? '送中...' : '✉ メール送付'}
            </button>
          )}
          {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE') && (
            <>
              <button onClick={() => action('remind')} disabled={loading === 'remind'}
                className="px-3 py-1.5 border border-orange-200 text-orange-600 rounded-lg text-sm hover:bg-orange-50 disabled:opacity-50 transition-colors">
                {loading === 'remind' ? '送中...' : '🔔 リマインド'}
              </button>
              <button onClick={() => action('pay')} disabled={loading === 'pay'}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">
                {loading === 'pay' ? '処理中...' : '✓ 入金確認'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
