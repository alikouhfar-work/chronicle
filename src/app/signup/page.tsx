import { AuthShell } from '@/shared/ui/AuthShell';
import { SignupForm } from '@/modules/auth/components/SignupForm';

const SignupPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) => {
  const { callbackUrl } = await searchParams;

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="One account for your library, watch history, and TMDB connection."
      footer="After signing up, you'll connect your own TMDB read-access token."
    >
      <SignupForm callbackUrl={callbackUrl ?? '/'} />
    </AuthShell>
  );
};

export default SignupPage;
