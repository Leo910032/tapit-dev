// app/[userId]/elements/themes/LakeWhite.jsx
import Image from "next/image";

export default function LakeWhite({ photoUrl }) {
    return (
        <>
            <div className="fixed h-screen w-screen z-0 top-0 left-0 opacity-70 overflow-hidden">
                {photoUrl && (
                    <Image
                        src={photoUrl}
                        alt="background"
                        fill
                        sizes="100vw"
                        className="object-cover scale-[1.25]"
                        priority
                    />
                )}
            </div>
            <div className="fixed h-screen w-screen bg-gray-200 z-10 top-0 left-0 bg-opacity-[0.55] backdrop-blur-[50px]"></div>
        </>
    )
}