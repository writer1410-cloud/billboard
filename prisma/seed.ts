import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  const client1 = await prisma.client.create({
    data: {
      name: '株式会社テスト商事',
      email: 'test@test-corp.co.jp',
      phone: '03-1234-5678',
      address: '東京都渋谷区テスト1-2-3',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: '合同会社サンプル',
      email: 'sample@sample-llc.jp',
      phone: '06-9876-5432',
      address: '大阪府大阪市サンプル4-5-6',
    },
  });

  const now = new Date();

  const quote = await prisma.quote.create({
    data: {
      quoteNumber: 'Q-2025-001',
      clientId: client1.id,
      title: 'Webサイト制作 見積書',
      subtotal: 500000,
      taxRate: 0.1,
      tax: 50000,
      total: 550000,
      validUntil: addDays(now, 30),
      status: 'SENT',
      sentAt: now,
      items: {
        create: [
          { description: 'デザイン制作', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 0 },
          { description: 'フロントエンド開発', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 1 },
          { description: 'CMS構築', quantity: 1, unitPrice: 100000, amount: 100000, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      clientId: client1.id,
      title: 'ロゴデザイン制作',
      subtotal: 150000,
      taxRate: 0.1,
      tax: 15000,
      total: 165000,
      issueDate: addDays(now, -30),
      dueDate: addDays(now, -15),
      status: 'PAID',
      paidAt: addDays(now, -10),
      sentAt: addDays(now, -30),
      items: {
        create: [
          { description: 'ロゴデザイン', quantity: 1, unitPrice: 100000, amount: 100000, sortOrder: 0 },
          { description: 'ガイドライン作成', quantity: 1, unitPrice: 50000, amount: 50000, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-002',
      clientId: client2.id,
      title: 'バナー広告制作',
      subtotal: 80000,
      taxRate: 0.1,
      tax: 8000,
      total: 88000,
      issueDate: addDays(now, -45),
      dueDate: addDays(now, -15),
      status: 'OVERDUE',
      sentAt: addDays(now, -45),
      items: {
        create: [
          { description: 'バナーデザイン (A・B・Cサイズ)', quantity: 3, unitPrice: 20000, amount: 60000, sortOrder: 0 },
          { description: '修正対応', quantity: 2, unitPrice: 10000, amount: 20000, sortOrder: 1 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-003',
      clientId: client1.id,
      title: 'Webサイト制作',
      subtotal: 500000,
      taxRate: 0.1,
      tax: 50000,
      total: 550000,
      issueDate: now,
      dueDate: addDays(now, 30),
      status: 'UNPAID',
      sentAt: now,
      quoteId: quote.id,
      items: {
        create: [
          { description: 'デザイン制作', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 0 },
          { description: 'フロントエンド開発', quantity: 1, unitPrice: 200000, amount: 200000, sortOrder: 1 },
          { description: 'CMS構築', quantity: 1, unitPrice: 100000, amount: 100000, sortOrder: 2 },
        ],
      },
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
