
import type { Metadata } from 'next';
import './globals.css';
import { SITE_NAME } from '@/lib/constants';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: 'Hyperlocal try-before-you-buy shopping for your colony',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
