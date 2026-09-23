import { roleHomePath } from '@/features/auth/lib/role-home';
import { getCurrentUser } from '@/features/auth/server/get-current-user';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? roleHomePath(user) : '/login');
}
