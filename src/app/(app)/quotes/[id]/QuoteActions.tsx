'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Quote {
  id: string;
  status: string;
  quoteNumber: string;
  title: string;
  total: number;
  validUntil: Date;
  items: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  notes: string | null;
  invoice: { id: string } | null;
}

export default function QuoteActions({ quote, clientEmail }: { quote: Quote; clientEmail: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (type: string) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/${type}`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error ?? 'エラー');
      if (type === 'convert') {
        const data = await res.json();
        router.push(`/invoices/${data.id}`);
      } else {
        router.refresh();
        alert(type === 'send' ? 'メールを送付しました' : 'ステータスを更新しました');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link href={`/quotes/${quote.id}/print`} target="_blank"
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
        🖨 印刷・PDF
      </Link>
      {quote.status !== 'SENT' && quote.status !== 'ACCEPTED' && (
        <button onClick={() => action('send')} disabled={loading === 'send'}
          className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-50 transition-colors">
          {loading === 'send' ? '送中...' : '✉ メール送付'}
        </button>
      )}
      {quote.status === 'SENT' && (
        <>
          <button onClick={() => action('accept')} disabled={loading === 'accept'}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading === 'accept' ? '処理中...' : '承認済みにする'}
          </button>
        </>
      )}
      {(quote.status === 'ACCEPTED' || quote.status === 'SENT') && !quote.invoice && (
        <button onClick={() => action('convert')} disabled={loading === 'convert'}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {loading === 'convert' ? '処理中...' : '請求書に変換'}
        </button>
      )}
    </div>
  );
}
