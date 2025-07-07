// app/nfc-cards/customize/utils/FirebaseService.js - ENHANCED WITH STYLE OPTIONS
class FirebaseService {
    static async initializeAuth() {
        const { testForActiveSession } = await import('@/lib/authentication/testForActiveSession');
        
        const currentUserId = testForActiveSession(true);
        console.log('👤 User ID:', currentUserId);
        
        let userUsername = null;
        
        if (currentUserId) {
            try {
                const { fireApp } = await import('@/important/firebase');
                const { doc, getDoc } = await import('firebase/firestore');
                
                const userDocRef = doc(fireApp, "AccountData", currentUserId);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    userUsername = userData.username;
                    console.log('👤 Username:', userUsername);
                }
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        }
        
        return { currentUserId, userUsername };
    }

    static async fetchProducts() {
        const { fireApp } = await import('@/important/firebase');
        
        if (!fireApp) {
            throw new Error('Firestore is not initialized');
        }
        
        console.log('✅ Firestore imported:', !!fireApp);

        const { collection, getDocs } = await import('firebase/firestore');

        console.log('🔄 Fetching products...');
        
        const productsRef = collection(fireApp, "products");
        const querySnapshot = await getDocs(productsRef);
        
        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
            fetchedProducts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log('✅ Products fetched:', fetchedProducts.length);
        return fetchedProducts;
    }

    static async saveCustomCard({ 
        userId, 
        selectedProduct, 
        customValues, 
        logoUrl, 
        styleOptions, 
        frontSvg, 
        backSvg 
    }) {
        const { fireApp } = await import('@/important/firebase');
        
        if (!fireApp) {
            throw new Error('Firestore is not available');
        }

        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

        console.log('🔄 Creating user cards collection reference...');
        const userCardsRef = collection(fireApp, "AccountData", userId, "userCards");
        
        const newCardData = {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            customizedData: customValues,
            logoUrl: logoUrl,
            styleOptions: styleOptions, // ✅ NEW: Save style customizations
            frontSvg: frontSvg,         // ✅ NEW: Save front SVG
            backSvg: backSvg,           // ✅ NEW: Save back SVG
            createdAt: serverTimestamp(),
            linkedProfile: userId,
            // Keep legacy field for compatibility
            customizedSvg: backSvg,
        };
        
        console.log('🔄 Saving card data...');
        const newCardDoc = await addDoc(userCardsRef, newCardData);
        console.log('✅ Card saved with ID:', newCardDoc.id);
        
        return newCardDoc.id;
    }
}

export default FirebaseService;