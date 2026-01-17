import './globals.css'
import { Poppins } from 'next/font/google'
import { ThemeProvider } from './theme-provider'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ToastProvider } from '@/components/ToastProvider'
import { AuthProvider } from '@/context/AuthContext'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'Hereafter, Pal',
  description: 'A digital memorial service.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body className="font-poppins">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ToastProvider />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              {/* Main content with proper padding for fixed navigation */}
              {/* pt-16 md:pt-[72px] = top padding for fixed navbar */}
              {/* pb-16 md:pb-0 = bottom padding for mobile bottom nav */}
              <main className="flex-grow pt-16 md:pt-[72px] pb-16 md:pb-0">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
