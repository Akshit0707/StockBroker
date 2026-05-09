import type { Metadata } from 'next';
import { CommonLayout } from '../src/components/common/layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stock Trading App',
  description: 'Trade stocks in real-time',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CommonLayout>{children}</CommonLayout>
      </body>
    </html>
  );
}