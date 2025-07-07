import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { HouseContext } from "../House";
import { useTranslation } from "@/lib/useTranslation";

export default function SensitiveWarning() {
    const { setSensitiveWarning, sensitiveType } = useContext(HouseContext);
    const { t } = useTranslation();
    const router = useRouter();

    const handleBack = () =>{
        router.back();
    }

    const handleProceed = () => { 
        setSensitiveWarning(false);
    }

    return (
        <div className="h-screen w-screen grid place-items-center p-5" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), linear-gradient(125deg, rgb(11, 175, 255), rgb(57, 224, 155) 50%, rgb(255, 194, 19))`}}>
            <main className="flex flex-col gap-4 text-white max-w-[40rem] w-full items-center">
                <Image
                    src={"https://linktree.sirv.com/Images/icons/close-eye.svg"}
                    alt={"icon"}
                    width={30}
                    height={30}
                />
                <h1 className="font-bold sm:text-2xl text-xl">{t('sensitive.title')}</h1>
                <p className="sm:text-xl text-center">{t('sensitive.description')}</p>

                <div className="my-4 w-full">
                    <div className="p-3 font-semibold text-center hover:scale-105 active:scale-90 border border-white border-opacity-50 hover:border-opacity-100 w-full rounded-xl cursor-pointer" onClick={handleProceed}>
                        {sensitiveType === 3 ? t('sensitive.continue') : 
                         sensitiveType === 2 ? t('sensitive.over_25') : 
                         sensitiveType === 1 ? t('sensitive.over_21') : 
                         t('sensitive.over_18')}
                    </div>
                    <div className="p-3 font-semibold text-center hover:scale-105 active:scale-90 w-full rounded-xl cursor-pointer" onClick={handleBack}>
                        {sensitiveType === 3 ? t('sensitive.go_back') : 
                         sensitiveType === 2 ? t('sensitive.under_25') : 
                         sensitiveType === 1 ? t('sensitive.under_21') : 
                         t('sensitive.under_18')}
                    </div>
                </div>
            </main>
        </div>
    );
}