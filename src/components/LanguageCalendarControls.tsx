import { useI18n, type Language } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function LanguageCalendarControls() {
  const { lang, setLang, calendar, setCalendar, t } = useI18n();

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Language selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-body">{t("language")}</span>
        <Select value={lang} onValueChange={(v) => setLang(v as Language)}>
          <SelectTrigger className="w-[120px] h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calendar toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground font-body">{t("gregorian")}</span>
        <Switch
          checked={calendar === "hijri"}
          onCheckedChange={(checked) =>
            setCalendar(checked ? "hijri" : "gregorian")
          }
        />
        <span className="text-xs text-muted-foreground font-body">{t("hijri")}</span>
      </div>
    </div>
  );
}
