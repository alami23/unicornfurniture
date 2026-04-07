import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DashboardLayout from '@/components/layout/DashboardLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Unicorn Furniture BD | Management System',
  description: 'Inventory, POS, and Invoicing for Furniture & Wood Business',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body suppressHydrationWarning className="antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
