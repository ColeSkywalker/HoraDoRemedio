import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { PillPalStoreProvider } from '@/lib/store';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { SiteSidebar } from '@/components/site-sidebar';

export const metadata: Metadata = {
  title: 'Hora do Remédio',
  description: 'Seu assistente pessoal de gerenciamento de medicamentos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <PillPalStoreProvider>
          <SidebarProvider>
            <div className="relative flex min-h-screen w-full">
              <SiteSidebar />
              <SidebarInset className="flex flex-col">
                {children}
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </PillPalStoreProvider>
      </body>
    </html>
  );
}
