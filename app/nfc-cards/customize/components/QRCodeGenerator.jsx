// app/nfc-cards/customize/components/QRCodeGenerator.jsx - ENHANCED WITH SIZE
"use client";
import { useEffect } from 'react';

export default function QRCodeGenerator({ userId, username, size = 100, onQRCodeGenerated }) {
    useEffect(() => {
        const generateQRCode = async () => {
            if (!userId || !username) {
                onQRCodeGenerated("");
                return;
            }

            try {
                // Import QRCode dynamically to avoid SSR issues
                const QRCode = (await import('qrcode.react')).default;
                const React = (await import('react')).default;
                const { createRoot } = await import('react-dom/client');

                // Create a temporary container
                const tempContainer = document.createElement('div');
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                document.body.appendChild(tempContainer);

                // Create React root and render QR code
                const root = createRoot(tempContainer);
                
                // Use username for the profile URL
                const userProfileUrl = `${window.location.origin}/${username}`;
                
                console.log('🔄 Generating QR code for:', userProfileUrl, 'Size:', size);
                
                // Create a promise to get the canvas data
                const getQRCodeDataUrl = () => {
                    return new Promise((resolve) => {
                        // A function to be called to get the data URL
                        const extractDataUrl = () => {
                            const canvas = tempContainer.querySelector('canvas');
                            if (canvas) {
                                const dataUrl = canvas.toDataURL('image/png');
                                resolve(dataUrl);
                            } else {
                                // If canvas is not found, resolve with empty string
                                resolve("");
                            }
                        };
                        
                        // Render QR code component with dynamic size
                        // The 'onLoad' prop is not standard in qrcode.react, so we'll use a timeout
                        root.render(
                            React.createElement(QRCode, {
                                value: userProfileUrl,
                                size: size, // Use dynamic size
                                level: 'M',
                            })
                        );
                        
                        // Use a short timeout to allow the canvas to render
                        setTimeout(extractDataUrl, 100);
                    });
                };

                const dataUrl = await getQRCodeDataUrl();
                console.log('✅ QR code generated successfully with size:', size);
                onQRCodeGenerated(dataUrl);

                // Cleanup
                root.unmount();
                document.body.removeChild(tempContainer);

            } catch (error) {
                console.error('❌ Error generating QR code:', error);
                onQRCodeGenerated("");
            }
        };

        generateQRCode();
    }, [userId, username, size, onQRCodeGenerated]);

    // This component doesn't render anything visible
    return null;
}