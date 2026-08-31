import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    const role = (session.user as any)?.role;
    if (role === 'CUSTOMER') redirect('/catalog');
    redirect('/dashboard');
  }
  redirect('/login');
}
