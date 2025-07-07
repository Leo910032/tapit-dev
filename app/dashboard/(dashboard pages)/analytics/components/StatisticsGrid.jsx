// app/dashboard/(dashboard pages)/analytics/components/StatisticsGrid
"use client"
import { useTranslation } from "@/lib/useTranslation";

export default function StatisticsGrid({ analytics }) {
    const { t } = useTranslation();

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('analytics.complete_statistics') || 'Complete Statistics'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Today */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        {t('analytics.stats.today') || 'Today'}
                    </h3>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-blue-600">
                            {analytics?.todayViews || 0} {t('analytics.stats.views') || 'views'}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                            {analytics?.todayClicks || 0} {t('analytics.stats.clicks') || 'clicks'}
                        </p>
                    </div>
                </div>

                {/* This Week */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        {t('analytics.stats.this_week') || 'This Week'}
                    </h3>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-blue-600">
                            {analytics?.thisWeekViews || 0} {t('analytics.stats.views') || 'views'}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                            {analytics?.thisWeekClicks || 0} {t('analytics.stats.clicks') || 'clicks'}
                        </p>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        {t('analytics.stats.this_month') || 'This Month'}
                    </h3>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-blue-600">
                            {analytics?.thisMonthViews || 0} {t('analytics.stats.views') || 'views'}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                            {analytics?.thisMonthClicks || 0} {t('analytics.stats.clicks') || 'clicks'}
                        </p>
                    </div>
                </div>

                {/* All Time */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        {t('analytics.stats.all_time') || 'All Time'}
                    </h3>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-blue-600">
                            {analytics?.totalViews || 0} {t('analytics.stats.views') || 'views'}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                            {analytics?.totalClicks || 0} {t('analytics.stats.clicks') || 'clicks'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
