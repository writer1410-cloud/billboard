import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendInvoiceEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await sendInvoiceEmail({
    to: invoice.client.email,
    clientName: invoice.client.name,
    invoiceNumber: invoice.invoiceNumber,
    title: invoice.title,
    total: invoice.total,
    dueDate: invoice.dueDate,
    items: invoice.items,
    notes: invoice.notes,
  });

  const updated = await prisma.invoice.update({
    where: { id },
    data: { sentAt: new Date() },
  });
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return NextResponse.json(updated);
}
