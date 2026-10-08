import { AuthShell } from '@/shared/ui/AuthShell';
import { availableProviders } from '@/infra/auth/auth';
import { LoginForm } from '@/modules/auth/components/LoginForm';

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Incorrect email or password. Please try again.',
  CallbackRouteError: 'Sign-in failed. Please try again.',
  OAuthSignin: 'Could not reach the identity provider. Please try again.',
  OAuthCallback: 'The identity provider rejected the sign-in. Please try again.',
  OAuthAccountNotLinked:
    'This email is already linked to another sign-in method. Try that method instead.',
  Configuration: 'The server is missing sign-in configuration. Please contact the administrator.',
};

const LoginPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) => {
  const { callbackUrl, error } = await searchParams;
  const target = callbackUrl ?? '/';

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Chronicle"
      description="Access your personal movie and TV show tracker."
      footer="Your library, watch history, and TMDB token stay private to your account."
    >
      <LoginForm
        providers={availableProviders}
        callbackUrl={target}
        authError={error ? (ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.') : null}
      />
    </AuthShell>
  );
};

export default LoginPage;
