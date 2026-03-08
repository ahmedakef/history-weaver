import React, { createContext, useContext, useState, useCallback } from "react";

export type Language = "en" | "ar";
export type CalendarSystem = "gregorian" | "hijri";

interface I18nContextType {
  lang: Language;
  setLang: (l: Language) => void;
  calendar: CalendarSystem;
  setCalendar: (c: CalendarSystem) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    title: "Historical Figures",
    subtitle: "Explore the lives and connections of scholars, rulers, and thinkers across history",
    filter_label: "Filter by category",
    clear_all: "Clear all",
    loading: "Loading...",
    error: "Failed to load data",
    no_results: "No figures match the selected filters",
    footer_note: "Data is stored in",
    footer_edit: "— edit it to add more historical figures",
    relations: "Relations",
    colleague: "Colleague of",
    language: "Language",
    calendar: "Calendar",
    gregorian: "Gregorian",
    hijri: "Hijri",
  },
  ar: {
    title: "شخصيات تاريخية",
    subtitle: "استكشف حياة وعلاقات العلماء والحكام والمفكرين عبر التاريخ",
    filter_label: "تصفية حسب الفئة",
    clear_all: "مسح الكل",
    loading: "جاري التحميل...",
    error: "فشل في تحميل البيانات",
    no_results: "لا توجد شخصيات تطابق الفلاتر المحددة",
    footer_note: "البيانات مخزنة في",
    footer_edit: "— عدّلها لإضافة المزيد من الشخصيات التاريخية",
    relations: "العلاقات",
    science: "علوم",
    religion: "دين",
    authority: "سلطة",
    philosophy: "فلسفة",
    father_of: "والد",
    mother_of: "والدة",
    child_of: "ابن/ابنة",
    teacher_of: "أستاذ",
    student_of: "تلميذ",
    influenced: "أثّر على",
    colleague: "زميل",
    language: "اللغة",
    calendar: "التقويم",
    gregorian: "ميلادي",
    hijri: "هجري",
  },
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");
  const [calendar, setCalendar] = useState<CalendarSystem>("gregorian");

  const t = useCallback(
    (key: string) => translations[lang][key] || key,
    [lang]
  );

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, calendar, setCalendar, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
