'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateQuoteNumber, formatDateInput, addDays } from '@/lib/utils';

interface Client { id: string; name: string; email: string; }
interface Item { description: string; quantity: number; unitPrice: number; amount: number; }

export default function QuoteForm({ clients, defaultClientId }: { clients: Client[]; defaultClientId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    quoteNumber: generateQuoteNumber(),
    clientId: defaultClientId ?? '',
    title: '',
    taxRate: 0.1,
    validUntil: formatDateInput(addDays(new Date(), 30)),
    notes: '',
  });
  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]);

  const updateItem = (i: number, field: keyof Item, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      updated[i].amount = updated[i].quantity * updated[i].unitPrice;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((s, item) => s + item.amount, 0);
  const tax = Math.floor(subtotal * form.taxRate);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items, subtotal, tax, total }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'エラー');
      const quote = await res.json();
      router.push(`/quotes/${quote.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quotes" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
        <h1 className="text-2xl font-bold text-gray-900">新規見積書</h1>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">見積番号 *</label>
              <input type="text" required value={form.quoteNumber}
                onChange={(e) => setForm({ ...form, quoteNumber: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">クライアント *</label>
              <select required value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">選択してください</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">件名 *</label>
              <input type="text" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Webサイト制作"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">有効期限 *</label>
              <input type="date" required value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">消費税率</label>
              <select value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value={0.1}>10%</option>
                <option value={0.08}>8%</option>
                <option value={0}>非課税</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">明細</h2>
            <button type="button"
              onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }])}
              className="text-sm text-cyan-600 hover:text-cyan-700">+ 行追加</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-xs text-gray-500 font-medium w-1/2">品目・内容</th>
                <th className="text-right pb-2 text-xs text-gray-500 font-medium w-16">数量</th>
                <th className="text-right pb-2 text-xs text-gray-500 font-medium w-32">単価</th>
                <th className="text-right pb-2 text-xs text-gray-500 font-medium w-32">金額</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 pr-2">
                    <input type="text" required value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                      placeholder="サービス内容"
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="1" step="0.1" required value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  </td>
                  <td className="py-2 pr-2">
                    <input type="number" min="0" step="1" required value={item.unitPrice}
                      onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                  </td>
                  <td className="py-2 pr-2 text-right text-sm font-medium text-gray-700">
                    ¥{item.amount.toLocaleString('ja-JP')}
                  </td>
                  <td className="py-2">
                    {items.length > 1 && (
                      <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 text-sm text-right">
            <p className="text-gray-600">小計: ¥{subtotal.toLocaleString('ja-JP')}</p>
            <p className="text-gray-600">消費税 ({(form.taxRate * 100).toFixed(0)}%): ¥{tax.toLocaleString('ja-JP')}</p>
            <p className="text-lg font-bold text-gray-900">合計: ¥{total.toLocaleString('ja-JP')}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">備考・注記</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3} placeholder="支払条件、備考など"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-cyan-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 transition-colors">
            {loading ? '保存中...' : '見積書を作成'}
          </button>
          <Link href="/quotes"
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
