import { fireApp } from "@/important/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize Firebase Storage
const storage = getStorage(fireApp);

export const uploadLogo = async (file, userId) => {
    if (!file || !userId) {
        throw new Error("File or User ID is missing for upload.");
    }

    // Create a unique file path to prevent overwrites
    const filePath = `logos/${userId}/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, filePath);

    try {
        console.log(`Uploading logo to: ${filePath}`);
        // Upload the file to the specified path
        const snapshot = await uploadBytes(storageRef, file);
        console.log("✅ Logo uploaded successfully!");

        // Get the public URL of the uploaded file
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("✅ Got download URL:", downloadURL);
        
        return downloadURL;

    } catch (error) {
        console.error("❌ Error during logo upload:", error);
        throw error;
    }
};