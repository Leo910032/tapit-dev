// app/dashboard/(dashboard pages)/account/components/team/JoinTeamView.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';

export const JoinTeamView = ({ 
    onJoinTeam, 
    isSubmitting, 
    title = null, 
    subtitle = null 
}) => {
    const { t } = useTranslation();
    const [teamCodeInput, setTeamCodeInput] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || !teamCodeInput.match(/^\d{6}$/)) return;
        
        await onJoinTeam(teamCodeInput);
        setTeamCodeInput('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {title || t('teams.join_title') || 'Join a Team'}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
                {subtitle || t('teams.join_subtitle') || 'Enter the 6-digit code provided by your team manager.'}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={teamCodeInput}
                    onChange={(e) => setTeamCodeInput(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="123456"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || teamCodeInput.length !== 6}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (t('teams.joining') || 'Joining...') : (t('teams.join_team') || 'Join Team')}
                </button>
            </form>
            
            {teamCodeInput.length > 0 && teamCodeInput.length < 6 && (
                <p className="text-sm text-gray-500 mt-2">
                    {t('teams.enter_6_digits') || 'Please enter all 6 digits of the team code.'}
                </p>
            )}
        </div>
    );
};