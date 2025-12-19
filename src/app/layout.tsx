import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ModeToggle } from '@/components/ui/theme-toggle';
import QueryProvider from '@/providers/query-provider';
import { ChatProvider } from '@/providers/chat-provider';
import { ChatPopup } from '@/components/ChatPopup';

export const metadata: Metadata = {
  title: 'ClientVerse',
  description: 'A modern portal for client management.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ChatProvider>
              <div className="absolute top-4 right-4">
                <ModeToggle />
              </div>
              {children}
              <ChatPopup />
              <Toaster />
            </ChatProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
