import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReminderEmail } from '@/lib/email';

// Batch endpoint: mark overdue invoices and send reminders
export async function POST() {
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['UNPAID', 'OVERDUE'] },
      dueDate: { lt: new Date() },
    },
    include: { client: true },
  });

  const results = await Promise.allSettled(
    overdueInvoices.map(async (invoice) => {
      const daysOverdue = Math.floor((Date.now() - invoice.dueDate.getTime()) / 86400000);

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

      return invoice.invoiceNumber;
    })
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ sent: succeeded, failed, total: overdueInvoices.length });
}
