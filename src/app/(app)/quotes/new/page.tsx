import { prisma } from '@/lib/prisma';
import QuoteForm from './QuoteForm';

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } });

  return <QuoteForm clients={clients} defaultClientId={clientId} />;
}
