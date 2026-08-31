import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { CustomerHeader } from '@/components/layout/customer-header';

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const role = (session.user as any)?.role;
  if (role !== 'CUSTOMER') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader session={session} />
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
