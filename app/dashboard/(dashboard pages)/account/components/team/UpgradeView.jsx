// app/dashboard/(dashboard pages)/account/components/team/UpgradeView.jsx

import { useTranslation } from '@/lib/useTranslation';

export const UpgradeView = () => {
    const { t } = useTranslation();
    
    return (
        <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('teams.manager_feature_title') || 'Unlock Team Management'}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('teams.manager_feature_desc') || 'Upgrade to a Team Manager plan to create your own team, invite members, and view team-wide analytics.'}
            </p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-transform hover:scale-105">
                {t('teams.upgrade_to_manager_plan') || 'Upgrade Plan'}
            </button>
        </div>
    );
};