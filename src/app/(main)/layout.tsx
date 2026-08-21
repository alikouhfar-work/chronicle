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
    <main className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased">
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
        }}
      />
      <Header />
      {children}
      <Footer />
    </main>
  );
};

export default MainLayout;
