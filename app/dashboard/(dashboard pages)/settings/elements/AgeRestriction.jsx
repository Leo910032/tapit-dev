// /lib/update data/updateSocials.js

import { doc, updateDoc } from "firebase/firestore";
import { fireApp } from "@/important/firebase";

// ❌ REMOVED: import { testForActiveSession } from "@/lib/authentication/testForActiveSession";

export async function updateSensitiveType(type, userId) { // ✅ Now accepts userId
    if (!userId) { // ✅ Better validation
        console.error("updateSensitiveType: userId is required.");
        return;
    }

    const docRef = doc(fireApp, "AccountData", userId); // ✅ Uses the real Firebase UID
    await updateDoc(docRef, {
        sensitivetype: type
    });
}