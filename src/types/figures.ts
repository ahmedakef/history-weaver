export type Category = "science" | "religion" | "authority" | "philosophy";

export type RelationType =
  | "father_of"
  | "mother_of"
  | "child_of"
  | "teacher_of"
  | "student_of"
  | "influenced"
  | "colleague";

export interface Relation {
  type: RelationType;
  target: string;
}

/** Supports either a plain string or a map of language codes to strings */
export type Translatable = string | Record<string, string>;

export interface Figure {
  id: string;
  name: Translatable;
  born: number;
  died: number;
  categories: Category[];
  description: Translatable;
  relations?: Relation[];
}

export interface CategoryDef {
  id: Category;
  name: Translatable;
}

export interface FiguresData {
  categories: CategoryDef[];
  figures: Figure[];
}

/** Resolve a Translatable field to a string for the given language */
export function resolveTranslation(value: Translatable, lang: string): string {
  if (typeof value === "string") return value;
  return value[lang] || value["en"] || Object.values(value)[0] || "";
}
