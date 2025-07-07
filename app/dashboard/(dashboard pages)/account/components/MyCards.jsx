// app/dashboard/(dashboard pages)/account/components/MyCards.jsx
"use client"
import { useState, useEffect } from 'react';
import { fireApp } from '@/important/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { testForActiveSession } from '@/lib/authentication/testForActiveSession';
import { useTranslation } from '@/lib/useTranslation';

export default function MyCards() {
    const { t } = useTranslation();
    const [userCards, setUserCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null); // ✅ NEW: Selected card for popup
    const [showModal, setShowModal] = useState(false); // ✅ NEW: Modal visibility

    useEffect(() => {
        const fetchCards = async () => {
            const userId = testForActiveSession(true);
            if (!userId) {
                setError("You must be logged in to view your cards.");
                setIsLoading(false);
                return;
            }

            try {
                const cardsPath = `AccountData/${userId}/userCards`;
                const q = query(collection(fireApp, cardsPath), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserCards(cards);
                
            } catch (err) {
                console.error("Error fetching user cards:", err);
                setError("Could not load your saved cards.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCards();
    }, []);

    // ✅ NEW: Handle card click to open modal
    const handleCardClick = (card) => {
        setSelectedCard(card);
        setShowModal(true);
    };

    // ✅ NEW: Close modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCard(null);
    };

    // ✅ NEW: Get display SVG (prioritize frontSvg, fallback to customizedSvg)
    const getDisplaySvg = (card) => {
        return card.frontSvg || card.customizedSvg || '';
    };

    // ✅ NEW: Get card name from customized data
    const getCardName = (card) => {
        // Try to get name from customized data
        if (card.customizedData) {
            const nameField = card.customizedData.name || 
                             card.customizedData.fullName || 
                             card.customizedData.cardName ||
                             card.customName;
            if (nameField) return nameField;
        }
        
        // Fallback to product name with date
        const date = card.createdAt?.toDate?.() || new Date();
        return `${card.productName} - ${date.toLocaleDateString()}`;
    };

    if (isLoading) {
        return (
            <div className="w-full">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                        ))}
                    </div>
                </div>
                <div className="text-center mt-4 text-gray-500">
                    {t('cards.loading') || 'Loading your saved cards...'}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (userCards.length === 0) {
        return (
            <div className="w-full">
                <h2 className="text-2xl font-bold mb-4">
                    {t('cards.my_saved_cards') || 'My Saved Cards'}
                </h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-6xl mb-4">💳</div>
                    <p className="text-lg text-gray-600 mb-2">
                        {t('cards.no_cards') || "You haven't created any custom cards yet."}
                    </p>
                    <p className="text-sm text-gray-500">
                        {t('cards.visit_nfc_section') || 'Visit the NFC Cards section to create your first card'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">
                {t('cards.my_saved_cards') || 'My Saved Cards'}
            </h2>
            
            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCards.map(card => (
                    <div 
                        key={card.id} 
                        className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => handleCardClick(card)}
                    >
                        {/* Card Preview */}
                        <div className="relative w-full aspect-[500/300] bg-gray-100 rounded-md overflow-hidden group-hover:scale-105 transition-transform duration-200">
                            <div
                                className="w-full h-full"
                                dangerouslySetInnerHTML={{ __html: getDisplaySvg(card) }}
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                        {t('cards.click_to_view_both_sides') || 'Click to view both sides'}
                                    </div>
                                </div>
                            </div>

                            {/* Front/Back Indicator */}
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {t('cards.front') || 'Front'}
                            </div>
                        </div>

                        {/* Card Info */}
                        <div className="mt-3">
                            <p className="font-semibold text-lg truncate">
                                {getCardName(card)}
                            </p>
                            <p className="text-sm text-gray-500">
                                {card.productName}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {t('cards.created') || 'Created'}: {card.createdAt?.toDate?.()?.toLocaleDateString() || t('cards.unknown_date') || 'Unknown date'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ✅ NEW: Modal for Card Preview */}
            {showModal && selectedCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {getCardName(selectedCard)}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {selectedCard.productName}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Front Side */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <h4 className="font-medium text-gray-900">{t('cards.front_side') || 'Front Side'}</h4>
                                    </div>
                                    <div className="w-full aspect-[500/300] bg-gray-100 rounded-lg overflow-hidden shadow-md">
                                        <div
                                            className="w-full h-full"
                                            dangerouslySetInnerHTML={{ 
                                                __html: selectedCard.frontSvg || selectedCard.customizedSvg || `<div class="flex items-center justify-center h-full text-gray-500">${t('cards.no_front_design') || 'No front design available'}</div>` 
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <h4 className="font-medium text-gray-900">{t('cards.back_side') || 'Back Side'}</h4>
                                    </div>
                                    <div className="w-full aspect-[500/300] bg-gray-100 rounded-lg overflow-hidden shadow-md">
                                        <div
                                            className="w-full h-full"
                                            dangerouslySetInnerHTML={{ 
                                                __html: selectedCard.backSvg || selectedCard.customizedSvg || `<div class="flex items-center justify-center h-full text-gray-500">${t('cards.no_back_design') || 'No back design available'}</div>` 
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Details */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">{t('cards.card_details') || 'Card Details'}</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Customized Data */}
                                    {selectedCard.customizedData && (
                                        <div>
                                            <h5 className="font-medium text-gray-700 mb-2">{t('cards.custom_information') || 'Custom Information'}</h5>
                                            <div className="space-y-2">
                                                {Object.entries(selectedCard.customizedData).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between text-sm">
                                                        <span className="text-gray-600 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                                                        </span>
                                                        <span className="text-gray-900 font-medium">
                                                            {value || t('cards.not_specified') || 'Not specified'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Style Options */}
                                    {selectedCard.styleOptions && (
                                        <div>
                                            <h5 className="font-medium text-gray-700 mb-2">{t('cards.style_customizations') || 'Style Customizations'}</h5>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{t('cards.background_color') || 'Background Color'}:</span>
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-4 h-4 rounded border border-gray-300"
                                                            style={{ backgroundColor: selectedCard.styleOptions.backgroundColor }}
                                                        ></div>
                                                        <span className="text-gray-900 font-mono text-xs">
                                                            {selectedCard.styleOptions.backgroundColor}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{t('cards.text_color') || 'Text Color'}:</span>
                                                    <div className="flex items-center gap-2">
                                                        <div 
                                                            className="w-4 h-4 rounded border border-gray-300"
                                                            style={{ backgroundColor: selectedCard.styleOptions.textColor }}
                                                        ></div>
                                                        <span className="text-gray-900 font-mono text-xs">
                                                            {selectedCard.styleOptions.textColor}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">{t('cards.text_size') || 'Text Size'}:</span>
                                                    <span className="text-gray-900">{selectedCard.styleOptions.textSize}px</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Created Date */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500">
                                        {t('cards.created') || 'Created'}: {selectedCard.createdAt?.toDate?.()?.toLocaleString() || t('cards.unknown_date') || 'Unknown date'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {t('cards.card_id') || 'Card ID'}: {selectedCard.id}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                                    >
                                        {t('common.close') || 'Close'}
                                    </button>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}