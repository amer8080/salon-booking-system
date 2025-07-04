import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ColorThemeProvider } from '@/contexts/ColorThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'صالون ريم للتجميل',
  description: 'نظام حجوزات صالون ريم - جمالك هو اهتمامنا',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ColorThemeProvider>{children}</ColorThemeProvider>
      </body>
    </html>
  );
}
