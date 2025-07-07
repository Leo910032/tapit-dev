// app/dashboard/general components/Preview.jsx - FINAL, STABLE VERSION
"use client"
import { useEffect, useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import "../../styles/3d.css";
import { fireApp } from "@/important/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function Preview() {
    const { user, userData } = useAuth();
    const [iframeKey, setIframeKey] = useState(0);

    // This function is called by the listener when data changes.
    const reloadPreview = () => {
        // Use a small timeout to ensure Firestore has fully saved before we reload the iframe.
        setTimeout(() => {
            console.log('🔄 Reloading preview due to content change...');
            setIframeKey(prev => prev + 1);
        }, 500);
    };

    // ✅ HOOK 1: Manages the real-time Firestore listener.
    // It only depends on the user's ID, so it won't re-run unnecessarily.
    useEffect(() => {
        // Don't set up a listener if we don't have a user ID yet.
        if (!user?.uid) {
            return;
        }

        console.log('👂 Preview: Setting up Firestore listener for user:', user.uid);
        const docRef = doc(fireApp, "AccountData", user.uid);

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                console.log('📝 Preview: Firestore data changed. Triggering reload.');
                // When data changes, we call the function to update the iframe key.
                reloadPreview();
            }
        }, (error) => {
            console.error('❌ Preview: Firestore listener error:', error);
        });

        // The cleanup function provided by onSnapshot is returned here.
        // React will call this when the component unmounts or if user.uid changes.
        return () => {
            console.log('🧹 Preview: Cleaning up Firestore listener.');
            unsubscribe();
        };

    }, [user?.uid]); // This effect ONLY re-runs if the user logs in or out.

    // ✅ HOOK 2: Manages the 3D animation setup.
    // It has an empty dependency array, so it runs only once when the component mounts.
    useEffect(() => {
        const container = document.getElementById("container");
        const inner = document.getElementById("inner");
        if (!container || !inner) return;

        console.log('🎨 Preview: Setting up 3D animations.');
        
        const mouse = {
            _x: 0, _y: 0, x: 0, y: 0,
            updatePosition: function (event) {
                const e = event || window.event;
                this.x = e.clientX - this._x;
                this.y = (e.clientY - this._y) * -1;
            },
            setOrigin: function (e) {
                this._x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
                this._y = e.offsetTop + Math.floor(e.offsetHeight / 2);
            },
        };
        mouse.setOrigin(container);
        let counter = 0;
        const updateRate = 10;
        const isTimeToUpdate = () => counter++ % updateRate === 0;
        const onMouseEnterHandler = (event) => update(event);
        const onMouseLeaveHandler = () => inner.style.transform = "";
        const onMouseMoveHandler = (event) => { if (isTimeToUpdate()) update(event); };
        const update = (event) => {
            mouse.updatePosition(event);
            updateTransformStyle((mouse.y / inner.offsetHeight / 2).toFixed(2), (mouse.x / inner.offsetWidth / 2).toFixed(2));
        };
        const updateTransformStyle = (x, y) => {
            const style = `rotateX(${x}deg) rotateY(${y}deg) scale(0.8)`;
            inner.style.transform = style;
        };
        container.onmouseenter = onMouseEnterHandler;
        container.onmouseleave = onMouseLeaveHandler;
        container.onmousemove = onMouseMoveHandler;

        return () => {
            if (container) {
                container.onmouseenter = null;
                container.onmouseleave = null;
                container.onmousemove = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only once.

    // The dashboard layout now acts as the gatekeeper, so we can be confident
    // that when this component renders, 'userData' exists.
    const previewUsername = userData?.username;

    return (
        <div className="w-[35rem] md:grid hidden place-items-center border-l ml-4 relative">
             <div className='w-fit h-fit' id='container'>
                <div className="h-[45rem] scale-[0.8] w-[23rem] bg-black rounded-[3rem] grid place-items-center" id="inner">
                    <div className="h-[97.5%] w-[95%] bg-white bg-opacity-[.1] grid place-items-center rounded-[2.5rem] overflow-hidden relative border">
                        
                        {/* Phone camera notch */}
                        <div className='absolute h-[20px] w-[20px] rounded-full top-2 bg-black'></div>
                        
                        <div className="h-full w-full">
                           {/* The key is what forces the iframe to reload when state changes */}
                           <iframe 
                                key={`preview-${previewUsername}-${iframeKey}`}
                                src={`https://www.tapit.fr/${previewUsername}?preview=true&v=${iframeKey}`}
                                frameBorder="0" 
                                className='h-full bg-white w-full'
                                title={`Preview for ${previewUsername}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}