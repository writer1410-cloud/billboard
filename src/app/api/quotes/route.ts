import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const itemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
});

const schema = z.object({
  quoteNumber: z.string().min(1),
  clientId: z.string().min(1),
  title: z.string().min(1),
  items: z.array(itemSchema).min(1),
  subtotal: z.number(),
  taxRate: z.number(),
  tax: z.number(),
  total: z.number(),
  validUntil: z.string(),
  notes: z.string().optional(),
});

export async function GET() {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: '入力内容が不正です' }, { status: 400 });

  const { items, ...data } = parsed.data;
  const quote = await prisma.quote.create({
    data: {
      ...data,
      validUntil: new Date(data.validUntil),
      items: {
        create: items.map((item, i) => ({ ...item, sortOrder: i })),
      },
    },
    include: { items: true },
  });
  revalidatePath('/quotes');
  revalidatePath('/');
  return NextResponse.json(quote, { status: 201 });
}
