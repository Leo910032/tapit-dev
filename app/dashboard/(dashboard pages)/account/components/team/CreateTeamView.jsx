// app/dashboard/(dashboard pages)/account/components/team/CreateTeamView.jsx

import { useState } from 'react';
import { useTranslation } from '@/lib/useTranslation';

export const CreateTeamView = ({ onCreateTeam, isSubmitting }) => {
    const { t } = useTranslation();
    const [teamNameInput, setTeamNameInput] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting || teamNameInput.length < 3) return;
        
        await onCreateTeam(teamNameInput);
        setTeamNameInput('');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
                {t('teams.create_title') || 'Create Your Team'}
            </h2>
            <p className="text-gray-600 mb-4 text-sm">
                {t('teams.create_subtitle') || 'Start building your team by creating a new workspace.'}
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={teamNameInput}
                    onChange={(e) => setTeamNameInput(e.target.value)}
                    placeholder={t('teams.team_name_placeholder') || 'My Awesome Team'}
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={50}
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting || teamNameInput.length < 3}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (t('teams.creating') || 'Creating...') : (t('teams.create_team') || 'Create Team')}
                </button>
            </form>
            
            {teamNameInput.length > 0 && teamNameInput.length < 3 && (
                <p className="text-sm text-gray-500 mt-2">
                    {t('teams.team_name_min_length') || 'Team name must be at least 3 characters long.'}
                </p>
            )}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">{t('teams.what_happens_next') || 'What happens next?'}</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>{t('teams.step_1') || 'Your team will be created with a unique 6-digit code'}</li>
                            <li>{t('teams.step_2') || 'Share this code with team members to invite them'}</li>
                            <li>{t('teams.step_3') || 'Manage your team settings and view analytics'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};