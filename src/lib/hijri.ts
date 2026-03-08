/**
 * Approximate Gregorian-to-Hijri year conversion.
 * Uses the standard approximation formula.
 */
export function gregorianToHijri(year: number): number {
  return Math.round((year - 622) * (33 / 32));
}

function toArabicNumerals(n: number): string {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
}

export function formatYear(year: number, calendar: "gregorian" | "hijri", lang: "en" | "ar" = "en"): string {
  const isAr = lang === "ar";
  if (calendar === "hijri") {
    const h = gregorianToHijri(year);
    return isAr ? `${toArabicNumerals(h)} هـ` : `${h} AH`;
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
