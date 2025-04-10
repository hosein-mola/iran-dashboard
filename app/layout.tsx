import './globals.css'
import { ThemeProvider } from 'next-themes'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider attribute="class">{children}</ThemeProvider>
      </body>
    </html>
  )
}
