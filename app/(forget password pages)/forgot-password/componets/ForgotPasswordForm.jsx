"use client"
import { useDebounce } from "@/LocalHooks/useDebounce";
import { fireApp } from "@/important/firebase";
import { sendResetUrl } from "@/lib/authentication/sendResetUrl";
import { generateRandomId, validateEmail } from "@/lib/utilities";
import { collection, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCheck, FaX } from "react-icons/fa6";
import { useTranslation } from "@/lib/useTranslation";

export default function ForgotPasswordForm() {
    const router = useRouter();
    const { t, locale } = useTranslation(); // Get current locale from translation hook
    const [emailText, setEmailText]= useState("");
    const [existingEmail, setExistingEmail] = useState([]);
    const [canProceed, setCanProceed] = useState(false);

    const debouncedEmail = useDebounce(emailText, 500);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [hasError, setHasError]= useState({
            email: 0,
    });

    useEffect(() => {
        function fetchExistingUsername() {
            const existingEmails = [];
        
            const collectionRef = collection(fireApp, "accounts");
        
            onSnapshot(collectionRef, (querySnapshot) => {
                querySnapshot.forEach((credential) => {
                    const data = credential.data();
                    const { email } = data;
                    existingEmails.push(email);
                });
                
                setExistingEmail(existingEmails);
            });
        }

        fetchExistingUsername();
    }, []);

    const handleSubmit = (e) =>{
        e.preventDefault();
        if (!canProceed && isLoading) return;
        setIsLoading(true);
        const currentTime = new Date();
        const oneHourLater = new Date(currentTime.getTime() + (1 * 60 * 60 * 1000));
        const timestampOneHourLater = oneHourLater.getTime();

        const uid = generateRandomId();

        const payload = {
            uid: uid,
            email: debouncedEmail,
            expiresIn: timestampOneHourLater,
            language: locale // ✅ Pass current language from translation hook
        }
            
        const promise = sendResetUrl(payload);

        toast.promise(promise, {
            error: t('forgot_password.error_link_sent'),
            success: t('forgot_password.reset_link_sent'),
            loading: t("forgot_password.sending_request")
        }).then(()=>{
            setEmailText("");
            setTimeout(() => {
                setCanProceed(false);
                router.push("/login");
            }, 1000);
        }).catch((error)=>{
            setHasError({ ...hasError, email: 1 });
            setIsLoading(false);
            setErrorMessage(t("forgot_password.error_occurred"));
            console.error(error)
        });
    }

    useEffect(() => {
        if (debouncedEmail !== "") {
            if (!validateEmail(debouncedEmail)) {
                setHasError((prevData) => ({ ...prevData, email: 1 }));
                setErrorMessage(t("forgot_password.invalid_email"));
                return;
            }

            if (!existingEmail.includes(String(debouncedEmail).toLowerCase())) {
                setHasError((prevData) => ({ ...prevData, email: 1 }));
                setErrorMessage(t("forgot_password.not_registered"));
                return;
            }

            setHasError((prevData) => ({ ...prevData, email: 2 }));
            return;
        } else {
            setHasError((prevData) => ({ ...prevData, email: 0 }));
        }

    }, [debouncedEmail, existingEmail]);

    useEffect(()=>{
        if (hasError.email <= 1) {
            setCanProceed(false);
            return;
        }

        setCanProceed(true);
        setErrorMessage("");
    }, [hasError]);
    
    return (
        <div className="flex-1 sm:p-12 px-4 py-8 flex flex-col overflow-y-auto">
            <Link href={'/'} className="sm:p-0 p-3">
                <Image src={"https://firebasestorage.googleapis.com/v0/b/lintre-ffa96.firebasestorage.app/o/Logo%2Fimage-removebg-preview.png?alt=media&token=4ac6b2d0-463e-4ed7-952a-2fed14985fc0"} alt="logo" height={150} width={150} className="filter invert" priority />
            </Link>
            <section className="mx-auto py-10 w-full sm:w-5/6 md:w-3/4 lg:w-2/3 xl:w-1/2 flex-1 flex flex-col justify-center">
            <p className="text-2xl sm:text-5xl md:text-3xl font-extrabold text-center"> {t('forgot_password.rest_link_request')} </p>
                <form className="py-8 sm:py-12 flex flex-col gap-4 sm:gap-6 w-full" onSubmit={handleSubmit}>
                    <div className={`flex items-center py-2 sm:py-3 px-2 sm:px-6 rounded-md myInput ${hasError.email === 1 ? "hasError" : hasError.username === 2 ? "good" : ""} bg-black bg-opacity-5 text-base sm:text-lg w-full`}>
                        <input
                            type="email"
                            placeholder= {t('forgot_password.provide_email')}
                            className="outline-none border-none bg-transparent ml-1 py-3 flex-1 text-sm sm:text-base"
                            value={emailText}
                            name="email"
                            onChange={(e) => setEmailText(e.target.value)}
                            required
                        />
                        {hasError.email === 1 ?
                            <FaX className="text-red-500 text-sm cursor-pointer" onClick={() => setEmailText("")} />
                            :
                            hasError.email === 2 ?
                                <FaCheck className="text-themeGreen cursor-pointer" />
                                :
                                ""
                        }
                    </div>

                    <Link href={"/login"} className="w-fit hover:rotate-2 hover:text-themeGreen origin-left">{t('forgot_password.remenber_password')}</Link>

                    <button type="submit" className={
                        `rounded-md py-4 sm:py-5 grid place-items-center font-semibold ${canProceed? "cursor-pointer active:scale-95 active:opacity-40 hover:scale-[1.025] bg-themeGreen mix-blend-screen" : "cursor-default opacity-50 "}`
                    }>
                        {!isLoading && <span className="nopointer">{t('forgot_password.sending_request')}</span>}
                        {isLoading && <Image src={"https://linktree.sirv.com/Images/gif/loading.gif"} width={25} height={25} alt="loading" className=" mix-blend-screen" />}
                    </button>

                    {!isLoading && <span className="text-sm text-red-500 text-center">{errorMessage}</span>}
                </form>
                <p className="text-center sm:text-base text-sm"><span className="opacity-60">{t('forgot_password.not_registered')}</span> <Link href={"/signup"} className="text-themeGreen">{t('forgot_password.sign_up')}</Link> </p>
            </section>

        </div>
    )
}
