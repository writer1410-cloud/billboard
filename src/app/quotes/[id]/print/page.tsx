import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!quote) notFound();

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>見積書 {quote.quoteNumber}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif; font-size: 13px; color: #000; padding: 40px; }
          h1 { font-size: 24px; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 20px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .meta-item label { font-size: 11px; color: #666; display: block; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f3f4f6; padding: 8px 10px; text-align: left; border: 1px solid #d1d5db; font-size: 12px; }
          td { padding: 8px 10px; border: 1px solid #d1d5db; font-size: 12px; }
          .right { text-align: right; }
          .totals { float: right; width: 260px; margin-top: 8px; }
          .totals tr td { border: none; padding: 4px 10px; }
          .total-row { font-weight: bold; font-size: 15px; border-top: 2px solid #000 !important; }
          .notes { margin-top: 24px; padding: 12px; background: #f9fafb; border-radius: 4px; font-size: 12px; }
          @media print { body { padding: 20px; } }
          .print-btn { position: fixed; top: 16px; right: 16px; background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
          @media print { .print-btn { display: none; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick={() => window.print()}>印刷 / PDF保存</button>
        <h1>見積書 {quote.quoteNumber}</h1>
        <div className="meta">
          <div>
            <div className="meta-item"><label>宛先</label><strong>{quote.client.name} 御中</strong></div>
          </div>
          <div>
            <div className="meta-item" style={{ marginBottom: '8px' }}><label>発行日</label><span>{formatDate(quote.createdAt)}</span></div>
            <div className="meta-item"><label>有効期限</label><span>{formatDate(quote.validUntil)}</span></div>
          </div>
        </div>
        <p style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '15px' }}>{quote.title}</p>
        <table>
          <thead>
            <tr>
              <th style={{ width: '50%' }}>品目・内容</th>
              <th className="right" style={{ width: '10%' }}>数量</th>
              <th className="right" style={{ width: '20%' }}>単価</th>
              <th className="right" style={{ width: '20%' }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="right">{item.quantity}</td>
                <td className="right">{formatCurrency(item.unitPrice)}</td>
                <td className="right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="totals">
          <tbody>
            <tr><td>小計</td><td className="right">{formatCurrency(quote.subtotal)}</td></tr>
            <tr><td>消費税 ({(quote.taxRate * 100).toFixed(0)}%)</td><td className="right">{formatCurrency(quote.tax)}</td></tr>
            <tr className="total-row"><td>合計</td><td className="right">{formatCurrency(quote.total)}</td></tr>
          </tbody>
        </table>
        <div style={{ clear: 'both' }}></div>
        {quote.notes && <div className="notes"><strong>備考:</strong> {quote.notes}</div>}
      </body>
    </html>
  );
}
