// lib/fileUpload.js
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { testForActiveSession } from "./authentication/testForActiveSession";
import { fireApp } from "@/important/firebase";

export const updateProfileFile = async (fileData) => {
    const username = testForActiveSession();

    if (username) {
        try {
            const AccountDocRef = collection(fireApp, "AccountData");
            const docRef = doc(AccountDocRef, `${username}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const previousData = docSnap.data();
                const objectToUpdate = {
                    ...previousData, 
                    profileFile: fileData // fileData can be null to remove the file
                };
                await setDoc(docRef, objectToUpdate);
                return;
            }

            // If document doesn't exist, create it
            await setDoc(docRef, { profileFile: fileData });
        } catch (error) {
            console.error("Error updating profile file:", error);
            throw new Error(error);
        }
    } else {
        throw new Error("User not authenticated");
    }
};