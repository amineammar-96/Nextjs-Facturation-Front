
import './globals.css'
import { Inter } from 'next/font/google'
import NavbarComponent from './components/layoutComponents/NavbarComponent';
import FooterComponent from './components/layoutComponents/FooterComponent';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SAPS',
  description: 'SAPS Facturation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <NavbarComponent></NavbarComponent> */}
        {children}
        <FooterComponent></FooterComponent>
        </body>
    </html>
  )
}
