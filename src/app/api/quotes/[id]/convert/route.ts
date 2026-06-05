import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoiceNumber, addDays } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: 'asc' } },
      invoice: true,
    },
  });
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (quote.invoice) return NextResponse.json({ error: 'すでに請求書が存在します' }, { status: 400 });

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: generateInvoiceNumber(),
      clientId: quote.clientId,
      quoteId: quote.id,
      title: quote.title,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      tax: quote.tax,
      total: quote.total,
      dueDate: addDays(new Date(), 30),
      notes: quote.notes,
      items: {
        create: quote.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          sortOrder: item.sortOrder,
        })),
      },
    },
  });

  await prisma.quote.update({ where: { id }, data: { status: 'ACCEPTED' } });

  revalidatePath('/quotes');
  revalidatePath(`/quotes/${id}`);
  revalidatePath('/invoices');
  revalidatePath('/');
  return NextResponse.json(invoice, { status: 201 });
}
