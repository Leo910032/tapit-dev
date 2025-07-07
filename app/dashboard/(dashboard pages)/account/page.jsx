// app/dashboard/(dashboard pages)/account/page.jsx - FINAL UPDATED VERSION
"use client"; 

import { useTranslation } from '@/lib/useTranslation';
import ManageTeamSection from './components/ManageTeamSection';
import ContactInfoSection from './components/ContactInfoSection';
import MyCards from './components/MyCards'; // <-- 1. IMPORT THE NEW COMPONENT

export default function AccountPage() {
    const { t } = useTranslation();

    return (
        <div className="flex-1 py-2 flex flex-col max-h-full overflow-y-auto pb-20">
            <div className="p-4 md:p-6 space-y-8">
                {/* Page Title */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('account.settings_title') || 'Account Settings'}
                    </h1>
                    <p className="text-gray-600">
                        {t('account.settings_subtitle') || 'Manage your profile information and team settings'}
                    </p>
                </div>
                
                {/* Contact Information Section */}
                <ContactInfoSection />

                {/* --- 2. ADD THE "MY CARDS" SECTION HERE --- */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('account.my_nfc_cards') || 'My NFC Cards'}
                    </h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <MyCards />
                    </div>
                </div>
                
                {/* Team Management Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        {t('account.team_management') || 'Team Management'}
                    </h2>
                    <ManageTeamSection />
                </div>
            </div>
        </div>
    );
}