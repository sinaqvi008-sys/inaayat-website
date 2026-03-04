import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Tayat Studio',
  description: 'Tayat Studio — Hyperlocal fashion store',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
