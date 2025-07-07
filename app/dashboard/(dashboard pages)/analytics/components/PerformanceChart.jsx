// app/dashboard/(dashboard pages)/analytics/components/PerformanceChart.jsx
"use client";
import { useTranslation } from "@/lib/useTranslation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PerformanceChart({ analytics }) {
    const { t } = useTranslation();

    // Prepare data for the last 7 days
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        
        return {
            name: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
            views: analytics?.dailyViews?.[dateKey] || 0,
            clicks: analytics?.dailyClicks?.[dateKey] || 0,
        };
    }).reverse();

    return (
        <>
            {/* Title */}
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
                {t('analytics.performance_last_7_days') || 'Weekly performance'}
            </h2>
            
            {/* Chart Container - Full width and height */}
            <div className="w-full h-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#6b7280" 
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis 
                            stroke="#6b7280" 
                            fontSize={10}
                            tick={{ fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            width={20}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="line"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            name={t('analytics.Profile_views')}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2, fill: '#3b82f6' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="clicks" 
                            stroke="#8b5cf6" 
                            strokeWidth={2} 
                            name={t('analytics.Link_clicks')}
                            dot={{ r: 3 }}
                            activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#8b5cf6' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}