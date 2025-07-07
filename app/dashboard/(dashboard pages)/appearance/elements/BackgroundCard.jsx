// app/dashboard/(dashboard pages)/appearance/elements/BackgroundCard.jsx - FIXED for Firebase Auth
"use client";

import { useAuth } from "@/contexts/AuthContext"; // ✅ 1. Import the new Firebase Auth context
import { appStorage, fireApp } from "@/important/firebase";
import {
  updateThemeBackground,
  backgroundImageUpload,
  backgroundVideoUpload,
} from "@/lib/update data/updateTheme"; // ✅ Assumed these are updated, if not, they also need to be fixed
import { collection, doc, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";
import { backgroundContext } from "../components/Backgrounds";
import { toast } from "react-hot-toast";
import { generateUniqueId } from "@/lib/utilities";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function BackgroundCard({ type, text, colorValue, backImg }) {
  const { user, userData, loading: authLoading } = useAuth(); // ✅ 2. Get user and loading state from the context
  const { setIsGradient } = useContext(backgroundContext);
  const [isSelected, setIsSelected] = useState(false);
  const [uploadedFilePreview, setUploadedFilePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const formRef = useRef();
  const inputRef = useRef();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      return;
    }

    if (type === "image" && selectedFile.size > 2 * 1024 * 1024) {
      toast.error("Please select an image smaller than 2MB.");
      return;
    }

    if (type === "video" && selectedFile.size > 20 * 1024 * 1024) {
      toast.error("Please select a video smaller than 20MB.");
      return;
    }

    const previewImageURL = URL.createObjectURL(selectedFile);
    setUploadedFilePreview(previewImageURL);
    setUploadedFile(selectedFile);
    setPreviewing(true);
  };

  const handleUploadFile = async () => {
    if (uploadedFile === "") {
      return;
    }

    const file = `${generateUniqueId()}.${uploadedFile.name
      .substring(uploadedFile.name.lastIndexOf(".") + 1)}`;
    const filePath = type === "image" ? "backgroundImage" : "backgroundVideo";
    const storageRef01 = ref(appStorage, `${filePath}/${file}`);
    let fileUrl = "";

    await uploadBytes(storageRef01, uploadedFile).then(async (snapshot) => {
      await getDownloadURL(snapshot.ref).then((url) => {
        fileUrl = url;
      });
    });

    return fileUrl;
  };

  // Map type to the text expected by updateThemeBackground
  const getBackgroundTypeForUpdate = (type) => {
    const typeMap = {
      flat_color: "Flat Colour",
      gradient: "Gradient",
      image: "Image",
      video: "Video",
      polka: "Polka",
      stripe: "Stripe",
      waves: "Waves",
      zig_zag: "Zig Zag",
    };
    return typeMap[type] || type;
  };

  const handleUpdateTheme = async () => {
    // ✅ 3. Ensure user is logged in before updating
    if (!user) {
        toast.error("You must be logged in to change the theme.");
        return;
    }
    // The `updateThemeBackground` function should also be updated to use the user's UID from AuthContext
    await updateThemeBackground(getBackgroundTypeForUpdate(type));
  };

  const handleImagePickingProcess = async () => {
    if (!user) {
        toast.error("Authentication required.");
        return;
    }
    setIsLoading(true);
    try {
      const getImageUrl = await handleUploadFile();
      // This function now needs the UID to know which document to update
      await backgroundImageUpload(getImageUrl, user.uid); 
      setIsLoading(false);

      await handleUpdateTheme();
      handleReset();
    } catch (error) {
      setIsLoading(false);
      console.error("Image picking process failed:", error);
      throw new Error("Image picking process failed");
    }
  };

  const handleVideoPickingProcess = async () => {
    if (!user) {
        toast.error("Authentication required.");
        return;
    }
    setIsLoading(true);
    try {
      const getVideoUrl = await handleUploadFile();
      // This function now needs the UID to know which document to update
      await backgroundVideoUpload(getVideoUrl, user.uid);
      setIsLoading(false);

      await handleUpdateTheme();
      handleReset();
    } catch (error) {
      setIsLoading(false);
      console.error("Video picking process failed:", error);
      throw new Error("Video picking process failed");
    }
  };

  const handleReset = () => {
    if (isLoading) {
      return;
    }
    if (formRef.current) {
        formRef.current.reset();
    }
    setUploadedFile("");
    setPreviewing(false);
  };

  function functionType() {
    switch (type) {
      case "image":
        inputRef.current.click();
        break;
      case "video":
        inputRef.current.click();
        break;
      default:
        handleUpdateTheme();
        break;
    }
  }

  const toastHandler = () => {
    const promise = type === "image" ? handleImagePickingProcess() : handleVideoPickingProcess();
    toast.promise(
      promise,
      {
        loading: "Uploading file...",
        success: "File uploaded!",
        error: "An error occurred!",
      },
      {
        style: {
          border: "1px solid #8129D9",
          padding: "16px",
          color: "#8129D9",
        },
        iconTheme: {
          primary: "#8129D9",
          secondary: "#FFFAEE",
        },
      }
    );
  };

  // ✅ 4. COMPLETE REWRITE of the useEffect hook for fetching theme data
  useEffect(() => {
    // Don't run anything if auth is still loading or user is not logged in.
    if (authLoading || !user) {
        return;
    }

    console.log(`🎨 BackgroundCard: Setting up listener for user ${user.uid}`);
    
    // Set up the listener using the correct Firebase UID
    const collectionRef = collection(fireApp, "AccountData");
    const docRef = doc(collectionRef, user.uid); // Use the real UID

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const { backgroundType } = docSnap.data();
            console.log(`🎨 BackgroundCard: Received backgroundType: ${backgroundType}`);
            setIsGradient(backgroundType === "Gradient");
            setIsSelected(backgroundType === getBackgroundTypeForUpdate(type));
        } else {
            console.warn(`⚠️ BackgroundCard: No document found for user ${user.uid}`);
        }
    }, (error) => {
        console.error("❌ BackgroundCard: Firestore listener error:", error);
    });

    // Return the cleanup function to prevent memory leaks
    return () => {
        console.log("🧹 BackgroundCard: Cleaning up listener.");
        unsubscribe();
    };
  }, [authLoading, user, type]); // ✅ 5. Correct dependencies

  // ✅ 6. Add a loading skeleton state while authentication is resolving
  if (authLoading) {
    return (
        <div className="min-w-[8rem] flex-1 items-center flex flex-col animate-pulse">
            <div className="w-full h-[13rem] bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-20 bg-gray-200 rounded mt-3"></div>
        </div>
    );
  }

  return (
    <div className="min-w-[8rem] flex-1 items-center flex flex-col">
      <div
        className={`w-full h-[13rem] relative ${
          !colorValue && !backImg ? "border-dashed border-black" : ""
        } border rounded-lg hover:scale-105 active:scale-90 grid place-items-center cursor-pointer overflow-hidden`}
        onClick={functionType}
      >
        {isSelected && (
          <div className="h-full w-full absolute top-0 left-0 bg-black bg-opacity-[0.5] grid place-items-center z-10 text-white text-xl">
            <FaCheck />
          </div>
        )}
        {colorValue ? (
          <div
            className="h-full w-full"
            style={{ backgroundColor: `${colorValue}` }}
          ></div>
        ) : backImg ? (
          <div
            className="h-full w-full bg-cover bg-no-repeat"
            style={{ backgroundImage: `${backImg}` }}
          ></div>
        ) : (
          <div className="h-full w-full grid place-items-center">
            {type === "image" && (
              <input
                type="file"
                className="absolute opacity-0 pointer-events-none"
                ref={inputRef}
                accept="image/*"
                onChange={handleFileChange}
              />
            )}
            {type === "video" && (
              <input
                type="file"
                className="absolute opacity-0 pointer-events-none"
                ref={inputRef}
                accept="video/*"
                onChange={handleFileChange}
              />
            )}
            <div className="bg-black bg-opacity-[0.1] rounded-lg p-1">
              <Image
                src={"https://linktree.sirv.com/Images/icons/image.svg"}
                alt={text}
                height={27}
                width={27}
              />
            </div>
          </div>
        )}
      </div>
      <span className="py-3 text-sm">{text}</span>
      {previewing && (
        <div className="fixed top-0 left-0 h-screen w-screen grid place-items-center z-[999999999999999]">
          <div
            className="absolute h-full w-full bg-black bg-opacity-[0.25] backdrop-blur-[1px] top-0 left-0 p-2"
            onClick={handleReset}
          ></div>
          <form
            ref={formRef}
            className="relative z-10 sm:max-w-[30rem] max-w-18 max-h-[80vh] overflow-hidden p-4"
          >
            <div className="w-full scale-[0.95] relative overflow-hidden place-items-center grid aspect-square bg-white">
              {type === "image" && (
                <Image
                  src={uploadedFilePreview}
                  alt="profile pic"
                  height={1000}
                  width={1000}
                  priority
                  className="min-w-[10rem] w-full object-contain min-h-full"
                />
              )}
              {type === "video" && (
                <video
                  className="min-w-[10rem] w-full object-contain min-h-full"
                  controls
                >
                  <source src={uploadedFilePreview} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              {isLoading && (
                <div className="absolute z-10 h-full w-full scale-110 grid place-items-center bg-black bg-opacity-[0.25] mix-blend-screen">
                  <Image
                    src={"https://linktree.sirv.com/Images/gif/loading.gif"}
                    width={50}
                    height={50}
                    alt="loading"
                    className="mix-blend-screen"
                  />
                </div>
              )}
            </div>
            {!isLoading && (
              <div
                className="absolute top-2 right-2 rounded-full p-2 hover:bg-red-500 active:scale-90 bg-black text-white text-sm cursor-pointer"
                onClick={handleReset}
              >
                <FaX />
              </div>
            )}
            {!isLoading && (
              <div
                className="p-3 text-lg text-white bg-btnPrimary w-fit rounded-full mx-auto active:bg-btnPrimaryAlt active:scale-90 hover:scale-110 cursor-pointer my-3"
                onClick={toastHandler}
              >
                <FaCheck />
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}