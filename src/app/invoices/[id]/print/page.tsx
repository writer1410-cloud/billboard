import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!invoice) notFound();

  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <title>請求書 {invoice.invoiceNumber}</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Hiragino Kaku Gothic Pro', 'Meiryo', sans-serif; font-size: 13px; color: #000; padding: 40px; }
          h1 { font-size: 24px; color: #059669; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-bottom: 20px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .meta-item { margin-bottom: 8px; }
          .meta-item label { font-size: 11px; color: #666; display: block; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f3f4f6; padding: 8px 10px; text-align: left; border: 1px solid #d1d5db; font-size: 12px; }
          td { padding: 8px 10px; border: 1px solid #d1d5db; font-size: 12px; }
          .right { text-align: right; }
          .totals { float: right; width: 260px; margin-top: 8px; }
          .totals tr td { border: none; padding: 4px 10px; }
          .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #000 !important; padding-top: 8px !important; }
          .notes { margin-top: 24px; padding: 12px; background: #f9fafb; border-radius: 4px; font-size: 12px; }
          .stamp { border: 2px solid #dc2626; color: #dc2626; display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-left: 12px; vertical-align: middle; }
          @media print { body { padding: 20px; } }
          .print-btn { position: fixed; top: 16px; right: 16px; background: #059669; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; }
          @media print { .print-btn { display: none; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" onClick={() => window.print()}>印刷 / PDF保存</button>
        <h1>
          請求書 {invoice.invoiceNumber}
          {invoice.status === 'PAID' && <span className="stamp">入金済</span>}
        </h1>
        <div className="meta">
          <div>
            <div className="meta-item"><label>宛先</label><strong>{invoice.client.name} 御中</strong></div>
            {invoice.client.address && <div className="meta-item"><label>住所</label><span>{invoice.client.address}</span></div>}
          </div>
          <div>
            <div className="meta-item"><label>発行日</label><span>{formatDate(invoice.issueDate)}</span></div>
            <div className="meta-item"><label>お支払い期限</label><strong>{formatDate(invoice.dueDate)}</strong></div>
            {invoice.paidAt && <div className="meta-item"><label>入金日</label><span>{formatDate(invoice.paidAt)}</span></div>}
          </div>
        </div>
        <p style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '15px' }}>{invoice.title}</p>
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
            {invoice.items.map((item) => (
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
            <tr><td>小計</td><td className="right">{formatCurrency(invoice.subtotal)}</td></tr>
            <tr><td>消費税 ({(invoice.taxRate * 100).toFixed(0)}%)</td><td className="right">{formatCurrency(invoice.tax)}</td></tr>
            <tr className="total-row"><td>請求金額</td><td className="right">{formatCurrency(invoice.total)}</td></tr>
          </tbody>
        </table>
        <div style={{ clear: 'both' }}></div>
        {invoice.notes && <div className="notes"><strong>備考:</strong> {invoice.notes}</div>}
        <div style={{ marginTop: '40px', fontSize: '11px', color: '#666', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <p>お振込先: {process.env.BANK_INFO ?? ''}</p>
        </div>
      </body>
    </html>
  );
}
