/**
 * Approximate Gregorian-to-Hijri year conversion.
 * Uses the standard approximation formula.
 */
export function gregorianToHijri(year: number): number {
  return Math.round((year - 622) * (33 / 32));
}

export function formatYear(year: number, calendar: "gregorian" | "hijri"): string {
  if (calendar === "hijri") {
    const h = gregorianToHijri(year);
    return `${h} AH`;
  }
  return `${year} CE`;
}

export function formatRange(
  born: number,
  died: number,
  calendar: "gregorian" | "hijri"
): string {
  return `${formatYear(born, calendar)} – ${formatYear(died, calendar)}`;
}
