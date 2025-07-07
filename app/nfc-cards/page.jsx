// app/nfc-cards/page.jsx - CLEANED UP
import Link from "next/link";

export const generateMetadata = () => {
    return {
        title: "TapIt | NFC Cards",
        description: "Get your custom NFC card"
    }
}

export default function NFCCardsPage() {
    return (
        // The <LandingNav /> is removed because the new layout provides it
        <div className="container mx-auto px-4 pt-32 pb-16">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    NFC Cards
                </h1>
                
                <p className="text-lg text-gray-600 mb-12">
                    Get your custom NFC card that links to your TapIt profile
                </p>
                
                <Link 
                    href="/nfc-cards/customize" 
                    className="inline-block bg-themeGreen text-white px-8 py-4 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-transform"
                >
                    Customize Your Card
                </Link>
            </div>
        </div>
    );
}