// app/dashboard/(dashboard pages)/account/components/manager/PendingJoinRequests.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { fireApp } from '@/important/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';



export const PendingJoinRequests = ({ teamData }) => {
    const { t } = useTranslation();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingRequestId, setProcessingRequestId] = useState(null);

    // Listen for pending join requests
    useEffect(() => {
        if (!teamData?.teamId) {
            setLoading(false);
            return;
        }

        const requestsQuery = query(
            collection(fireApp, "TeamJoinRequests"),
            where("teamId", "==", teamData.teamId),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
            const requests = [];
            
            for (const docSnap of snapshot.docs) {
                const requestData = docSnap.data();
                
                // Get user details for each request
                try {
                    const userRef = doc(fireApp, "AccountData", requestData.userId);
                    const userSnap = await getDoc(userRef);
                    
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        requests.push({
                            requestId: docSnap.id,
                            ...requestData,
                            userDetails: {
                                displayName: userData.displayName,
                                username: userData.username,
                                email: userData.email,
                                profilePhoto: userData.profilePhoto
                            }
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
            
            setPendingRequests(requests);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [teamData?.teamId]);

 // Replace the existing handler functions with these:
const handleApproveRequest = async (requestId, userId) => {
    setProcessingRequestId(requestId);
    try {
        const currentUserId = testForActiveSession();
        
        // Import the new approval function
        const { approveJoinRequest } = await import('@/lib/teamManagement');
        
        const result = await approveJoinRequest(currentUserId, requestId);
        toast.success(`${result.memberName} has been approved to join the team!`);
        
    } catch (error) {
        console.error('Error approving request:', error);
        toast.error(error.message || 'Failed to approve request');
    } finally {
        setProcessingRequestId(null);
    }
};

const handleRejectRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
        const currentUserId = testForActiveSession();
        
        // Import the new rejection function
        const { rejectJoinRequest } = await import('@/lib/teamManagement');
        
        await rejectJoinRequest(currentUserId, requestId);
        toast.success('Join request rejected');
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request');
    } finally {
        setProcessingRequestId(null);
    }
};

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (pendingRequests.length === 0) {
        return null; // Don't show the component if there are no pending requests
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                    {t('teams.pending_requests') || 'Pending Join Requests'} ({pendingRequests.length})
                </h3>
            </div>

            <div className="space-y-4">
                {pendingRequests.map((request) => (
                    <div key={request.requestId} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                                {request.userDetails.profilePhoto ? (
                                    <img 
                                        src={request.userDetails.profilePhoto} 
                                        alt={request.userDetails.displayName} 
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    request.userDetails.displayName?.charAt(0).toUpperCase() || 
                                    request.userDetails.username?.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* User Info */}
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {request.userDetails.displayName || request.userDetails.username}
                                </h4>
                                <p className="text-sm text-gray-600">{request.userDetails.email}</p>
                                <p className="text-xs text-orange-600">
                                    {t('teams.requested_to_join') || 'Requested to join'} • 
                                    {new Date(request.requestedAt?.seconds * 1000 || request.requestedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleApproveRequest(request.requestId, request.userId)}
                                disabled={processingRequestId === request.requestId}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {processingRequestId === request.requestId ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>{t('teams.processing') || 'Processing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{t('teams.approve') || 'Approve'}</span>
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={() => handleRejectRequest(request.requestId)}
                                disabled={processingRequestId === request.requestId}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="sr-only">{t('teams.reject') || 'Reject'}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};