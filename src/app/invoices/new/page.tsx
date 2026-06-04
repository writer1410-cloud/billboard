import { prisma } from '@/lib/prisma';
import InvoiceForm from './InvoiceForm';

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; quoteId?: string }>;
}) {
  const { clientId, quoteId } = await searchParams;
  const [clients, sourceQuote] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: 'asc' } }),
    quoteId
      ? prisma.quote.findUnique({ where: { id: quoteId }, include: { items: { orderBy: { sortOrder: 'asc' } } } })
      : null,
  ]);

  return <InvoiceForm clients={clients} defaultClientId={clientId} sourceQuote={sourceQuote} />;
}
