import { OnboardingForm } from '@/components/auth/onboarding-form';

interface OnboardPageProps {
  params: Promise<{ token: string }>;
}

export default async function OnboardPage({ params }: OnboardPageProps) {
  const { token } = await params;
  return (
    <div className="flex w-full items-center justify-center py-4">
      <OnboardingForm token={token} />
    </div>
  );
}
