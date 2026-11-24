import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth/session';
import { AdminPortalShell } from '@/components/admin/AdminPortalShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  if (!session) {
    redirect('/admin/login');
  }

  return <AdminPortalShell session={session}>{children}</AdminPortalShell>;
}
