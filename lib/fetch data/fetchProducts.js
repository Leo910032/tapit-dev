import { fireApp } from "@/important/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export const fetchProducts = async () => {
    try {
        const productsRef = collection(fireApp, "products");
        const q = query(productsRef, orderBy("sortOrder", "asc")); 
        const querySnapshot = await getDocs(q);
        
        const products = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // This now automatically includes the `templateSvg` field if it exists
            return {
                id: doc.id,
                ...data
            };
        });

        console.log("✅ Successfully fetched products (with SVG templates if available):", products);
        return products;

    } catch (error) {
        console.error("❌ Error fetching products:", error);
        return [];
    }
};