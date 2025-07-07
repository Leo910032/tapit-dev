// app/dashboard/(dashboard pages)/appearance/elements/FileManager.jsx
"use client"

// Test imports one by one
import { useRef, useState, useEffect } from "react";

// Test 1: Basic utilities
import { generateUniqueId } from "@/lib/utilities";

// Test 2: Firebase imports
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";
import { appStorage, fireApp } from "@/important/firebase";
import { collection, doc, onSnapshot } from "firebase/firestore";

// Test 3: Your custom imports
import { updateProfileFile } from "@/lib/fileUpload";
import { testForActiveSession } from "@/lib/authentication/testForActiveSession";
import { useTranslation } from "@/lib/useTranslation";

// Test 4: External libraries
import { toast } from "react-hot-toast";

// Test 5: Icons - SAFE IMPORTS
import { FaCheck, FaFile, FaDownload, FaTrash } from "react-icons/fa6";

export default function FileManager() {
    const { t } = useTranslation();
    const [uploadedFile, setUploadedFile] = useState('');
    const [currentFile, setCurrentFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [fileSize, setFileSize] = useState(0);
    const [fileName, setFileName] = useState('');
    const [customFileName, setCustomFileName] = useState(''); // New state for custom name
    const inputRef = useRef();
    const formRef = useRef();

    // File size limit: 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName) => {
        const extension = fileName?.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return '📄';
            case 'doc':
            case 'docx':
                return '📝';
            case 'xls':
            case 'xlsx':
                return '📊';
            case 'ppt':
            case 'pptx':
                return '📽️';
            case 'txt':
                return '📃';
            default:
                return '📎';
        }
    };

    // Function to get file name without extension
    const getFileNameWithoutExtension = (filename) => {
        return filename.substring(0, filename.lastIndexOf('.')) || filename;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            return;
        }

        // Check file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error(t('file_manager.file_too_large', { maxSize: '50MB' }) || 'File is too large. Maximum size is 50MB', {
                style: {
                    border: '1px solid #EF4444',
                    padding: '16px',
                    color: '#EF4444',
                },
            });
            return;
        }

        setUploadedFile(selectedFile);
        setFileName(selectedFile.name);
        setFileSize(selectedFile.size);
        // Set default custom name to file name without extension
        setCustomFileName(getFileNameWithoutExtension(selectedFile.name));
        setPreviewing(true);
    };

    const handleUploadFile = async () => {
        if (uploadedFile === "") {
            return;
        }

        const fileExtension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1);
        const storageFileName = `${generateUniqueId()}.${fileExtension}`;
        const storageRef = ref(appStorage, `profileFiles/${storageFileName}`);
        let fileUrl = '';

        await uploadBytes(storageRef, uploadedFile).then(async (snapshot) => {
            await getDownloadURL(snapshot.ref).then((url) => {
                fileUrl = url;
            });
        });

        return {
            url: fileUrl,
            name: customFileName.trim() || getFileNameWithoutExtension(uploadedFile.name), // Use custom name
            originalFileName: uploadedFile.name, // Store original filename
            size: uploadedFile.size,
            type: fileExtension,
            uploadedAt: new Date().toISOString()
        };
    };

    const handleUpdateFile = async () => {
        // Validate custom file name
        if (!customFileName.trim()) {
            toast.error(t('file_manager.name_required') || 'Please enter a name for the file');
            return;
        }

        setIsLoading(true);
        try {
            const fileData = await handleUploadFile();
            await updateProfileFile(fileData);
            setIsLoading(false);
            handleReset();
            toast.success(t('file_manager.file_uploaded_success') || 'File uploaded successfully!');
        } catch (error) {
            setIsLoading(false);
            toast.error(t('file_manager.upload_error') || 'Failed to upload file');
            console.error('Upload error:', error);
        }
    };

    const handleRemoveFile = async () => {
        setIsRemoving(true);
        try {
            await updateProfileFile(null);
            setIsRemoving(false);
            toast.success(t('file_manager.file_removed_success') || 'File removed successfully!');
        } catch (error) {
            setIsRemoving(false);
            toast.error(t('file_manager.remove_error') || 'Failed to remove file');
            console.error('Remove error:', error);
        }
    };

    const handleDownloadFile = () => {
        if (currentFile?.url) {
            window.open(currentFile.url, '_blank');
        }
    };

    const toastHandler = () => {
        const promise = handleUpdateFile();
        toast.promise(
            promise,
            {
                loading: t('file_manager.uploading_file') || "Uploading file...",
                success: t('file_manager.file_uploaded') || "File uploaded!",
                error: t('file_manager.upload_failed') || "Upload failed"
            },
            {
                style: {
                    border: '1px solid #8129D9',
                    padding: '16px',
                    color: '#8129D9',
                },
                iconTheme: {
                    primary: '#8129D9',
                    secondary: '#FFFAEE',
                },
            }
        );
    };

    const handleReset = () => {
        if (isLoading) {
            return;
        }
        if (formRef.current) {
            formRef.current.reset();
        }
        setUploadedFile('');
        setFileName('');
        setFileSize(0);
        setCustomFileName('');
        setPreviewing(false);
    };

    useEffect(() => {
        function fetchCurrentFile() {
            const currentUser = testForActiveSession();
            if (!currentUser) return;
            
            const collectionRef = collection(fireApp, "AccountData");
            const docRef = doc(collectionRef, `${currentUser}`);

            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const { profileFile } = docSnap.data();
                    setCurrentFile(profileFile || null);
                }
            });

            return () => unsubscribe();
        }
        
        const cleanup = fetchCurrentFile();
        return cleanup;
    }, []);

    return (
        <div className="w-full p-6 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
                {t('file_manager.curriculum_documents') || 'Curriculum / Documents'}
            </h3>
            
            {/* Current File Display */}
            {currentFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFileIcon(currentFile.originalFileName || currentFile.name)}</span>
                            <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                    {currentFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(currentFile.size)} • {currentFile.type?.toUpperCase()}
                                </p>
                                {currentFile.originalFileName && currentFile.originalFileName !== currentFile.name && (
                                    <p className="text-xs text-gray-400 italic truncate max-w-[200px]">
                                        Original: {currentFile.originalFileName}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadFile}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t('file_manager.download') || 'Download'}
                            >
                                <FaDownload className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRemoveFile}
                                disabled={isRemoving}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title={t('file_manager.remove') || 'Remove'}
                            >
                                {isRemoving ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <FaTrash className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className="flex gap-2">
                <input 
                    type="file" 
                    className="absolute opacity-0 pointer-events-none" 
                    ref={inputRef} 
                    accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileChange} 
                />
                
                <button
                    className="flex-1 flex items-center gap-3 justify-center p-3 rounded-lg cursor-pointer active:scale-95 active:opacity-60 active:translate-y-1 hover:scale-[1.005] bg-btnPrimary text-white text-sm"
                    onClick={() => inputRef.current?.click()}
                >
                    <FaFile className="w-4 h-4" />
                    {currentFile ? 
                        (t('file_manager.replace_file') || 'Replace File') : 
                        (t('file_manager.upload_file') || 'Upload File')
                    }
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
                {t('file_manager.supported_formats') || 'PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT'} • {t('file_manager.max_size_50mb') || 'Max 50MB'}
            </p>

            {/* Preview Modal with Custom Name Input */}
            {previewing && (
                <div className="fixed top-0 left-0 h-screen w-screen grid place-items-center z-[999999999999999]">
                    <div 
                        className="absolute h-full w-full bg-black bg-opacity-25 backdrop-blur-sm top-0 left-0 p-2" 
                        onClick={handleReset}
                    ></div>
                    
                    <form ref={formRef} className="relative z-10 max-w-md w-full mx-4">
                        <div className="bg-white rounded-xl p-6 shadow-xl">
                            <div className="text-center mb-4">
                                <div className="text-4xl mb-3">{getFileIcon(fileName)}</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {t('file_manager.confirm_upload') || 'Confirm Upload'}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">{fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(fileSize)}</p>
                            </div>

                            {/* Custom File Name Input */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ✏️ {t('file_manager.custom_name') || 'Display Name'}
                                </label>
                                <input
                                    type="text"
                                    value={customFileName}
                                    onChange={(e) => setCustomFileName(e.target.value)}
                                    placeholder={t('file_manager.enter_custom_name') || 'Enter a custom name for this file'}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    disabled={isLoading}
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('file_manager.name_help') || 'This is how the file will be displayed. Leave blank to use the original filename.'}
                                </p>
                            </div>

                            {isLoading && (
                                <div className="absolute inset-0 bg-white bg-opacity-90 grid place-items-center rounded-xl">
                                    <div className="text-center">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <p className="text-sm text-gray-600">
                                            {t('file_manager.uploading') || 'Uploading...'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                >
                                    {t('common.cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 px-4 py-2 bg-btnPrimary text-white rounded-lg hover:bg-btnPrimaryAlt transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={toastHandler}
                                    disabled={isLoading || !customFileName.trim()}
                                >
                                    <FaCheck className="w-4 h-4" />
                                    {t('file_manager.upload') || 'Upload'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}