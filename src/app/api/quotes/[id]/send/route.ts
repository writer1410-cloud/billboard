import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendQuoteEmail } from '@/lib/email';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { client: true, items: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await sendQuoteEmail({
    to: quote.client.email,
    clientName: quote.client.name,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    total: quote.total,
    validUntil: quote.validUntil,
    items: quote.items,
    notes: quote.notes,
  });

  const updated = await prisma.quote.update({
    where: { id },
    data: { status: 'SENT', sentAt: new Date() },
  });
  return NextResponse.json(updated);
}
