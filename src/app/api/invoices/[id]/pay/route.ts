import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: 'PAID', paidAt: new Date() },
  });
  revalidatePath('/');
  revalidatePath('/invoices');
  revalidatePath(`/invoices/${id}`);
  return NextResponse.json(invoice);
}
