// Create this as: app/test-modal/page.jsx
import NFCLandingNav from "@/app/components/General Components/NFCLandingNav";

export default function TestModalPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <NFCLandingNav />
            
            <div className="container mx-auto px-4 pt-32 pb-16">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">
                        🧪 Modal Test Page
                    </h1>
                    
                    <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
                        <p className="text-gray-700 mb-4">
                            This page is testing the NFCLandingNav component with modal login.
                        </p>
                        <p className="text-sm text-gray-500">
                            Click Login or Sign Up in the navbar above. You should see modal popups, NOT page redirects.
                        </p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">Expected behavior:</h3>
                        <ul className="text-left text-yellow-700 text-sm space-y-1">
                            <li>• If not logged in: See Login and Sign Up buttons</li>
                            <li>• Click Login → Modal opens (no page redirect)</li>
                            <li>• After authentication → See Dashboar button</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}