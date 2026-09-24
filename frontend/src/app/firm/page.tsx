import { roleHomePath } from '@/features/auth/lib/role-home';
import { requireUser } from '@/features/auth/rbac/require';
import { redirect } from 'next/navigation';

export default async function FirmIndexPage() {
  const user = await requireUser('/login');
  redirect(roleHomePath(user));
}
 