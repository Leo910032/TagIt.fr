import './globals.css';
import './styles/fonts.css';
import { Inter } from 'next/font/google';
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tapit.fr',
  description: 'Encore en dev les pelos',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextTopLoader color='#8129D9' />
        {children}
      </body>
    </html>
  )
}