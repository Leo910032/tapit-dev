// app/dashboard/appearance/elements/ProfileImageManager.jsx - FIXED for Firebase Auth
"use client"

import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import useAuth
import { generateUniqueId } from "@/lib/utilities";
import Image from "next/image";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { updateProfilePhoto } from "@/lib/update data/imageUpload";
import { FaCheck, FaX } from "react-icons/fa6";
import { appStorage, fireApp } from "@/important/firebase";
import { toast } from "react-hot-toast";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useTranslation } from "@/lib/useTranslation";
// ❌ 2. Remove old, unused import
// import { testForActiveSession } from "@/lib/authentication/testForActiveSession";

export default function ProfileImageManager() {
    const { t } = useTranslation();
    const { user, userData, loading: authLoading } = useAuth(); // ✅ 3. Get user and loading state from AuthContext
    const [uploadedPhoto, setUploadedPhoto] = useState('');
    const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState('');
    const [profilePicture, setProfilePicture] = useState(null); // This will now hold a URL or null
    const [isLoading, setIsLoading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const inputRef = useRef();
    const formRef = useRef();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const previewImageURL = URL.createObjectURL(selectedFile);
        setUploadedPhotoPreview(previewImageURL);
        setUploadedPhoto(selectedFile);
        setPreviewing(true);
    };

    const handleUploadPhoto = async () => {
        if (!uploadedPhoto) return null;

        const photo = `${generateUniqueId()}.${(uploadedPhoto.name).substring((uploadedPhoto.name).lastIndexOf('.') + 1)}`;
        const storageRef = ref(appStorage, `profilePhoto/${photo}`);
        const snapshot = await uploadBytes(storageRef, uploadedPhoto);
        return await getDownloadURL(snapshot.ref);
    }

    const handleUpdateUserInfo = async () => {
        setIsLoading(true);
        try {
            const getImageUrl = await handleUploadPhoto();
            await updateProfilePhoto(getImageUrl); // This function should already use the user's UID
            setIsLoading(false);
            handleReset();
        } catch (error) {
            setIsLoading(false);
            console.error("❌ ProfileImageManager: Error updating photo:", error);
            throw error; // Re-throw for toast.promise
        }
    }

    const handleRemoveProfilePicture = async () => {
        setIsRemoving(true);
        try {
            await updateProfilePhoto(null); // Send null to indicate removal
            setIsRemoving(false);
        } catch (error) {
            setIsRemoving(false);
            console.error("❌ ProfileImageManager: Error removing photo:", error);
            throw error;
        }
    }

    const toastHandler = () => {
        toast.promise(
            handleUpdateUserInfo(),
            {
                loading: t("profile_image.setting_new_picture"),
                success: t("profile_image.picture_set"),
                error: t("profile_image.error_occurred")
            },
            { /* ... toast styles ... */ }
        );
    }

    const handleReset = () => {
        if (isLoading) return;
        if (formRef.current) formRef.current.reset();
        setUploadedPhoto('');
        setPreviewing(false);
    }

    // ✅ 4. Refactor useEffect to use Firebase Auth
    useEffect(() => {
        if (authLoading || !user) {
            // Don't do anything if auth is loading or user is not logged in
            return;
        }

        const docRef = doc(fireApp, "AccountData", user.uid); // Use Firebase UID

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfilePicture(data.profilePhoto || null); // Store the URL or null
            } else {
                console.warn("⚠️ ProfileImageManager: No user document found.");
                setProfilePicture(null);
            }
        }, (error) => {
            console.error("❌ ProfileImageManager: Error fetching profile picture:", error);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();

    }, [user, authLoading]); // Dependency array now uses auth state

    // ✅ 5. Add a robust loading state
    if (authLoading) {
        return (
            <div className="flex w-full p-6 items-center gap-4 animate-pulse">
                <div className="h-[6rem] w-[6rem] rounded-full bg-gray-200"></div>
                <div className="flex-1 grid gap-2">
                    <div className="h-12 bg-gray-200 rounded-3xl"></div>
                    <div className="h-12 bg-gray-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    // ✅ 6. Render the UI based on the fetched data (much cleaner)
    const renderProfileImage = () => {
        if (profilePicture) {
            return (
                <Image
                    src={profilePicture}
                    alt={t("profile_image.profile_alt")}
                    fill
                    className="object-cover"
                    priority
                />
            );
        }
        // Fallback to initial
        const initial = userData?.displayName?.charAt(0)?.toUpperCase() || '';
        return (
            <div className="h-full w-full rounded-full bg-gray-300 border grid place-items-center">
                <span className="text-3xl font-semibold">{initial}</span>
            </div>
        );
    };

    return (
        <div className="flex w-full p-6 items-center gap-4">
            <div className="h-[6rem] w-[6rem] cursor-pointer rounded-full grid place-items-center border overflow-hidden relative" onClick={() => inputRef.current.click()}>
                {renderProfileImage()}
            </div>
            <div className="flex-1 grid gap-2 relative">
                <input type="file" className="absolute opacity-0 pointer-events-none" ref={inputRef} accept="image/*" onChange={handleFileChange} />
                <button className="flex items-center gap-3 justify-center p-3 rounded-3xl cursor-pointer active:scale-95 active:opacity-60 active:translate-y-1 hover:scale-[1.005] bg-btnPrimary text-white w-full" onClick={() => inputRef.current.click()}>
                    {t("profile_image.pick_image")}
                </button>
                <button className="flex items-center gap-3 justify-center p-3 rounded-3xl mix-blend-multiply cursor-pointer active:scale-95 active:opacity-60 active:translate-y-1 hover:scale-[1.005] border w-full" onClick={handleRemoveProfilePicture} disabled={isRemoving}>
                    {isRemoving ? (
                        <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        t("profile_image.remove")
                    )}
                </button>
            </div>
            {previewing && (
                <div className="fixed top-0 left-0 h-screen w-screen grid place-items-center z-[999]">
                    <div className="absolute h-full w-full bg-black bg-opacity-25 backdrop-blur-sm top-0 left-0" onClick={handleReset}></div>
                    <form ref={formRef} className="relative z-10 max-w-sm w-full mx-4">
                        <div className="w-full relative rounded-full overflow-hidden grid place-items-center aspect-square bg-white">
                            <Image src={uploadedPhotoPreview} alt={t("profile_image.profile_pic_alt")} fill className="object-contain" priority />
                            {isLoading && (
                                <div className="absolute z-10 h-full w-full grid place-items-center bg-white bg-opacity-50">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        {!isLoading && (
                            <>
                                <button type="button" className="absolute top-4 right-4 rounded-full p-2 hover:bg-red-500 active:scale-90 bg-black text-white text-sm cursor-pointer" onClick={handleReset}>
                                    <FaX />
                                </button>
                                <button type="button" className="p-4 text-xl text-white bg-btnPrimary w-fit rounded-full mx-auto my-4 block active:bg-btnPrimaryAlt active:scale-90 hover:scale-110 cursor-pointer" onClick={toastHandler}>
                                    <FaCheck />
                                </button>
                            </>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
}