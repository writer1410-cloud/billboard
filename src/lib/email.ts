import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

function fmt(amount: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}
function fmtDate(date: Date) {
  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function itemsTable(items: LineItem[]) {
  return items.map(i => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.description}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmt(i.unitPrice)}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${fmt(i.amount)}</td>
    </tr>`).join('');
}

function baseHtml(accentColor: string, heading: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#1f2937">
<h1 style="color:${accentColor};border-bottom:2px solid ${accentColor};padding-bottom:10px">${heading}</h1>
${body}
<p style="color:#6b7280;font-size:0.875em;margin-top:40px;border-top:1px solid #e5e7eb;padding-top:20px">${process.env.FROM_NAME || ''}</p>
</body></html>`;
}

export async function sendQuoteEmail(params: {
  to: string; clientName: string; quoteNumber: string; title: string;
  total: number; validUntil: Date; items: LineItem[]; notes?: string | null;
}) {
  const body = `
    <p>${params.clientName} 御中</p>
    <p>いつもお世話になっております。<br>下記の通り見積書をご送付いたします。</p>
    <h2 style="color:#374151">${params.title}</h2>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead><tr style="background:#f3f4f6">
        <th style="padding:10px;text-align:left;border-bottom:2px solid #d1d5db">品目</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">数量</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">単価</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">金額</th>
      </tr></thead>
      <tbody>${itemsTable(params.items)}</tbody>
    </table>
    <div style="text-align:right;margin:20px 0"><strong style="font-size:1.2em">合計金額: ${fmt(params.total)}</strong></div>
    <p>有効期限: ${fmtDate(params.validUntil)}</p>
    ${params.notes ? `<p style="background:#f9fafb;padding:12px;border-radius:4px">${params.notes}</p>` : ''}
    <p>ご不明点がございましたらお気軽にお問い合わせください。</p>`;
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: params.to,
    subject: `【見積書】${params.quoteNumber} ${params.title}`,
    html: baseHtml('#2563eb', `見積書 ${params.quoteNumber}`, body),
  });
}

export async function sendInvoiceEmail(params: {
  to: string; clientName: string; invoiceNumber: string; title: string;
  total: number; dueDate: Date; items: LineItem[]; notes?: string | null;
}) {
  const body = `
    <p>${params.clientName} 御中</p>
    <p>いつもお世話になっております。<br>下記の通り請求書をご送付いたします。</p>
    <h2 style="color:#374151">${params.title}</h2>
    <table style="width:100%;border-collapse:collapse;margin:20px 0">
      <thead><tr style="background:#f3f4f6">
        <th style="padding:10px;text-align:left;border-bottom:2px solid #d1d5db">品目</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">数量</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">単価</th>
        <th style="padding:10px;text-align:right;border-bottom:2px solid #d1d5db">金額</th>
      </tr></thead>
      <tbody>${itemsTable(params.items)}</tbody>
    </table>
    <div style="text-align:right;margin:20px 0"><strong style="font-size:1.2em">請求金額: ${fmt(params.total)}</strong></div>
    <p><strong>お支払い期限: ${fmtDate(params.dueDate)}</strong></p>
    ${params.notes ? `<p style="background:#f9fafb;padding:12px;border-radius:4px">${params.notes}</p>` : ''}
    <p>お振込の際は、以下の口座をご利用ください。<br>${process.env.BANK_INFO || ''}</p>`;
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: params.to,
    subject: `【請求書】${params.invoiceNumber} ${params.title}`,
    html: baseHtml('#059669', `請求書 ${params.invoiceNumber}`, body),
  });
}

export async function sendReminderEmail(params: {
  to: string; clientName: string; invoiceNumber: string; title: string;
  total: number; dueDate: Date; daysOverdue: number;
}) {
  const body = `
    <p>${params.clientName} 御中</p>
    <p>いつもお世話になっております。</p>
    <p>以下の請求書のお支払い期限を<strong>${params.daysOverdue}日</strong>超過しておりますので、ご確認をお願いいたします。</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0">
      <p><strong>請求書番号:</strong> ${params.invoiceNumber}</p>
      <p><strong>件名:</strong> ${params.title}</p>
      <p><strong>請求金額:</strong> ${fmt(params.total)}</p>
      <p><strong>お支払い期限:</strong> ${fmtDate(params.dueDate)}</p>
    </div>
    <p>お支払いが完了している場合は、行き違いをご容赦ください。</p>`;
  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: params.to,
    subject: `【重要】お支払いのご確認 - ${params.invoiceNumber}`,
    html: baseHtml('#dc2626', 'お支払いのご確認', body),
  });
}
