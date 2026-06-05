export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `Q-${year}-${random}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${year}-${random}`;
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: '下書き',
  SENT: '送付済み',
  ACCEPTED: '承認済み',
  REJECTED: '却下',
  EXPIRED: '期限切れ',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  UNPAID: '未入金',
  PAID: '入金済み',
  OVERDUE: '延滞',
  CANCELLED: 'キャンセル',
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SENT: 'bg-cyan-50 text-cyan-700',
  ACCEPTED: 'bg-cyan-100 text-cyan-800',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-amber-100 text-amber-700',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  UNPAID: 'bg-amber-100 text-amber-700',
  PAID: 'bg-cyan-100 text-cyan-800',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};
