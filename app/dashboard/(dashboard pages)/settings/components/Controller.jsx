"use client" // THIS COULD CAUSE PROBLEM 
import DropDown from "./mini components/DropDown";
import { useTranslation } from "@/lib/useTranslation";

export default function Controller() {
    const { t } = useTranslation();
    return (
        <div className="w-full sm:px-6 px-3 py-3 text-sm rounded-2xl border-b border-l border-r bg-white mb-4 sm:grid sm:grid-cols-2 sm:gap-0 gap-4 flex justify-between items-center sticky top-0 z-10">
            <span className="font-semibold">{t("controller.jump _to")}</span>
            <DropDown />
        </div>
    );
}
