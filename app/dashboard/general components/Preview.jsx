// app/dashboard/general components/Preview.jsx - SMART RELOAD SYSTEM
"use client"
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import "../../styles/3d.css";
import { getSessionCookie } from '@/lib/authentication/session';
import { fetchUserData } from '@/lib/fetch data/fetchUserData';
import { fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

export default function Preview() {
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [iframeKey, setIframeKey] = useState(0); // For forcing iframe reload
    const [lastContentHash, setLastContentHash] = useState(''); // Track content changes
    const iframeRef = useRef(null);

    // 🔧 Function to force iframe reload (only when content changes)
    const reloadPreview = () => {
        console.log('🔄 Reloading preview - content changed');
        setIframeKey(prev => prev + 1);
    };

    useEffect(() => {
        async function initializePreview() {
            try {
                console.log('🔍 Preview: Starting initialization...');
                
                const sessionUsername = getSessionCookie("adminLinker");
                console.log('🔍 Preview: Session username:', sessionUsername);
                
                if (sessionUsername === undefined) {
                    console.log('❌ Preview: No session username found');
                    setError('No session found');
                    setIsLoading(false);
                    return;
                }

                console.log('🔍 Preview: Fetching user data...');
                const data = await fetchUserData(sessionUsername);
                console.log('🔍 Preview: User data result:', data);
                
                if (data?.username) {
                    console.log('✅ Preview: Setting username:', data.username);
                    setUsername(data.username);
                    setError(null);
                    
                    // 🔧 Start listening for content changes after we have the username
                    setupContentListener(data.username, sessionUsername);
                } else {
                    console.log('⚠️ Preview: No username in data, using session username');
                    setUsername(sessionUsername);
                    setError(null);
                    
                    // Still setup listener with session username
                    setupContentListener(sessionUsername, sessionUsername);
                }
                
            } catch (err) {
                console.error('❌ Preview: Error during initialization:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        // 🔧 Setup real-time listener for profile content changes
        async function setupContentListener(profileUsername, sessionUsername) {
            try {
                console.log('🔍 Setting up content change listener for:', profileUsername);
                
                // Get the actual user ID for Firestore
                const userId = await fetchUserData(sessionUsername);
                if (!userId) return;

                const collectionRef = collection(fireApp, "AccountData");
                const docRef = doc(collectionRef, userId);

                // Listen for changes in real-time
                const unsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        
                        // 🔧 Create a hash of the content that affects the preview
                        const contentToTrack = {
                            links: data.links || [],
                            displayName: data.displayName || '',
                            bio: data.bio || '',
                            profilePhoto: data.profilePhoto || '',
                            selectedTheme: data.selectedTheme || '',
                            // Add other fields that should trigger a reload
                        };
                        
                        const newContentHash = JSON.stringify(contentToTrack);
                        
                        if (lastContentHash && lastContentHash !== newContentHash) {
                            console.log('📝 Content changed detected, reloading preview');
                            console.log('🔍 Old hash:', lastContentHash.substring(0, 50) + '...');
                            console.log('🔍 New hash:', newContentHash.substring(0, 50) + '...');
                            
                            // Small delay to ensure changes are saved
                            setTimeout(() => {
                                reloadPreview();
                            }, 500);
                        }
                        
                        setLastContentHash(newContentHash);
                    }
                }, (error) => {
                    console.error('❌ Content listener error:', error);
                });

                // Cleanup function
                return () => {
                    console.log('🔧 Cleaning up content listener');
                    unsubscribe();
                };
                
            } catch (error) {
                console.error('❌ Error setting up content listener:', error);
            }
        }

        initializePreview();
    }, []); // Empty dependency array - runs once on mount

    useEffect(() => {
        // 3D animation setup - only run if elements exist
        const container = document.getElementById("container");
        const inner = document.getElementById("inner");

        if (!container || !inner) {
            console.log('🔍 Preview: 3D elements not found, skipping animation setup');
            return;
        }

        console.log('✅ Preview: Setting up 3D animations');

        // Mouse tracking object
        const mouse = {
            _x: 0,
            _y: 0,
            x: 0,
            y: 0,
            updatePosition: function (event) {
                const e = event || window.event;
                this.x = e.clientX - this._x;
                this.y = (e.clientY - this._y) * -1;
            },
            setOrigin: function (e) {
                this._x = e.offsetLeft + Math.floor(e.offsetWidth / 2);
                this._y = e.offsetTop + Math.floor(e.offsetHeight / 2);
            },
            show: function () {
                return "(" + this.x + ", " + this.y + ")";
            },
        };

        // Track the mouse position relative to the center of the container
        mouse.setOrigin(container);

        let counter = 0;
        const updateRate = 10;
        const isTimeToUpdate = function () {
            return counter++ % updateRate === 0;
        };

        const onMouseEnterHandler = function (event) {
            update(event);
        };

        const onMouseLeaveHandler = function () {
            inner.style = "";
        };

        const onMouseMoveHandler = function (event) {
            if (isTimeToUpdate()) {
                update(event);
            }
        };

        const update = function (event) {
            mouse.updatePosition(event);
            updateTransformStyle(
                (mouse.y / inner.offsetHeight / 2).toFixed(2),
                (mouse.x / inner.offsetWidth / 2).toFixed(2)
            );
        };

        const updateTransformStyle = function (x, y) {
            const style = `rotateX(${x}deg) rotateY(${y}deg) scale(0.8)`;
            inner.style.transform = style;
            inner.style.webkitTransform = style;
            inner.style.mozTransform = style;
            inner.style.msTransform = style;
            inner.style.oTransform = style;
        };

        // Attach event listeners
        container.onmouseenter = onMouseEnterHandler;
        container.onmouseleave = onMouseLeaveHandler;
        container.onmousemove = onMouseMoveHandler;

        // Cleanup function
        return () => {
            if (container) {
                container.onmouseenter = null;
                container.onmouseleave = null;
                container.onmousemove = null;
            }
        };
    }, []);

    // 🔧 Manual refresh function (for debug purposes)
    const handleManualRefresh = () => {
        console.log('🔄 Manual refresh triggered');
        reloadPreview();
    };

    // 🔧 Show loading state until we have a username
    const showIframe = !isLoading && username && !error;
    const showLoading = isLoading || (!username && !error);

    return (
        <div className="w-[35rem] md:grid hidden place-items-center border-l ml-4 relative">
            
            {/* 🔧 Debug info (development only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs">
                    <div className="font-bold mb-1">🔍 Preview Status:</div>
                    <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                    <div>Username: {username || 'None'}</div>
                    <div>Show iframe: {showIframe ? 'Yes' : 'No'}</div>
                    <div>Iframe key: {iframeKey}</div>
                    <div>Content hash: {lastContentHash ? '✅' : '❌'}</div>
                    {error && <div className="text-red-300">Error: {error}</div>}
                    <button 
                        onClick={handleManualRefresh}
                        className="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                        🔄 Manual Refresh
                    </button>
                </div>
            )}

            <div className='w-fit h-fit' id='container'>
                <div className="h-[45rem] scale-[0.8] w-[23rem] bg-black rounded-[3rem] grid place-items-center" id="inner">
                    <div className="h-[97.5%] w-[95%] bg-white bg-opacity-[.1] grid place-items-center rounded-[2.5rem] overflow-hidden relative border">
                        
                        {/* Phone camera notch */}
                        <div className='absolute h-[20px] w-[20px] rounded-full top-2 bg-black'></div>
                        
                        {/* Loading indicator - show while loading or when no iframe */}
                        {showLoading && (
                            <div className='top-6 left-6 absolute pointer-events-none z-10'>
                                <Image 
                                    src={"https://linktree.sirv.com/Images/gif/loading.gif"} 
                                    width={25} 
                                    height={25} 
                                    alt="loading" 
                                    className="mix-blend-screen" 
                                />
                            </div>
                        )}
                        
                        {/* Content change indicator */}
                        {iframeKey > 0 && (
                            <div className='top-6 right-6 absolute pointer-events-none z-10'>
                                <div className="bg-green-500 text-white text-xs px-2 py-1 rounded animate-pulse">
                                    Updated!
                                </div>
                            </div>
                        )}
                        
                        {/* Main content area */}
                        <div className="h-full w-full">
                            {showIframe ? (
                                // 🔧 Smart iframe with key-based reloading
                                <iframe 
                                    key={`preview-${username}-${iframeKey}`} // Only changes when content changes
                                    ref={iframeRef}
                                    src={`https://www.tapit.fr/${username}?preview=true&v=${iframeKey}`}
                                    frameBorder="0" 
                                    className='h-full bg-white w-full'
                                    title={`Preview for ${username}`}
                                    onLoad={() => {
                                        console.log(`✅ Preview iframe loaded (v${iframeKey}) for:`, username);
                                    }}
                                    onError={(e) => {
                                        console.error('❌ Preview iframe failed to load:', e);
                                        setError('Failed to load preview');
                                    }}
                                />
                            ) : error ? (
                                // Error state
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 p-4 text-center">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <div className="text-sm font-medium mb-2">Preview Error</div>
                                    <div className="text-xs text-gray-500 mb-4">{error}</div>
                                    <button 
                                        onClick={() => {
                                            setError(null);
                                            setIsLoading(true);
                                            window.location.reload();
                                        }}
                                        className="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                    >
                                        🔄 Retry
                                    </button>
                                </div>
                            ) : (
                                // Loading/empty state
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <div className="text-4xl mb-4">⏳</div>
                                    <div className="text-sm">Preparing preview...</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}