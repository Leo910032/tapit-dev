import SelectFonts from "../elements/SelectFonts";
import { useTranslation } from "@/lib/useTranslation";
export default function FontsOptions() {
     const { t } = useTranslation();
    return (
        <div className="w-full bg-white rounded-3xl my-3 flex flex-col p-6">
            <span className="font-semibold text-sm">{t("fontsoptions.font")}</span>
            <SelectFonts />
        </div>
    );
}