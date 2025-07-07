"use client"
import { useTranslation } from "@/lib/useTranslation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function LinkTypeDistribution({ analytics }) {
    const { t } = useTranslation();

    // Guard clause if analytics data is not yet available
    if (!analytics || !analytics.topLinks || analytics.topLinks.length === 0) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('analytics.clicks_by_type') || 'Clicks by Link Type'}
                </h2>
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                    {t('analytics.no_data_available') || 'No link click data available.'}
                </div>
            </div>
        );
    }

    // Aggregate clicks by type, differentiating custom links by title
    const typeData = analytics.topLinks.reduce((acc, link) => {
        // ✅ FIX: If type is 'custom', use the link's title for the chart segment name.
        // Otherwise, use the link's type (e.g., 'instagram', 'youtube').
        const segmentName = link.type === 'custom' ? link.title : (link.type || 'Other');
        
        if (!acc[segmentName]) {
            acc[segmentName] = 0;
        }
        acc[segmentName] += link.totalClicks || 0;
        return acc;
    }, {});

    const chartData = Object.entries(typeData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Only render if we have actual data points for the chart
    if (chartData.length === 0 || chartData.every(item => item.value === 0)) {
        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {t('analytics.clicks_by_type') || 'Clicks by Link Type'}
                </h2>
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
                    {t('analytics.no_data_available') || 'No link click data available.'}
                </div>
            </div>
        );
    }

    // Predefined colors for chart segments
    const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6EE7B7', '#FBBF24', '#A78BFA', '#D8B4FE'];

    return (
        <div className="w-full"> {/* Removed unnecessary mb-8 and border/shadow as parent handles */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('analytics.clicks_by_type') || 'Clicks by Link Type'}
            </h2>
            <div style={{ width: '100%', height: 300 }}> {/* Adjusted height for consistency */}
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            innerRadius={60} // Donut chart
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}