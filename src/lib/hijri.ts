/**
 * Approximate Gregorian-to-Hijri year conversion.
 * Uses the standard approximation formula.
 * Returns null for dates before the Hijra (before ~622 CE).
 */
export function gregorianToHijri(year: number): number | null {
  if (year < 622) return null;
  return Math.round((year - 622) * (33 / 32));
}

function toArabicNumerals(n: number): string {
  const abs = Math.abs(n);
  return abs.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export function formatYear(year: number, calendar: "gregorian" | "hijri", lang: "en" | "ar" = "en"): string {
  const isAr = lang === "ar";
  if (calendar === "hijri") {
    const h = gregorianToHijri(year);
    if (h === null) {
      // Pre-Islamic: show Gregorian with BCE label
      const abs = Math.abs(year);
      return isAr ? `${toArabicNumerals(abs)} ق.م` : `${abs} BCE`;
    }
    return isAr ? `${toArabicNumerals(h)} هـ` : `${h} AH`;
  }
  if (year <= 0) {
    // Year 0 = 1 BCE, year -1 = 2 BCE, etc.
    const bce = 1 - year;
    return isAr ? `${toArabicNumerals(bce)} ق.م` : `${bce} BCE`;
  }
  return isAr ? `${toArabicNumerals(year)} م` : `${year} CE`;
}

export function formatRange(
  born: number,
  died: number,
  calendar: "gregorian" | "hijri",
  lang: "en" | "ar" = "en"
): string {
  return `${formatYear(born, calendar, lang)} – ${formatYear(died, calendar, lang)}`;
}
