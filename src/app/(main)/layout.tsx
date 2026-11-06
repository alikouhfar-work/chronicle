import type { ReactNode } from 'react';
import { Header } from '@/app/_components/Header';
import { Footer } from '@/app/_components/Footer';
import { Toaster } from 'react-hot-toast';
import { auth } from '@/infra/auth/auth';

const MainLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col font-sans text-ink antialiased selection:bg-accent-bright/30 selection:text-accent-tint">
      <div className="ambient-glow pointer-events-none fixed top-0 left-1/2 z-0 h-96 w-full max-w-7xl -translate-x-1/2 opacity-60" />
      <Toaster
        position="bottom-center"
        gutter={12}
        containerClassName="chronicle-toaster"
        toastOptions={{
          duration: 3500,
        }}
      />
      <Header isAuthenticated={Boolean(session?.user?.id)} />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-22 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
