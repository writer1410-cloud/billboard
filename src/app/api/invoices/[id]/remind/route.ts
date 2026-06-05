import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReminderEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invoice.status === 'PAID') return NextResponse.json({ error: '入金済みの請求書です' }, { status: 400 });

  const daysOverdue = Math.max(
    0,
    Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000)
  );

  await sendReminderEmail({
    to: invoice.client.email,
    clientName: invoice.client.name,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title,
    total: invoice.total,
    dueDate: invoice.dueDate,
    daysOverdue,
  });

  const [updated] = await prisma.$transaction([
    prisma.invoice.update({ where: { id }, data: { status: 'OVERDUE' } }),
    prisma.reminder.create({ data: { invoiceId: id, type: 'OVERDUE' } }),
  ]);

  revalidatePath('/');
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return NextResponse.json(updated);
}
