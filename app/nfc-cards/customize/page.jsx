// app/nfc-cards/customize/page.jsx - ENHANCED WITH STYLE CUSTOMIZATION
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

// Import custom components
import CustomizationForm from "./components/CustomizationForm";
import LivePreview from "./components/LivePreview";
import QRCodeGenerator from "./components/QRCodeGenerator";
import StyleCustomizer from "./components/StyleCustomizer";
import FirebaseService from "./utils/FirebaseService";

const DEFAULT_SVG = `<svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg"><rect width="500" height="300" rx="15" fill="#e5e7eb"/><text x="250" y="150" text-anchor="middle" font-family="Arial" font-size="20" fill="#9ca3af">Loading products...</text></svg>`;

export default function CustomizePage() {
    const router = useRouter();
    
    // Page status
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Customization state
    const [customValues, setCustomValues] = useState({});
    const [frontSvg, setFrontSvg] = useState(DEFAULT_SVG);
    const [backSvg, setBackSvg] = useState(DEFAULT_SVG);
    const [isUploading, setIsUploading] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

    // ✅ NEW: Style customization state
    const [styleOptions, setStyleOptions] = useState({
        backgroundColor: "#667eea",
        textColor: "#ffffff",
        textSize: "16",
        logoSize: "60",
        qrSize: "60"
    });

    // Initialize Firebase and load data
    useEffect(() => {
        const initializePage = async () => {
            try {
                console.log('🔄 Starting Firebase initialization...');

                if (typeof window === 'undefined') {
                    console.log('❌ Not on client side, skipping initialization');
                    return;
                }

                // Get user authentication
                const { currentUserId, userUsername } = await FirebaseService.initializeAuth();
                setUserId(currentUserId);
                setUsername(userUsername);

                // Fetch products
                const fetchedProducts = await FirebaseService.fetchProducts();
                setProducts(fetchedProducts);
                
                if (fetchedProducts.length > 0) {
                    handleProductSelect(fetchedProducts[0]);
                }
            } catch (error) {
                console.error("❌ Error initializing page:", error);
                toast.error(`Failed to load products: ${error.message}`);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(initializePage, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    // ✅ ENHANCED: Update both front and back SVG previews
    useEffect(() => {
        if (!selectedProduct) {
            setFrontSvg(DEFAULT_SVG);
            setBackSvg(DEFAULT_SVG);
            return;
        }
        
        // Generate Front SVG
        const frontTemplate = selectedProduct.templateSvg;
        if (frontTemplate) {
            let updatedFrontSvg = applyStyleCustomization(frontTemplate, "front");
            updatedFrontSvg = updatedFrontSvg.replace(/__LOGO_HREF__/g, logoUrl || "");
            setFrontSvg(updatedFrontSvg);
        }

        // Generate Back SVG
        const backTemplate = selectedProduct.backTemplateSvg || selectedProduct.templateSvg;
        if (backTemplate) {
            let updatedBackSvg = applyStyleCustomization(backTemplate, "back");
            
            // Replace text placeholders for back side
            selectedProduct.customizableFields?.forEach(field => {
                const value = customValues[field.id] || '';
                updatedBackSvg = updatedBackSvg.replace(new RegExp(field.placeholderKey, 'g'), value);
            });

            updatedBackSvg = updatedBackSvg.replace(/__LOGO_HREF__/g, logoUrl || "");
            
            // Handle QR code
            if (userId && username && qrCodeDataUrl) {
                updatedBackSvg = updatedBackSvg.replace(/__QR_CODE_DATA_URL__/g, qrCodeDataUrl);
                updatedBackSvg = updatedBackSvg.replace(/__QR_FALLBACK_DISPLAY__/g, "none");
            } else {
                updatedBackSvg = updatedBackSvg.replace(/__QR_CODE_DATA_URL__/g, "");
                updatedBackSvg = updatedBackSvg.replace(/__QR_FALLBACK_DISPLAY__/g, "block");
            }
            
            setBackSvg(updatedBackSvg);
        }
    }, [customValues, selectedProduct, logoUrl, userId, username, qrCodeDataUrl, styleOptions]);

    // ✅ NEW: Apply style customization to SVG
    const applyStyleCustomization = (svgTemplate, side) => {
        let updatedSvg = svgTemplate;
        
        // Replace background color
        updatedSvg = updatedSvg.replace(/#667eea/g, styleOptions.backgroundColor);
        updatedSvg = updatedSvg.replace(/#764ba2/g, adjustColor(styleOptions.backgroundColor, -20));
        
        // Replace text colors
        updatedSvg = updatedSvg.replace(/fill="#FFFFFF"/g, `fill="${styleOptions.textColor}"`);
        updatedSvg = updatedSvg.replace(/fill="rgba\(255,255,255,0\.\d+\)"/g, `fill="${styleOptions.textColor}"`);
        
        // Adjust text sizes
        const baseFontSize = parseInt(styleOptions.textSize);
        updatedSvg = updatedSvg.replace(/font-size="32"/g, `font-size="${baseFontSize + 16}"`); // Name
        updatedSvg = updatedSvg.replace(/font-size="16"/g, `font-size="${baseFontSize}"`); // Job title
        updatedSvg = updatedSvg.replace(/font-size="14"/g, `font-size="${baseFontSize - 2}"`); // Company
        updatedSvg = updatedSvg.replace(/font-size="13"/g, `font-size="${baseFontSize - 3}"`); // Contact
        
        // Adjust logo size
        const logoSize = parseInt(styleOptions.logoSize);
        if (side === "front") {
            // Front side - centered logo (can be much larger)
            updatedSvg = updatedSvg.replace(/width="60" height="60"/g, `width="${logoSize}" height="${logoSize}"`);
            updatedSvg = updatedSvg.replace(/x="220" y="90"/g, `x="${250 - logoSize/2}" y="${120 - logoSize/2}"`);
            updatedSvg = updatedSvg.replace(/border-radius: 30px/g, `border-radius: ${logoSize/2}px`);
        } else {
            // Back side - corner logo (smaller but still scalable)
            const backLogoSize = Math.min(logoSize * 0.6, 80); // Max 80px on back, 60% of front size
            updatedSvg = updatedSvg.replace(/width="40" height="40"/g, `width="${backLogoSize}" height="${backLogoSize}"`);
            updatedSvg = updatedSvg.replace(/x="40" y="40"/g, `x="${60 - backLogoSize/2}" y="${60 - backLogoSize/2}"`);
            updatedSvg = updatedSvg.replace(/border-radius: 20px/g, `border-radius: ${backLogoSize/2}px`);
        }
        
        // Adjust QR code size
        const qrSize = parseInt(styleOptions.qrSize);
        updatedSvg = updatedSvg.replace(/width="70" height="70"/g, `width="${qrSize + 10}" height="${qrSize + 10}"`);
        updatedSvg = updatedSvg.replace(/width="60" height="60"/g, `width="${qrSize}" height="${qrSize}"`);
        
        return updatedSvg;
    };

    // ✅ NEW: Color adjustment helper
    const adjustColor = (hex, percent) => {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };

    // Event handlers
    const handleCustomValueChange = (fieldId, value) => {
        setCustomValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleStyleChange = (property, value) => {
        setStyleOptions(prev => ({ ...prev, [property]: value }));
    };
    
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        const initialValues = {};
        product.customizableFields?.forEach(field => {
            initialValues[field.id] = field.defaultValue || '';
        });
        setCustomValues(initialValues);
    };

    const handleLogoUpload = (url) => {
        if (url) {
            setLogoUrl(url);
            toast.success("Logo uploaded successfully!");
        } else {
            toast.error("Logo upload failed.");
        }
        setIsUploading(false);
    };
    
    const handleProceedToCheckout = async () => {
        if (!userId) {
            toast.error("Please log in to continue");
            router.push('/nfc-cards/login?returnUrl=/nfc-cards/customize');
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading("Saving your custom card...");

        try {
            const cardId = await FirebaseService.saveCustomCard({
                userId,
                selectedProduct,
                customValues,
                logoUrl,
                styleOptions,
                frontSvg,
                backSvg
            });
            
            toast.dismiss(loadingToast);
            toast.success("Card saved! Proceeding to checkout...");

            sessionStorage.setItem('cartItem', JSON.stringify({ 
                cardId, 
                price: selectedProduct.price 
            }));
            
            setTimeout(() => router.push('/nfc-cards/checkout'), 1500);

        } catch (error) {
            console.error("❌ Error saving card:", error);
            toast.dismiss(loadingToast);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="pt-32 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-themeGreen mx-auto mb-4"></div>
                <div>Loading products from Firebase...</div>
            </div>
        );
    }

    // No products state
    if (products.length === 0) {
        return (
            <div className="pt-32 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">No products found</h1>
                <p className="text-gray-600">Please check your Firebase connection or add products to the products collection</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-themeGreen text-white rounded-lg hover:bg-green-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 pt-32 pb-16">
            <Toaster position="bottom-center" />
            
            {/* QR Code Generator (hidden component) */}
            <QRCodeGenerator 
                userId={userId}
                username={username}
                size={parseInt(styleOptions.qrSize)}
                onQRCodeGenerated={setQrCodeDataUrl}
            />
            
            <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
                
                {/* Left: Customization Form */}
                <div className="lg:col-span-1">
                    <CustomizationForm
                        products={products}
                        selectedProduct={selectedProduct}
                        customValues={customValues}
                        userId={userId}
                        logoUrl={logoUrl}
                        isUploading={isUploading}
                        onProductSelect={handleProductSelect}
                        onCustomValueChange={handleCustomValueChange}
                        onLogoUploadStart={() => setIsUploading(true)}
                        onLogoUploadComplete={handleLogoUpload}
                    />

                    {/* ✅ NEW: Style Customizer */}
                    <StyleCustomizer
                        styleOptions={styleOptions}
                        onStyleChange={handleStyleChange}
                    />
                </div>
                
                {/* Right: Dual Preview */}
                <div className="lg:col-span-2">
                    <LivePreview
                        frontSvg={frontSvg}
                        backSvg={backSvg}
                        isSaving={isSaving}
                        selectedProduct={selectedProduct}
                        onProceedToCheckout={handleProceedToCheckout}
                    />
                </div>
            </div>
        </div>
    );
}