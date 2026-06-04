import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.update({
    where: { id },
    data: { status: 'ACCEPTED' },
  });
  return NextResponse.json(quote);
}
