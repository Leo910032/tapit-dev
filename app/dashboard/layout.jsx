// app/dashboard/layout.jsx - Updated for Firebase Auth
import { Inter } from 'next/font/google'
import NavBar from '../components/General Components/NavBar'
import FirebaseAuthCheck from './general components/FirebaseAuthCheck'
import Preview from './general components/Preview'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Tapit.fr - Dashboard',
    description: 'Manage your digital business card',
}

export default function DashboardLayout({ children }) {
    return (
        <div className='w-screen h-screen max-w-screen max-h-screen overflow-y-auto relative bg-black bg-opacity-[.05] p-2 flex flex-col'>
            <NavBar />
            <FirebaseAuthCheck />
            
            <div className="flex sm:px-3 px-2 h-full overflow-y-hidden">
                {children}
                <Preview />
            </div>
        </div>
    )
}