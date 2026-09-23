import { proxyToBackend } from '@/libs/proxy';

export async function GET() {
  return proxyToBackend({ method: 'GET', path: '/me' });
}
