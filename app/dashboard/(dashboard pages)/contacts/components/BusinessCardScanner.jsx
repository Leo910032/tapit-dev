// app/dashboard/(dashboard pages)/contacts/components/BusinessCardScanner.jsx
"use client"

import { useTranslation } from '@/lib/useTranslation';
import { toast } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';

export default function BusinessCardScanner({ isOpen, onClose, onContactParsed }) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);    
    const [mediaStream, setMediaStream] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);



    // ✅ Fixed useEffect for media stream management
    useEffect(() => {
        if (mediaStream && videoRef.current) {
            videoRef.current.srcObject = mediaStream;
        }

        // Cleanup function
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    // ✅ Reset all states when modal closes
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setCapturedImage(null);
            setPreviewUrl(null);
            setIsProcessing(false);
        }
    }, [isOpen]);

    const startCamera = async () => {
        const idealConstraints = { 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            } 
        };
        const fallbackConstraints = { 
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia(idealConstraints);
            } catch (err) {
                console.warn("Could not get back camera, falling back.", err);
                stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            }
            
            setMediaStream(stream);
            setShowCamera(true);

        } catch (error) {
            console.error('Could not access any camera.', error);
            toast.error(t('business_card_scanner.camera_access_error'));
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
        setMediaStream(null);
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || !video.videoWidth) return;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreviewUrl(dataUrl);

        canvas.toBlob((blob) => {
            const file = new File([blob], 'business-card.jpg', { type: 'image/jpeg' });
            setCapturedImage(file);
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.log('❌ No file selected');
            return;
        }

        console.log('📁 File selected:', {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            lastModified: new Date(file.lastModified).toLocaleString()
        });

        if (!file.type.startsWith('image/')) {
            console.error('❌ Invalid file type:', file.type);
            toast.error(t('business_card_scanner.invalid_file_type'));
            return;
        }
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            console.error('❌ File too large:', file.size, 'bytes');
            toast.error(t('business_card_scanner.file_too_large'));
            return;
        }
        
        console.log('✅ File validation passed, creating preview...');
        setCapturedImage(file);

        // Create preview URL with extensive logging
        try {
            console.log('🔄 Creating object URL...');
            const url = URL.createObjectURL(file);
            console.log('✅ Object URL created:', url);
            setPreviewUrl(url);
            
            // Test if the URL is actually valid
            const img = new Image();
            img.onload = () => {
                console.log('✅ Image loaded successfully in test:', {
                    width: img.naturalWidth,
                    height: img.naturalHeight,
                    url: url.substring(0, 50) + '...'
                });
            };
            img.onerror = (error) => {
                console.error('❌ Image failed to load in test:', error);
                console.error('❌ Image error details:', {
                    src: img.src,
                    error: error
                });
            };
            img.src = url;
            
        } catch (error) {
            console.error('❌ Error creating preview URL:', error);
            console.error('❌ Error stack:', error.stack);
            toast.error(t('business_card_scanner.image_load_failed'));
            
            // Fallback to FileReader
            console.log('🔄 Attempting FileReader fallback...');
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('✅ FileReader fallback successful');
                    setPreviewUrl(e.target.result);
                };
                reader.onerror = (error) => {
                    console.error('❌ FileReader fallback failed:', error);
                    toast.error(t('business_card_scanner.image_read_failed'));
                };
                reader.readAsDataURL(file);
            } catch (fallbackError) {
                console.error('❌ FileReader fallback error:', fallbackError);
            }
        }
        
        // Clear the input so the same file can be selected again if needed
        event.target.value = '';
        console.log('🧹 Input cleared for reuse');
    };

    // ✅ Process image function
    const processImage = async () => {
        if (!capturedImage) return;
        setIsProcessing(true);
        toast.loading(t('business_card_scanner.scanning_card'), { id: 'scanning-toast' });
        
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const imageBase64 = e.target.result;
                    const response = await fetch('/api/scan-business-card', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64 })
                    });
                    
                    const result = await response.json();
                    toast.dismiss('scanning-toast');
                    
                    if (result.success) {
                        onContactParsed(result.parsedFields);
                        toast.success(t('business_card_scanner.scan_complete'));
                    } else {
                        toast.error(result.error || t('business_card_scanner.scan_failed'));
                    }
                } catch (error) {
                    toast.dismiss('scanning-toast');
                    console.error('API call error:', error);
                    toast.error(t('business_card_scanner.processing_failed'));
                } finally {
                    setIsProcessing(false);
                }
            };
            
            reader.onerror = () => {
                toast.dismiss('scanning-toast');
                toast.error(t('business_card_scanner.image_read_error'));
                setIsProcessing(false);
            };
            
            reader.readAsDataURL(capturedImage);
            
        } catch (error) {
            toast.dismiss('scanning-toast');
            console.error('Processing error:', error);
            toast.error(t('business_card_scanner.processing_failed'));
            setIsProcessing(false);
        }
    };

    // ✅ Fixed handleClose function
    const handleClose = () => {
        stopCamera();
        setCapturedImage(null);
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setIsProcessing(false);
        onClose();
    };

    // ✅ Fixed handleRetake function
    const handleRetake = () => {
        setCapturedImage(null);
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setIsProcessing(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-4xl h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
                
                {/* Header - Mobile optimized */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-white flex-shrink-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        📷 {t('business_card_scanner.title')}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    {/* ✅ Mobile-optimized Initial choice screen */}
                    {!showCamera && !capturedImage && (
                        <div className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-full">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                    {t('business_card_scanner.capture_title')}
                                </h3>
                                <p className="text-gray-600 text-sm sm:text-base max-w-sm">
                                    {t('business_card_scanner.capture_description')}
                                </p>
                            </div>
                            
                            <div className="w-full max-w-sm space-y-3 sm:space-y-4">
                                {/* Camera button - Mobile optimized */}
                                <button
                                    onClick={startCamera}
                                    className="w-full flex flex-col items-center gap-3 p-4 sm:p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                >
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="font-medium text-sm sm:text-base">{t('business_card_scanner.take_photo')}</span>
                                    <span className="text-xs text-blue-100">{t('business_card_scanner.use_camera')}</span>
                                </button>

                                {/* File upload button - Mobile optimized */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex flex-col items-center gap-3 p-4 sm:p-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-medium text-sm sm:text-base">{t('business_card_scanner.upload_image')}</span>
                                    <span className="text-xs text-gray-500">{t('business_card_scanner.from_device')}</span>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {/* ✅ Mobile-optimized Camera view */}
                    {showCamera && (
                        <div className="p-3 sm:p-4 flex flex-col items-center min-h-full">
                            <div className="relative w-full max-w-2xl">
                                <div className="relative bg-black rounded-lg sm:rounded-xl overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-auto min-h-[250px] sm:min-h-[400px] object-cover"
                                    />
                                    
                                    {/* Mobile-optimized overlay guide */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            {/* Card frame overlay - responsive */}
                                            <div 
                                                className="border-2 border-white border-dashed rounded-lg"
                                                style={{
                                                    width: typeof window !== 'undefined' && window.innerWidth < 640 ? '200px' : '280px',
                                                    height: typeof window !== 'undefined' && window.innerWidth < 640 ? '130px' : '180px',
                                                    aspectRatio: '85.6/53.98'
                                                }}
                                            >
                                                {/* Corner guides - smaller on mobile */}
                                                <div className="absolute -top-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-t-2 sm:border-l-4 sm:border-t-4 border-yellow-400"></div>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-t-2 sm:border-r-4 sm:border-t-4 border-yellow-400"></div>
                                                <div className="absolute -bottom-1 -left-1 w-4 h-4 sm:w-6 sm:h-6 border-l-2 border-b-2 sm:border-l-4 sm:border-b-4 border-yellow-400"></div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 border-r-2 border-b-2 sm:border-r-4 sm:border-b-4 border-yellow-400"></div>
                                            </div>
                                            
                                            {/* Instructions - mobile optimized */}
                                            <div className="absolute -bottom-8 sm:-bottom-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg whitespace-nowrap">
                                                {t('business_card_scanner.position_card_instruction')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                                    <button
                                        onClick={stopCamera}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-sm sm:text-base"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        onClick={capturePhoto}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        </svg>
                                        <span className="hidden sm:inline">{t('business_card_scanner.capture_photo')}</span>
                                        <span className="sm:hidden">{t('business_card_scanner.capture')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ✅ Mobile-optimized Final Preview */}
                    {capturedImage && previewUrl && (
                        <div className="p-3 sm:p-4 flex flex-col items-center min-h-full">
                            <div className="w-full max-w-2xl">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center">
                                    {t('business_card_scanner.ready_to_scan')}
                                </h4>
                                
                                <div className="bg-gray-100 rounded-lg sm:rounded-xl p-2 sm:p-4 mb-3 sm:mb-4">
                                    <img
                                        src={previewUrl}
                                        alt={t('business_card_scanner.captured_card_alt')}
                                        className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain rounded-lg shadow-sm"
                                        onLoad={(e) => {
                                            console.log('✅ Final preview loaded successfully:', {
                                                width: e.target.naturalWidth,
                                                height: e.target.naturalHeight,
                                                displayWidth: e.target.width,
                                                displayHeight: e.target.height
                                            });
                                        }}
                                        onError={(e) => {
                                            console.error('❌ Final preview failed to load');
                                            console.error('❌ Image element details:', {
                                                src: e.target.src,
                                                complete: e.target.complete,
                                                naturalWidth: e.target.naturalWidth,
                                                naturalHeight: e.target.naturalHeight
                                            });
                                            toast.error(t('business_card_scanner.image_display_failed'));
                                        }}
                                    />
                                </div>
                                
                                <div className="flex gap-2 sm:gap-3">
                                    <button
                                        onClick={handleRetake}
                                        disabled={isProcessing}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium text-sm sm:text-base"
                                    >
                                        <span className="hidden sm:inline">{t('business_card_scanner.retake_photo')}</span>
                                        <span className="sm:hidden">{t('business_card_scanner.retake')}</span>
                                    </button>
                                    <button
                                        onClick={processImage}
                                        disabled={isProcessing}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
                                    >
                                        {isProcessing && (
                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                        )}
                                        {isProcessing ? t('business_card_scanner.processing') : (
                                            <>
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <span className="hidden sm:inline">{t('business_card_scanner.scan_card')}</span>
                                                <span className="sm:hidden">{t('business_card_scanner.scan')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hidden canvas for image processing */}
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            </div>
        </div>
    );
}