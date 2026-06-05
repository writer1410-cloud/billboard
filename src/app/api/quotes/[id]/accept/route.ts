import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.update({
    where: { id },
    data: { status: 'ACCEPTED' },
  });
  revalidatePath('/quotes');
  revalidatePath(`/quotes/${id}`);
  return NextResponse.json(quote);
}
