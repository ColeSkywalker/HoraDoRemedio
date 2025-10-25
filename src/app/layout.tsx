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
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Hora do Remédio',
  description: 'Seu assistente pessoal de gerenciamento de medicamentos.',
  manifest: '/manifest.json',
};

const faviconSvg = `
<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>
  <rect width=%22100%22 height=%22100%22 rx=%2220%22 ry=%2220%22 fill=%22hsl(196 30% 45%)%22></rect>
  <text x=%2250%22 y=%2255%22 font-size=%2250%22 font-family=%22sans-serif%22 font-weight=%22bold%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22>HR</text>
</svg>
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`data:image/svg+xml,${faviconSvg}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#4A90E2" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
