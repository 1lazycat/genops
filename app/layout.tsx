// "use client";

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Requirements Management System',
  description: 'AI-powered requirements management for software development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex h-screen">
            {/* <div className={`transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 w-64 bg-background border-r`}>  */}
              <Sidebar />
            {/* </div> */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b bg-background">
                {/* <Button variant="outline" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle sidebar</span>
                </Button> */}
                <h1 className="text-xl font-semibold">Requirements Management System</h1>
              </header>
              <main className="flex-1 overflow-auto p-4">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}