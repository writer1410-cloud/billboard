import { PrismaClient } from '@prisma/client';
import { sendReminderEmail } from '../src/lib/email';

const prisma = new PrismaClient();

async function main() {
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['UNPAID', 'OVERDUE'] },
      dueDate: { lt: new Date() },
    },
    include: { client: true },
  });

  console.log(`Found ${overdueInvoices.length} overdue invoice(s)`);

  for (const invoice of overdueInvoices) {
    const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000);

    try {
      await sendReminderEmail({
        to: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        total: invoice.total,
        dueDate: invoice.dueDate,
        daysOverdue,
      });

      await prisma.$transaction([
        prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'OVERDUE' } }),
        prisma.reminder.create({ data: { invoiceId: invoice.id, type: 'OVERDUE' } }),
      ]);

      console.log(`✓ Reminder sent for ${invoice.invoiceNumber} (${daysOverdue} days overdue)`);
    } catch (err) {
      console.error(`✗ Failed for ${invoice.invoiceNumber}:`, err);
    }
  }

  console.log('Done.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
