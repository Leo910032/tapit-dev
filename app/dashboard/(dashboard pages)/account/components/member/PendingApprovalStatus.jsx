// app/dashboard/(dashboard pages)/account/components/member/PendingApprovalStatus.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { fireApp } from '@/important/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';

export const PendingApprovalStatus = () => {
    const { t } = useTranslation();
    const [pendingRequest, setPendingRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = testForActiveSession();
        if (!userId) {
            setLoading(false);
            return;
        }

        const requestsQuery = query(
            collection(fireApp, "TeamJoinRequests"),
            where("userId", "==", userId),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            if (!snapshot.empty) {
                const requestData = snapshot.docs[0].data();
                setPendingRequest({
                    requestId: snapshot.docs[0].id,
                    ...requestData
                });
            } else {
                setPendingRequest(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading || !pendingRequest) {
        return null;
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800 mb-1">
                        {t('teams.pending_approval') || 'Waiting for Approval'}
                    </h3>
                    <p className="text-sm text-yellow-700 mb-2">
                        {t('teams.approval_message') || 'Your request to join this team is pending approval from the team manager.'}
                    </p>
                    <p className="text-xs text-yellow-600">
                        {t('teams.requested_on') || 'Requested on'}: {new Date(pendingRequest.requestedAt?.seconds * 1000 || pendingRequest.requestedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center">
                    <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};