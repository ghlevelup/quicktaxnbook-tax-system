import { roleHomePath } from '@/features/auth/lib/role-home';
import { requireUser } from '@/features/auth/rbac/require';
import { redirect } from 'next/navigation';

export default async function ClientIndexPage() {
  const user = await requireUser('/client-login');
  redirect(roleHomePath(user));
}
