import { ReactNode } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const MainLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-950 font-sans text-zinc-100 antialiased">
      <Header />
      {children}
      <Footer />
    </main>
  );
};

export default MainLayout;
