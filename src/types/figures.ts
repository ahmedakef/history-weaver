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
  categories: string[];
  description: Translatable;
  relations?: Relation[];
  wikipedia?: Record<string, string>;
}

export interface CategoryDef {
  id: string;
  name: Translatable;
  color?: string;
  children?: CategoryDef[];
}

export interface RelationTypeDef {
  id: RelationType;
  name: Translatable;
}

export interface FiguresData {
  categories: CategoryDef[];
  relation_types: RelationTypeDef[];
  figures: Figure[];
}

/** Resolve a Translatable field to a string for the given language */
export function resolveTranslation(value: Translatable, lang: string): string {
  if (typeof value === "string") return value;
  return value[lang] || value["en"] || Object.values(value)[0] || "";
}

/**
 * Build a map from each category id to its root ancestor id.
 * Also build a map from each category id to all its descendant ids (including itself).
 */
export function buildCategoryMaps(categories: CategoryDef[]) {
  const rootMap = new Map<string, string>(); // catId -> root catId
  const descendantsMap = new Map<string, Set<string>>(); // catId -> all descendants including self

  function walk(cat: CategoryDef, rootId: string) {
    rootMap.set(cat.id, rootId);
    const descendants = new Set<string>([cat.id]);
    if (cat.children) {
      for (const child of cat.children) {
        walk(child, rootId);
        const childDescs = descendantsMap.get(child.id)!;
        childDescs.forEach((d) => descendants.add(d));
      }
    }
    descendantsMap.set(cat.id, descendants);
  }

  for (const cat of categories) {
    walk(cat, cat.id);
  }

  return { rootMap, descendantsMap };
}

/** Flatten a category tree into a flat list */
export function flattenCategories(categories: CategoryDef[]): CategoryDef[] {
  const result: CategoryDef[] = [];
  function walk(cat: CategoryDef) {
    result.push(cat);
    if (cat.children) cat.children.forEach(walk);
  }
  categories.forEach(walk);
  return result;
}
