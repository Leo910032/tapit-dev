// app/layout.jsx - Root Layout with Auth Provider
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import './globals.css' // Make sure you have your global styles

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Tapit.fr',
    description: 'Create and share your digital business card',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                        }}
                    />
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}