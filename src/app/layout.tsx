import type { Metadata } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';

const plusJakartaSans = Plus_Jakarta_Sans({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Chronicle',
  description: 'Your Chronicle, Your Story.',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
};

export default RootLayout;
