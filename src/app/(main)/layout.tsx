import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

const MainLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <div className=" flex min-h-screen flex-col font-sans text-zinc-100 antialiased selection:bg-violet-500/30 selection:text-violet-200">
      <div className="ambient-glow pointer-events-none fixed top-0 left-1/2 z-0 h-96 w-full max-w-7xl -translate-x-1/2 opacity-60" />
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-22 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
